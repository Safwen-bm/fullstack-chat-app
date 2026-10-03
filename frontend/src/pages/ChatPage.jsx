import React, { useEffect } from "react";
import Sidebar from "../components/chat/Sidebar";
import NoChatSelected from "../components/chat/NoChatSelected";
import ChatContainer from "../components/chat/ChatContainer";
import { useChatStore } from "../store/useChatStore";

const ChatPage = () => {
  const selectedUser = useChatStore((s) => s.selectedUser);
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);

  // Escape closes the open chat (unless you are typing or looking at an image)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (document.querySelector("[data-lightbox]")) return;
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      setSelectedUser(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSelectedUser]);

  return (
    <div
      className={`h-dvh bg-base-100 ${
        selectedUser ? "pt-0 lg:pt-[4.75rem]" : "pt-[4.75rem]"
      }`}
    >
      <div className="flex h-full overflow-hidden border-t border-base-300">
        <Sidebar />

        <main
          className={`min-w-0 flex-1 flex-col ${selectedUser ? "flex" : "hidden lg:flex"}`}
        >
          {selectedUser ? <ChatContainer key={selectedUser._id} /> : <NoChatSelected />}
        </main>
      </div>
    </div>
  );
};

export default ChatPage;