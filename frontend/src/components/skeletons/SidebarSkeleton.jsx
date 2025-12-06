import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(6).fill(null);

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-300 bg-base-100 shadow-sm">
      
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5 flex items-center gap-2">
        <Users className="w-6 h-6 text-zinc-400" />
        <span className="font-semibold hidden lg:block text-lg text-zinc-400">Contacts</span>
      </div>

      {/* Skeleton Users */}
      <div className="overflow-y-auto w-full py-3 flex-1 space-y-3">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="w-full p-3 flex items-center gap-3 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-zinc-300 mx-auto lg:mx-0" />
            <div className="hidden lg:flex flex-col flex-1 gap-2">
              <div className="h-4 bg-zinc-300 rounded w-3/4" />
              <div className="h-3 bg-zinc-300 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
