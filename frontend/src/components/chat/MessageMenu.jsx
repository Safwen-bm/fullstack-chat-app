import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Copy, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../../store/useChatStore";
import { useThemeStore } from "../../store/useThemeStore";
import { EDIT_WINDOW_MS, REACTION_EMOJIS } from "../../lib/chat";

const WIDTH = 248;
const HEIGHT_ESTIMATE = 250;

const itemClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-base-200";

const MessageMenu = ({ message, isOwn, anchor, myId, onClose }) => {
  const toggleReaction = useChatStore((s) => s.toggleReaction);
  const setEditingMessage = useChatStore((s) => s.setEditingMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const theme = useThemeStore((s) => s.theme);

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      // do not let the page also close the whole conversation
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", onKey, true);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      window.removeEventListener("keydown", onKey, true);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  const myReaction = message.reactions?.find((r) => String(r.userId) === myId)?.emoji;
  const canEdit =
    isOwn &&
    !!message.text &&
    Date.now() - new Date(message.createdAt).getTime() < EDIT_WINDOW_MS;

  // open above the button when there is room, below otherwise
  const left = Math.min(
    Math.max(8, isOwn ? anchor.right - WIDTH : anchor.left),
    window.innerWidth - WIDTH - 8
  );
  const above = anchor.top > HEIGHT_ESTIMATE + 16;
  const position = above
    ? { bottom: window.innerHeight - anchor.top + 8 }
    : { top: anchor.bottom + 8 };

  const react = (emoji) => {
    toggleReaction(message._id, emoji);
    onClose();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy the message.");
    }
    onClose();
  };

  const edit = () => {
    setEditingMessage(message);
    onClose();
  };

  const remove = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onClose();
    await deleteMessage(message._id);
  };

  // the portal lives outside the app container, so it needs the theme itself
  return createPortal(
    <div data-theme={theme} className="contents">
      <div className="fixed inset-0 z-[60]" onClick={onClose} />

      <div
        role="menu"
        style={{ left, width: WIDTH, ...position }}
        className="animate-pop fixed z-[70] rounded-2xl border border-base-300 bg-base-100 p-2 text-base-content shadow-2xl"
      >
        <div className="flex justify-between rounded-xl bg-base-200 p-1">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => react(emoji)}
              aria-label={`React with ${emoji}`}
              className={`grid size-9 place-items-center rounded-lg text-xl transition hover:scale-125 ${
                myReaction === emoji ? "bg-primary/20" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        <div className="mt-2 space-y-0.5">
          {message.text && (
            <button type="button" onClick={copy} className={itemClass}>
              <Copy className="size-4" />
              Copy text
            </button>
          )}

          {canEdit && (
            <button type="button" onClick={edit} className={itemClass}>
              <Pencil className="size-4" />
              Edit
            </button>
          )}

          {isOwn && (
            <button
              type="button"
              onClick={remove}
              className={`${itemClass} text-error hover:bg-error/10`}
            >
              <Trash2 className="size-4" />
              {confirmDelete ? "Tap again to delete for everyone" : "Delete for everyone"}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MessageMenu;