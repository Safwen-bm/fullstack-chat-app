import React, { memo, useEffect, useMemo, useState } from "react";
import { MessageCircle, Search, X } from "lucide-react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { formatChatListTime } from "../../lib/utils";
import { Avatar } from "../landing/shared";
import SidebarSkeleton from "../skeletons/SidebarSkeleton";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "online", label: "Online" },
];

const ConversationItem = memo(function ConversationItem({
  user,
  isOnline,
  isSelected,
  isTyping,
  myId,
  onSelect,
}) {
  const last = user.lastMessage;
  const unread = user.unreadCount || 0;
  const mine = last && String(last.senderId) === myId;

  let preview = "Say hi 👋";
  if (isTyping) preview = "typing...";
  else if (last?.deleted) preview = "🚫 Message deleted";
  else if (last) preview = `${mine ? "You: " : ""}${last.text || (last.hasImage ? "📷 Photo" : "")}`;

  return (
    <button
      type="button"
      onClick={() => onSelect(user)}
      className={`relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors ${
        isSelected ? "bg-primary/10" : "hover:bg-base-200"
      }`}
    >
      {isSelected && (
        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}

      <Avatar
        src={user.profilePic || "/avatar.png"}
        name={user.fullName}
        size="size-12"
        online={isOnline}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={`truncate ${unread ? "font-bold" : "font-semibold"}`}>
            {user.fullName}
          </span>
          {last && (
            <span
              className={`shrink-0 text-xs ${
                unread ? "font-semibold text-primary" : "text-base-content/50"
              }`}
            >
              {formatChatListTime(last.createdAt)}
            </span>
          )}
        </div>

        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={`truncate text-sm ${
              isTyping
                ? "font-medium text-primary"
                : unread
                ? "text-base-content"
                : "text-base-content/60"
            }`}
          >
            {preview}
          </span>
          {unread > 0 && (
            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-content">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
});

const Sidebar = () => {
  const users = useChatStore((s) => s.users);
  const selectedUser = useChatStore((s) => s.selectedUser);
  const isUsersLoading = useChatStore((s) => s.isUsersLoading);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const getUsers = useChatStore((s) => s.getUsers);
  const setSelectedUser = useChatStore((s) => s.setSelectedUser);
  const onlineUsers = useAuthStore((s) => s.onlineUsers);
  const myId = useAuthStore((s) => s.authUser?._id);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // reload quietly if the list is already on screen
    getUsers({ silent: useChatStore.getState().users.length > 0 });
  }, [getUsers]);

  const onlineSet = useMemo(() => new Set(onlineUsers), [onlineUsers]);
  const onlineCount = useMemo(
    () => users.filter((u) => onlineSet.has(u._id)).length,
    [users, onlineSet]
  );
  const totalUnread = useMemo(
    () => users.reduce((sum, u) => sum + (u.unreadCount || 0), 0),
    [users]
  );

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users
      .filter((u) => {
        if (q && !u.fullName.toLowerCase().includes(q)) return false;
        if (filter === "unread") return u.unreadCount > 0;
        if (filter === "online") return onlineSet.has(u._id);
        return true;
      })
      .sort((a, b) => {
        const ta = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const tb = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        if (tb !== ta) return tb - ta;
        return a.fullName.localeCompare(b.fullName);
      });
  }, [users, search, filter, onlineSet]);

  if (isUsersLoading && users.length === 0) return <SidebarSkeleton />;

  return (
    <aside
      className={`w-full flex-col border-r border-base-300 bg-base-100 lg:flex lg:w-96 lg:shrink-0 ${
        selectedUser ? "hidden" : "flex"
      }`}
    >
      {/* HEADER */}
      <div className="space-y-4 border-b border-base-300 px-4 pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold">Chats</h2>
            <p className="text-xs text-base-content/60">
              {onlineCount} online
              {totalUnread > 0 ? ` · ${totalUnread} unread` : ""}
            </p>
          </div>
          <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="size-5" />
          </div>
        </div>

        <label className="flex items-center gap-2 rounded-2xl bg-base-200 px-4 py-2.5 focus-within:ring-2 focus-within:ring-primary/30">
          <Search className="size-4 shrink-0 text-base-content/50" />
          <input
            type="text"
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />
          {search && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearch("")}
              className="text-base-content/50 hover:text-base-content"
            >
              <X className="size-4" />
            </button>
          )}
        </label>

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === f.id
                  ? "bg-primary text-primary-content shadow"
                  : "bg-base-200 text-base-content/70 hover:bg-base-300"
              }`}
            >
              {f.label}
              {f.id === "unread" && totalUnread > 0 && (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    filter === "unread" ? "bg-white/25" : "bg-primary/15 text-primary"
                  }`}
                >
                  {totalUnread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-2">
        {visibleUsers.map((user) => (
          <ConversationItem
            key={user._id}
            user={user}
            isOnline={onlineSet.has(user._id)}
            isSelected={selectedUser?._id === user._id}
            isTyping={!!typingUsers[user._id]}
            myId={myId}
            onSelect={setSelectedUser}
          />
        ))}

        {visibleUsers.length === 0 && (
          <div className="px-6 py-16 text-center text-sm text-base-content/60">
            {search
              ? `No one matches "${search}".`
              : filter === "unread"
              ? "You are all caught up. 🎉"
              : filter === "online"
              ? "Nobody is online right now."
              : "No users yet."}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;