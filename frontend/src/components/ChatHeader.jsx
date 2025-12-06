import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <div className="
      p-3 border-b border-base-300 bg-base-100 
      flex items-center justify-between
      backdrop-blur-xl
    ">
      
      {/* LEFT: Avatar + User Info */}
      <div className="flex items-center gap-3">

        {/* Avatar */}
        <div className="relative group">
          <div className="size-11 rounded-full overflow-hidden shadow-sm border border-base-300">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            />
          </div>

          {/* Online Dot */}
          <span
            className={`
              absolute bottom-0 right-0 size-3 rounded-full border border-base-100
              transition-colors duration-300
              ${isOnline ? "bg-green-500" : "bg-gray-400"}
            `}
          />
        </div>

        {/* NAME + STATUS */}
        <div className="flex flex-col">
          <h3 className="font-semibold text-base leading-tight">
            {selectedUser.fullName}
          </h3>
          <p
            className={`
              text-xs font-medium transition-colors 
              ${isOnline ? "text-green-600" : "text-base-content/60"}
            `}
          >
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* RIGHT: Close Button */}
      <button
        onClick={() => setSelectedUser(null)}
        className="
          p-2 rounded-lg transition-all 
          hover:bg-base-200 active:scale-90
        "
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatHeader;
