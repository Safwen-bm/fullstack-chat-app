import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { getErrorMessage } from "../lib/errors";
import { useAuthStore } from "./useAuthStore";

// one global listener, not one per open chat
let activeSocket = null;
let activeHandler = null;

const previewOf = (message) => (message.text ? message.text : "📷 Photo");

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  unreadCounts: {}, // { userId: number }

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      // ignore the answer if the user already opened another chat
      if (get().selectedUser?._id === userId) set({ messages: res.data });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      if (get().selectedUser?._id === userId) set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser } = get();
    if (!selectedUser) return false;
    const receiverId = selectedUser._id;

    try {
      const res = await axiosInstance.post(`/messages/send/${receiverId}`, messageData);
      // only show it if that chat is still open; read the CURRENT list, not an old copy
      if (get().selectedUser?._id === receiverId) {
        set((state) => ({ messages: [...state.messages, res.data] }));
      }
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    }
  },

  startMessageListener: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket || (activeSocket === socket && activeHandler)) return;

    get().stopMessageListener();

    const handler = (newMessage) => {
      const { selectedUser, messages, users, unreadCounts } = get();

      // message for the chat that is open right now
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        if (messages.some((m) => m._id === newMessage._id)) return;
        set({ messages: [...messages, newMessage] });
        return;
      }

      // message from someone else: count it and notify
      const senderId = newMessage.senderId;
      set({ unreadCounts: { ...unreadCounts, [senderId]: (unreadCounts[senderId] || 0) + 1 } });

      const sender = users.find((u) => u._id === senderId);
      toast(`${sender?.fullName ?? "New message"}: ${previewOf(newMessage).slice(0, 60)}`, {
        id: `msg-${senderId}`,
        icon: "💬",
      });
    };

    socket.on("newMessage", handler);
    activeSocket = socket;
    activeHandler = handler;
  },

  stopMessageListener: () => {
    if (activeSocket && activeHandler) activeSocket.off("newMessage", activeHandler);
    activeSocket = null;
    activeHandler = null;
  },

  // kept so existing components keep working; the global listener does the job
  subscribeToMessages: () => get().startMessageListener(),
  unsubscribeFromMessages: () => {},

  setSelectedUser: (selectedUser) =>
    set((state) => {
      const sameUser = state.selectedUser?._id === selectedUser?._id;
      const unreadCounts = { ...state.unreadCounts };
      if (selectedUser) delete unreadCounts[selectedUser._id];

      return {
        selectedUser,
        unreadCounts,
        messages: sameUser ? state.messages : [],
        isMessagesLoading: selectedUser ? state.isMessagesLoading : false,
      };
    }),

  // called on logout so the next account never sees the previous one's data
  resetChat: () =>
    set({
      messages: [],
      users: [],
      selectedUser: null,
      unreadCounts: {},
      isUsersLoading: false,
      isMessagesLoading: false,
    }),
}));