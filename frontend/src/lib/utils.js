export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const dayDiff = (date) =>
  Math.round((startOfDay(new Date()) - startOfDay(new Date(date))) / 86400000);

export function isSameDay(a, b) {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}

// "Today", "Yesterday", "Monday", "12 March"
export function formatDayLabel(date) {
  const d = new Date(date);
  const diff = dayDiff(d);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "long" });
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: d.getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

// time shown in the conversation list
export function formatChatListTime(date) {
  const d = new Date(date);
  const diff = dayDiff(d);
  if (diff === 0) return formatMessageTime(d);
  if (diff === 1) return "Yesterday";
  if (diff < 7) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}