import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { useThemeStore } from "../store/useThemeStore";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const { theme } = useThemeStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {messages.map((message) => {
          const isOwn = message.senderId === authUser._id;

          return (
            <div
              key={message._id}
              ref={messageEndRef}
              className={`chat ${isOwn ? "chat-end" : "chat-start"}
                transition-all duration-300 ease-in-out animate-[fadeIn_0.25s_ease-out]
              `}
            >
              {/* Avatar */}
              <div className="chat-image avatar">
                <div className="size-11 rounded-full overflow-hidden ring-2 ring-base-300 shadow-md">
                  <img
                    src={
                      isOwn
                        ? authUser.profilePic || "/avatar.png"
                        : selectedUser.profilePic || "/avatar.png"
                    }
                    alt="profile"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="chat-header mb-1">
                <time className="text-[12px] opacity-70 ml-1 font-medium">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>

              {/* Bubble */}
              <div
                className={`
                  chat-bubble px-4 py-2 rounded-2xl backdrop-blur-sm
                  flex flex-col gap-3 max-w-[72%] leading-relaxed border shadow-lg

                  ${isOwn 
                    ? "bg-gradient-to-br from-primary to-primary/70 text-white border-primary/40 shadow-primary/30"
                    : "bg-white/80 text-gray-900 border-gray-200 shadow-gray-300/40"
                  }
                `}
                style={{
                  animation: "slideUp 0.25s ease-in-out",
                }}
              >
                {/* Image */}
                {message.image && (
                  <div className="overflow-hidden rounded-xl shadow-md">
                    <img
                      src={message.image}
                      alt="attachment"
                      className="max-w-[240px] rounded-xl backdrop-blur-sm"
                    />
                  </div>
                )}

                {/* Text */}
                {message.text && (
                  <p className="text-[15px] font-medium tracking-wide break-words">
                    {message.text}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
