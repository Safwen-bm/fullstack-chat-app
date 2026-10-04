export const EDIT_WINDOW_MS = 15 * 60 * 1000; // must match the backend
export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

// [{ emoji, count, mine }]
export function groupReactions(reactions = [], myId) {
  const map = new Map();
  for (const r of reactions) {
    const entry = map.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false };
    entry.count += 1;
    if (String(r.userId) === myId) entry.mine = true;
    map.set(r.emoji, entry);
  }
  return [...map.values()];
}