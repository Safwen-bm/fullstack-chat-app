import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Check, ImagePlus, Loader2, Pencil, Send, Smile, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../../store/useChatStore";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import { compressImage } from "../../lib/image";

const MAX_LENGTH = 2000;
const MAX_FILE_MB = 15;

const EMOJIS = [
  "😀", "😂", "🥹", "😍", "😎",
  "🤔", "😭", "🔥", "❤️", "👍",
  "🙏", "🎉", "👀", "✨", "😅",
  "🤝", "💯", "🙌", "😴", "🥳",
];

const MessageInput = () => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);

  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const typingRef = useRef({ active: false, timer: null });

  const sendMessage = useChatStore((s) => s.sendMessage);
  const editMessage = useChatStore((s) => s.editMessage);
  const emitTyping = useChatStore((s) => s.emitTyping);
  const peerId = useChatStore((s) => s.selectedUser?._id);
  const editingMessage = useChatStore((s) => s.editingMessage);
  const setEditingMessage = useChatStore((s) => s.setEditingMessage);
  const enterToSend = usePreferencesStore((s) => s.enterToSend);

  const editing = !!editingMessage;

  // grow with the content, up to a limit
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

  // entering edit mode: load the message into the box
  useEffect(() => {
    if (!editingMessage) return;
    setText(editingMessage.text || "");
    setImage(null);
    setShowEmoji(false);
    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
    // only react when a different message is picked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMessage?._id]);

  const stopTyping = useCallback(() => {
    const typing = typingRef.current;
    clearTimeout(typing.timer);
    if (typing.active) {
      typing.active = false;
      emitTyping(peerId, false);
    }
  }, [emitTyping, peerId]);

  const notifyTyping = () => {
    const typing = typingRef.current;
    if (!typing.active) {
      typing.active = true;
      emitTyping(peerId, true);
    }
    clearTimeout(typing.timer);
    typing.timer = setTimeout(stopTyping, 1800);
  };

  // tell the other person we stopped typing when this chat closes
  useEffect(() => {
    const typing = typingRef.current;
    return () => {
      clearTimeout(typing.timer);
      if (typing.active) {
        typing.active = false;
        emitTyping(peerId, false);
      }
    };
  }, [peerId, emitTyping]);

  const cancelEdit = () => {
    setEditingMessage(null);
    setText("");
  };

  const attachFile = async (file) => {
    if (!file || editing) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image.");
      return;
    }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`That image is too large. Choose one under ${MAX_FILE_MB} MB.`);
      return;
    }

    setIsProcessing(true);
    try {
      setImage(await compressImage(file, { maxSize: 1280, quality: 0.82 }));
    } catch (err) {
      toast.error(err.message || "Could not process this image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    attachFile(file);
  };

  const handlePaste = (e) => {
    if (editing) return;
    const file = Array.from(e.clipboardData?.files ?? []).find((f) =>
      f.type.startsWith("image/")
    );
    if (file) {
      e.preventDefault();
      attachFile(file);
    }
  };

  const insertEmoji = (emoji) => {
    setText((t) => (t + emoji).slice(0, MAX_LENGTH));
    textareaRef.current?.focus();
  };

  const send = async () => {
    const clean = text.trim();

    // saving an edit
    if (editingMessage) {
      if (!clean) return;
      if (clean === editingMessage.text) {
        cancelEdit();
        return;
      }
      const ok = await editMessage(editingMessage._id, clean);
      if (ok) cancelEdit();
      return;
    }

    if ((!clean && !image) || isProcessing) return;

    const sentImage = image;
    setText("");
    setImage(null);
    setShowEmoji(false);
    stopTyping();

    const ok = await sendMessage({ text: clean, image: sentImage });
    if (!ok) {
      // sending failed: give the draft back instead of losing it
      setText((current) => current || clean);
      setImage((current) => current || sentImage);
    }
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.nativeEvent.isComposing) return;

    if (e.key === "Escape" && editing) {
      e.preventDefault();
      cancelEdit();
      return;
    }
    if (e.key !== "Enter") return;

    // Enter sends by default; with the setting off, Ctrl or Cmd + Enter sends
    const wantsSend = enterToSend ? !e.shiftKey : e.ctrlKey || e.metaKey;
    if (wantsSend) {
      e.preventDefault();
      send();
    }
  };

  const canSend = editing ? !!text.trim() : (text.trim() || image) && !isProcessing;

  return (
    <div className="relative border-t border-base-300 bg-base-100 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
      {/* EDIT BANNER */}
      {editing && (
        <div className="mx-auto mb-2 flex max-w-4xl items-center gap-3 rounded-2xl border-l-4 border-primary bg-base-200 px-3 py-2">
          <Pencil className="size-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-primary">Editing message</p>
            <p className="truncate text-sm text-base-content/70">{editingMessage.text}</p>
          </div>
          <button
            type="button"
            onClick={cancelEdit}
            aria-label="Cancel editing"
            className="btn btn-ghost btn-circle btn-sm"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* IMAGE PREVIEW */}
      {image && (
        <div className="mx-auto mb-3 max-w-4xl">
          <div className="relative inline-block">
            <img
              src={image}
              alt="Preview"
              className="h-24 w-24 rounded-2xl border border-base-300 object-cover shadow"
            />
            <button
              type="button"
              onClick={() => setImage(null)}
              aria-label="Remove image"
              className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-base-300 transition hover:bg-error hover:text-error-content"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {/* EMOJI PICKER */}
      {showEmoji && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setShowEmoji(false)} />
          <div className="animate-pop absolute bottom-full left-3 z-20 mb-2 grid grid-cols-5 gap-1 rounded-2xl border border-base-300 bg-base-100 p-2 shadow-xl sm:left-5">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="grid size-10 place-items-center rounded-xl text-2xl transition hover:scale-110 hover:bg-base-200"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mx-auto flex max-w-4xl items-end gap-2"
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileRef}
          onChange={handleFileChange}
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isProcessing || editing}
          title="Attach an image"
          aria-label="Attach an image"
          className="btn btn-circle btn-ghost shrink-0"
        >
          {isProcessing ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-end rounded-3xl bg-base-200 px-2 focus-within:ring-2 focus-within:ring-primary/30">
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            title="Emoji"
            aria-label="Emoji"
            className="btn btn-circle btn-ghost btn-sm mb-1.5 shrink-0"
          >
            <Smile className="size-5" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            maxLength={MAX_LENGTH}
            value={text}
            placeholder={editing ? "Edit your message..." : "Type a message..."}
            enterKeyHint={enterToSend ? "send" : "enter"}
            onChange={(e) => {
              setText(e.target.value);
              if (editing) return;
              if (e.target.value) notifyTyping();
              else stopTyping();
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className="max-h-[140px] min-h-[44px] w-full resize-none bg-transparent px-2 py-3 text-[15px] leading-snug outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={!canSend}
          title={editing ? "Save" : "Send"}
          aria-label={editing ? "Save changes" : "Send message"}
          className="btn btn-circle btn-primary shrink-0 shadow-lg shadow-primary/30 transition-transform active:scale-90 disabled:shadow-none"
        >
          {editing ? <Check className="size-5" /> : <Send className="size-5" />}
        </button>
      </form>

      {text.length > MAX_LENGTH - 200 && (
        <p className="mx-auto mt-1 max-w-4xl text-right text-xs text-base-content/50">
          {text.length}/{MAX_LENGTH}
        </p>
      )}
    </div>
  );
};

export default MessageInput;