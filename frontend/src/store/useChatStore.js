import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { getErrorMessage } from "../lib/errors";
import { playNotificationSound, showDesktopNotification } from "../lib/notify";
import { useAuthStore } from "./useAuthStore";
import { usePreferencesStore } from "./usePreferencesStore";

const PAGE_SIZE = 40;

// one set of socket listeners for the whole app
let activeSocket = null;
let activeHandlers = null;
const typingTimers = {};

const toLastMessage = (m) => ({
  _id: m._id,
  text: m.text || "",
  hasImage: !!m.image,
  deleted: !!m.deleted,
  senderId: m.senderId,
  createdAt: m.createdAt,
});

const withLastMessage = (users, userId, message) =>
  users.map((u) => (u._id === userId ? { ...u, lastMessage: toLastMessage(message) } : u));

const replaceMessage = (messages, updated) =>
  messages.map((m) => (m._id === updated._id ? updated : m));

const refreshLastMessage = (users, updated) =>
  users.map((u) =>
    u.lastMessage?._id === updated._id ? { ...u, lastMessage: toLastMessage(updated) } : u
  );

export const useChatStore = create((set, get) => ({
  messages: [],
  hasMoreMessages: false,
  users: [], // each user has lastMessage and unreadCount
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isLoadingOlder: false,
  typingUsers: {}, // { userId: boolean }
  editingMessage: null,

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
      reactions: [],
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

  // used by every edit, delete and reaction, local or coming from the socket
  applyMessageUpdate: (updated) =>
    set((state) => ({
      messages: replaceMessage(state.messages, updated),
      users: refreshLastMessage(state.users, updated),
    })),

  setEditingMessage: (editingMessage) => set({ editingMessage }),

  editMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.patch(`/messages/item/${messageId}`, { text });
      get().applyMessageUpdate(res.data);
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      const res = await axiosInstance.delete(`/messages/item/${messageId}`);
      get().applyMessageUpdate(res.data);
      if (get().editingMessage?._id === messageId) set({ editingMessage: null });
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  },

  // same emoji again removes it, another emoji replaces mine
  toggleReaction: async (messageId, emoji) => {
    const myId = useAuthStore.getState().authUser?._id;
    const current = get().messages.find((m) => m._id === messageId);
    if (!current || !myId) return;

    const mine = current.reactions?.find((r) => String(r.userId) === myId);
    const nextEmoji = mine?.emoji === emoji ? null : emoji;

    // show it instantly, fix it if the server refuses
    get().applyMessageUpdate({
      ...current,
      reactions: [
        ...(current.reactions ?? []).filter((r) => String(r.userId) !== myId),
        ...(nextEmoji ? [{ userId: myId, emoji: nextEmoji }] : []),
      ],
    });

    try {
      const res = await axiosInstance.put(`/messages/item/${messageId}/reaction`, {
        emoji: nextEmoji,
      });
      get().applyMessageUpdate(res.data);
    } catch (error) {
      get().applyMessageUpdate(current);
      toast.error(getErrorMessage(error));
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
      const sender = users.find((u) => u._id === senderId);

      // someone new wrote to me: reload the list quietly
      if (!sender) get().getUsers({ silent: true });

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

      if (isOpen && isVisible) get().markAsRead(senderId);

      // alerts only when the user is not already looking at this chat
      if (!isOpen || !isVisible) {
        const preview = msg.text ? msg.text : "📷 Photo";
        const prefs = usePreferencesStore.getState();

        if (!isOpen) {
          toast(`${sender?.fullName ?? "New message"}: ${preview.slice(0, 60)}`, {
            id: `msg-${senderId}`,
            icon: "💬",
          });
        }
        if (prefs.soundEnabled) playNotificationSound();
        if (!isVisible && prefs.desktopNotifications) {
          showDesktopNotification({
            title: sender?.fullName ?? "New message",
            body: preview.slice(0, 120),
            tag: senderId,
            onClick: () => {
              const user = get().users.find((u) => u._id === senderId);
              if (user) get().setSelectedUser(user);
            },
          });
        }
      }
    };

    const handleMessageUpdated = (msg) => {
      const myId = useAuthStore.getState().authUser?._id;
      const senderId = String(msg.senderId);
      const wasUnreadForMe = msg.deleted && String(msg.receiverId) === myId && !msg.seen;

      set((state) => ({
        messages: replaceMessage(state.messages, msg),
        users: refreshLastMessage(state.users, msg).map((u) =>
          wasUnreadForMe && u._id === senderId && u.unreadCount > 0
            ? { ...u, unreadCount: u.unreadCount - 1 }
            : u
        ),
      }));
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
    socket.on("messageUpdated", handleMessageUpdated);
    socket.on("typing", handleTyping);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("connect", handleConnect);

    activeSocket = socket;
    activeHandlers = {
      newMessage: handleNewMessage,
      messageUpdated: handleMessageUpdated,
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
        editingMessage: sameUser ? state.editingMessage : null,
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
      editingMessage: null,
    });
  },
}));