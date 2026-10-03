import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import { getErrorMessage } from "../lib/errors.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      get().connectSocket();
    } catch {
      // a 401 here just means nobody is logged in
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    if (get().isSigningUp) return;
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    if (get().isLoggingIn) return;
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  // returns true on success so callers can react (profile page)
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    // already connected, or connecting / reconnecting: do not open a second one
    if (!authUser || socket?.active || socket?.connected) return;

    // the server identifies the user from the jwt cookie, so cookies must be sent
    const newSocket = io(BASE_URL, { withCredentials: true });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    // the socket stays in the store on purpose: other code may still read it
    const { socket } = get();
    if (socket) socket.disconnect();
  },
}));