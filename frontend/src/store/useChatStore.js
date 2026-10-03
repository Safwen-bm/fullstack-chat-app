import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { getErrorMessage } from "../lib/errors";
import { useAuthStore } from "./useAuthStore";

const PAGE_SIZE = 40;

// one set of socket listeners for the whole app
let activeSocket = null;
let activeHandlers = null;
const typingTimers = {};

const toLastMessage = (m) => ({
  text: m.text || "",
  hasImage: !!m.image,
  senderId: m.senderId,
  createdAt: m.createdAt,
});

const withLastMessage = (users, userId, message) =>
  users.map((u) => (u._id === userId ? { ...u, lastMessage: toLastMessage(message) } : u));

export const useChatStore = create((set, get) => ({
  messages: [],
  hasMoreMessages: false,
  users: [], // each user has lastMessage and unreadCount
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isLoadingOlder: false,
  typingUsers: {}, // { userId: boolean }

  getUsers: async ({ silent = false } = {}) => {
    if (!silent) set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      if (!silent) toast.error(getErrorMessage(error));
    } finally {
      if (!silent) set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId, { silent = false } = {}) => {
    if (!silent) set({ isMessagesLoading: true, hasMoreMessages: false });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, {
        params: { limit: PAGE_SIZE },
      });
      // ignore the answer if the user already opened another chat
      if (get().selectedUser?._id === userId) {
        set({ messages: res.data.messages, hasMoreMessages: res.data.hasMore });
      }
    } catch (error) {
      if (!silent) toast.error(getErrorMessage(error));
    } finally {
      if (!silent && get().selectedUser?._id === userId) set({ isMessagesLoading: false });
    }
  },

  loadOlderMessages: async () => {
    const { selectedUser, messages, hasMoreMessages, isLoadingOlder } = get();
    const oldest = messages.find((m) => !m.pending);
    if (!selectedUser || !oldest || !hasMoreMessages || isLoadingOlder) return false;

    const userId = selectedUser._id;
    set({ isLoadingOlder: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`, {
        params: { limit: PAGE_SIZE, before: oldest._id },
      });
      if (get().selectedUser?._id !== userId) return false;

      set((state) => {
        const known = new Set(state.messages.map((m) => m._id));
        const older = res.data.messages.filter((m) => !known.has(m._id));
        return {
          messages: [...older, ...state.messages],
          hasMoreMessages: res.data.hasMore,
        };
      });
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      set({ isLoadingOlder: false });
    }
  },

  // optimistic: the message shows immediately and is replaced by the saved one
  sendMessage: async ({ text, image }) => {
    const { selectedUser } = get();
    const authUser = useAuthStore.getState().authUser;
    if (!selectedUser || !authUser) return false;

    const receiverId = selectedUser._id;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const optimistic = {
      _id: tempId,
      senderId: authUser._id,
      receiverId,
      text,
      image,
      createdAt: new Date().toISOString(),
      seen: false,
      pending: true,
    };

    set((state) => ({
      messages: [...state.messages, optimistic],
      users: withLastMessage(state.users, receiverId, optimistic),
    }));

    try {
      const res = await axiosInstance.post(`/messages/send/${receiverId}`, { text, image });
      set((state) => ({
        messages: state.messages.map((m) => (m._id === tempId ? res.data : m)),
        users: withLastMessage(state.users, receiverId, res.data),
      }));
      return true;
    } catch (error) {
      set((state) => ({ messages: state.messages.filter((m) => m._id !== tempId) }));
      toast.error(getErrorMessage(error));
      return false;
    }
  },

  markAsRead: (userId) => {
    set((state) => ({
      users: state.users.map((u) =>
        u._id === userId && u.unreadCount ? { ...u, unreadCount: 0 } : u
      ),
    }));
    axiosInstance.put(`/messages/read/${userId}`).catch(() => {});
  },

  emitTyping: (to, isTyping) => {
    const socket = useAuthStore.getState().socket;
    if (socket?.connected && to) socket.emit("typing", { to, isTyping });
  },

  startMessageListener: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || (activeSocket === socket && activeHandlers)) return;

    get().stopMessageListener();

    const handleNewMessage = (msg) => {
      const senderId = String(msg.senderId);
      const { selectedUser, users } = get();
      const isOpen = selectedUser?._id === senderId;
      const isVisible = document.visibilityState === "visible";

      // someone new wrote to me: reload the list quietly
      if (!users.some((u) => u._id === senderId)) get().getUsers({ silent: true });

      set((state) => ({
        messages:
          isOpen && !state.messages.some((m) => m._id === msg._id)
            ? [...state.messages, msg]
            : state.messages,
        users: state.users.map((u) =>
          u._id === senderId
            ? {
                ...u,
                lastMessage: toLastMessage(msg),
                unreadCount: isOpen && isVisible ? 0 : (u.unreadCount || 0) + 1,
              }
            : u
        ),
        typingUsers: { ...state.typingUsers, [senderId]: false },
      }));

      if (isOpen && isVisible) {
        get().markAsRead(senderId);
      } else if (!isOpen) {
        const sender = users.find((u) => u._id === senderId);
        const preview = msg.text ? msg.text : "📷 Photo";
        toast(`${sender?.fullName ?? "New message"}: ${preview.slice(0, 60)}`, {
          id: `msg-${senderId}`,
          icon: "💬",
        });
      }
    };

    const handleTyping = ({ from, isTyping }) => {
      clearTimeout(typingTimers[from]);
      set((state) => ({ typingUsers: { ...state.typingUsers, [from]: !!isTyping } }));
      if (isTyping) {
        // safety net in case the "stopped typing" event never arrives
        typingTimers[from] = setTimeout(() => {
          set((state) => ({ typingUsers: { ...state.typingUsers, [from]: false } }));
        }, 4000);
      }
    };

    const handleMessagesSeen = ({ by }) => {
      set((state) =>
        state.selectedUser?._id === by
          ? {
              messages: state.messages.map((m) =>
                m.senderId !== by && !m.seen ? { ...m, seen: true } : m
              ),
            }
          : state
      );
    };

    // after a connection drop, catch up on what was missed
    let connectedBefore = socket.connected;
    const handleConnect = () => {
      if (connectedBefore) {
        get().getUsers({ silent: true });
        const open = get().selectedUser;
        if (open) get().getMessages(open._id, { silent: true });
      }
      connectedBefore = true;
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("connect", handleConnect);

    activeSocket = socket;
    activeHandlers = {
      newMessage: handleNewMessage,
      typing: handleTyping,
      messagesSeen: handleMessagesSeen,
      connect: handleConnect,
    };
  },

  stopMessageListener: () => {
    if (activeSocket && activeHandlers) {
      Object.entries(activeHandlers).forEach(([event, handler]) =>
        activeSocket.off(event, handler)
      );
    }
    activeSocket = null;
    activeHandlers = null;
  },

  setSelectedUser: (selectedUser) => {
    set((state) => {
      const sameUser = state.selectedUser?._id === selectedUser?._id;
      return {
        selectedUser,
        messages: sameUser ? state.messages : [],
        hasMoreMessages: sameUser ? state.hasMoreMessages : false,
        isMessagesLoading: sameUser ? state.isMessagesLoading : Boolean(selectedUser),
        isLoadingOlder: false,
      };
    });

    if (selectedUser) {
      const user = get().users.find((u) => u._id === selectedUser._id);
      if (user?.unreadCount > 0) get().markAsRead(selectedUser._id);
    }
  },

  // called on logout so the next account never sees the previous one's data
  resetChat: () => {
    Object.values(typingTimers).forEach(clearTimeout);
    set({
      messages: [],
      hasMoreMessages: false,
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      isLoadingOlder: false,
      typingUsers: {},
    });
  },
}));