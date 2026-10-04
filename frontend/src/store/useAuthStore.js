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
  isChangingPassword: false,
  isDeletingAccount: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      if (res.data) {
        set({ authUser: res.data });
        get().connectSocket();
      } else {
        set({ authUser: null });
      }
    } catch {
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

  // returns true on success so the caller can navigate away
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
      get().disconnectSocket();
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
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

  changePassword: async (data) => {
    set({ isChangingPassword: true });
    try {
      await axiosInstance.put("/auth/change-password", data);
      toast.success("Password updated");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      set({ isChangingPassword: false });
    }
  },

  deleteAccount: async (password) => {
    set({ isDeletingAccount: true });
    try {
      await axiosInstance.delete("/auth/account", { data: { password } });
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [] });
      toast.success("Your account was deleted");
      return true;
    } catch (error) {
      toast.error(getErrorMessage(error));
      return false;
    } finally {
      set({ isDeletingAccount: false });
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

// A 401 on any protected request means the session expired while the app was open
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isAuthCall = ["/auth/login", "/auth/signup", "/auth/check", "/auth/logout"].some(
      (path) => url.includes(path)
    );

    if (error.response?.status === 401 && !isAuthCall && useAuthStore.getState().authUser) {
      useAuthStore.getState().disconnectSocket();
      useAuthStore.setState({ authUser: null, onlineUsers: [] });
      toast.error("Your session expired. Please log in again.");
    }

    return Promise.reject(error);
  }
);