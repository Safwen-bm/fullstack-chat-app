import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Search } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = users
    .filter((user) =>
      showOnlineOnly ? onlineUsers.includes(user._id) : true
    )
    .filter((user) =>
      user.fullName.toLowerCase().includes(search.toLowerCase())
    );

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside
      className="
        h-full w-24 lg:w-80 
        bg-base-100/90 backdrop-blur-md
        border-r border-base-300 
        flex flex-col 
        shadow-xl
      "
    >
      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-base-100/80 backdrop-blur-md border-b border-base-300 px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-6 h-6 text-primary" />
          <span className="font-semibold hidden lg:block text-lg">
            Conversations
          </span>
        </div>

        {/* SEARCH BAR */}
        <div className="hidden lg:flex items-center gap-2 bg-base-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent w-full outline-none text-sm"
          />
        </div>

        {/* ONLINE FILTER */}
        <div className="hidden lg:flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            Online only
          </label>

          <span className="text-xs text-zinc-400">
            {onlineUsers.length - 1} online
          </span>
        </div>
      </div>

      {/* USERS LIST */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id);
          const isSelected = selectedUser?._id === user._id;

          return (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full flex items-center gap-3 
                p-3 rounded-xl transition-all 
                ${
                  isSelected
                    ? "bg-primary text-primary-content shadow-md"
                    : "hover:bg-base-200"
                }
              `}
            >
              {/* Avatar */}
              <div className="relative">
                <img
                  src={user.profilePic || "/avatar.png"}
                  className="
                    w-12 h-12 object-cover rounded-full 
                    shadow-sm border border-base-300
                  "
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full ring-2 ring-base-100" />
                )}
              </div>

              {/* User Info */}
              <div className="hidden lg:flex flex-col text-left overflow-hidden">
                <span className="font-medium truncate">{user.fullName}</span>
                <span
                  className={`text-xs ${
                    isOnline ? "text-green-500" : "text-zinc-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </button>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-5 text-sm">
            No users found
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
