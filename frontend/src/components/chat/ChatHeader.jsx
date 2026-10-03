import React from "react";
import { ArrowLeft, X } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useChatStore } from "../../store/useChatStore";
import { Avatar } from "../landing/shared";

const ChatHeader = () => {
  const selectedUser = useChatStore((s) => s.selectedUser);
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const isTyping = useChatStore((s) => !!s.typingUsers[s.selectedUser?._id]);
  const isOnline = useAuthStore((s) => s.onlineUsers.includes(selectedUser?._id));

  if (!selectedUser) return null;

  return (
    <div className="flex items-center gap-3 border-b border-base-300 bg-base-100/90 px-3 py-3 backdrop-blur-xl sm:px-5">
      <button
        type="button"
        aria-label="Back to conversations"
        onClick={() => setSelectedUser(null)}
        className="btn btn-ghost btn-circle btn-sm lg:hidden"
      >
        <ArrowLeft className="size-5" />
      </button>

      <Avatar
        src={selectedUser.profilePic || "/avatar.png"}
        name={selectedUser.fullName}
        size="size-11"
        online={isOnline}
      />

      <div className="min-w-0 flex-1 leading-tight">
        <h3 className="truncate text-base font-semibold">{selectedUser.fullName}</h3>
        {isTyping ? (
          <p className="flex items-center gap-1 text-xs font-medium text-primary">
            typing
            <span className="flex gap-0.5">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="size-1 animate-bounce rounded-full bg-primary"
                  style={{ animationDelay: `${d * 150}ms` }}
                />
              ))}
            </span>
          </p>
        ) : (
          <p
            className={`text-xs font-medium ${
              isOnline ? "text-success" : "text-base-content/60"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </p>
        )}
      </div>

      <button
        type="button"
        aria-label="Close conversation"
        onClick={() => setSelectedUser(null)}
        className="btn btn-ghost btn-circle btn-sm hidden lg:inline-flex"
      >
        <X className="size-5" />
      </button>
    </div>
  );
};

export default ChatHeader;