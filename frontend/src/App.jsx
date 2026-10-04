import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useThemeStore } from "./store/useThemeStore";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const unreadTotal = useChatStore((s) =>
    s.users.reduce((sum, u) => sum + (u.unreadCount || 0), 0)
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // listen for incoming messages on every page while logged in
  useEffect(() => {
    if (!authUser || !socket) return;
    const { startMessageListener, stopMessageListener } = useChatStore.getState();
    startMessageListener();
    return () => stopMessageListener();
  }, [authUser, socket]);

  // wipe chat data when the user logs out
  useEffect(() => {
    if (!authUser) useChatStore.getState().resetChat();
  }, [authUser]);

  // unread count in the browser tab title
  useEffect(() => {
    document.title = unreadTotal > 0 ? `(${unreadTotal}) OnlyChat` : "OnlyChat";
  }, [unreadTotal]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme} className="min-h-screen">
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/chat" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/chat" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default App;