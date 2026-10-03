const SidebarSkeleton = () => {
  return (
    <aside className="flex w-full flex-col border-r border-base-300 bg-base-100 lg:w-96 lg:shrink-0">
      <div className="space-y-4 border-b border-base-300 px-4 pb-4 pt-5">
        <div className="skeleton h-8 w-28" />
        <div className="skeleton h-11 w-full rounded-2xl" />
        <div className="flex gap-2">
          <div className="skeleton h-8 w-16 rounded-full" />
          <div className="skeleton h-8 w-20 rounded-full" />
          <div className="skeleton h-8 w-20 rounded-full" />
        </div>
      </div>

      <div className="flex-1 space-y-1 overflow-hidden p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="skeleton size-12 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-2/5" />
              <div className="skeleton h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;