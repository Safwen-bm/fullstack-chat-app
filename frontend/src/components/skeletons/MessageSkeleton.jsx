const ROWS = [
  { own: false, width: "w-48" },
  { own: false, width: "w-64" },
  { own: true, width: "w-40" },
  { own: false, width: "w-56" },
  { own: true, width: "w-64" },
  { own: true, width: "w-32" },
];

const MessageSkeleton = () => {
  return (
    <div className="flex-1 space-y-4 overflow-hidden bg-base-200/50 p-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-4">
        {ROWS.map((row, i) => (
          <div
            key={i}
            className={`flex items-end gap-2 ${row.own ? "justify-end" : "justify-start"}`}
          >
            {!row.own && <div className="skeleton size-8 shrink-0 rounded-full" />}
            <div className={`skeleton h-12 max-w-[70%] rounded-2xl ${row.width}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessageSkeleton;