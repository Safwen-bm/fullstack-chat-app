import React, { Suspense, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";

import Navbar from "./components/Navbar";
import ErrorBoundary from "./components/ErrorBoundary";

import { lazyWithRetry } from "./lib/lazyWithRetry";
import { useAuthStore } from "./store/useAuthStore";
import { useChatStore } from "./store/useChatStore";
import { useThemeStore } from "./store/useThemeStore";

// every page loads only when it is visited
const loadChatPage = () => import("./pages/ChatPage");

const HomePage = lazyWithRetry(() => import("./pages/HomePage"));
const ChatPage = lazyWithRetry(loadChatPage);
const SignUpPage = lazyWithRetry(() => import("./pages/SignUpPage"));
const LoginPage = lazyWithRetry(() => import("./pages/LoginPage"));
const SettingsPage = lazyWithRetry(() => import("./pages/SettingsPage"));
const ProfilePage = lazyWithRetry(() => import("./pages/ProfilePage"));
const NotFoundPage = lazyWithRetry(() => import("./pages/NotFoundPage"));

const PageLoader = () => (
  <div className="grid min-h-dvh place-items-center">
    <Loader className="size-8 animate-spin text-primary" />
  </div>
);

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { pathname } = useLocation();
  const baseTitle = useRef(document.title);
  const unreadTotal = useChatStore((s) =>
    s.users.reduce((sum, u) => sum + (u.unreadCount || 0), 0)
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // logged in users will open the chat next: download it in the background
  useEffect(() => {
    if (authUser) loadChatPage().catch(() => {});
  }, [authUser]);

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
    document.title =
      unreadTotal > 0 ? `(${unreadTotal}) ${baseTitle.current}` : baseTitle.current;
  }, [unreadTotal]);

  if (isCheckingAuth && !authUser) return <PageLoader />;

  return (
    <div data-theme={theme} className="min-h-screen">
      <Navbar />

      {/* the key resets the error screen when the visitor navigates away */}
      <ErrorBoundary key={pathname}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/chat" element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
            <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/chat" />} />
            <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/chat" />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route
              path="/profile"
              element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
};

export default App;