import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Send, Smile, X } from "lucide-react";
import toast from "react-hot-toast";
import { useChatStore } from "../../store/useChatStore";
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
  const emitTyping = useChatStore((s) => s.emitTyping);
  const peerId = useChatStore((s) => s.selectedUser?._id);

  // grow with the content, up to a limit
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [text]);

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

  const attachFile = async (file) => {
    if (!file) return;
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
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const canSend = (text.trim() || image) && !isProcessing;

  return (
    <div className="relative border-t border-base-300 bg-base-100 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-5">
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
          disabled={isProcessing}
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
            placeholder="Type a message..."
            enterKeyHint="send"
            onChange={(e) => {
              setText(e.target.value);
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
          title="Send"
          aria-label="Send message"
          className="btn btn-circle btn-primary shrink-0 shadow-lg shadow-primary/30 transition-transform active:scale-90 disabled:shadow-none"
        >
          <Send className="size-5" />
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