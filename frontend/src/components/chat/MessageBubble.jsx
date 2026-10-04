import React, { memo, useRef, useState } from "react";
import { Ban, Check, CheckCheck, Clock, MoreHorizontal } from "lucide-react";
import { formatMessageTime } from "../../lib/utils";
import { groupReactions } from "../../lib/chat";
import { useChatStore } from "../../store/useChatStore";
import MessageMenu from "./MessageMenu";

const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  myId,
  startsGroup,
  endsGroup,
  avatarSrc,
  onOpenImage,
  onImageLoad,
}) {
  const toggleReaction = useChatStore((s) => s.toggleReaction);
  const isBeingEdited = useChatStore((s) => s.editingMessage?._id === message._id);

  const [anchor, setAnchor] = useState(null);
  const triggerRef = useRef(null);

  const deleted = !!message.deleted;
  const canOpenMenu = !message.pending && !deleted;
  const reactions = deleted ? [] : groupReactions(message.reactions, myId);

  // corners get tighter inside a group of consecutive messages
  const tl = !isOwn ? (startsGroup ? "rounded-tl-2xl" : "rounded-tl-md") : "rounded-tl-2xl";
  const bl = !isOwn ? (endsGroup ? "rounded-bl-sm" : "rounded-bl-md") : "rounded-bl-2xl";
  const tr = isOwn ? (startsGroup ? "rounded-tr-2xl" : "rounded-tr-md") : "rounded-tr-2xl";
  const br = isOwn ? (endsGroup ? "rounded-br-sm" : "rounded-br-md") : "rounded-br-2xl";

  const imageOnly = message.image && !message.text && !deleted;

  const colors = deleted
    ? "border border-dashed border-base-300 bg-base-100/50 text-base-content/50"
    : isOwn
    ? "bg-primary text-primary-content shadow-sm"
    : "border border-base-300 bg-base-100 text-base-content shadow-sm";

  return (
    <div
      className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${
        startsGroup ? "mt-3" : "mt-0.5"
      } ${message.pending ? "animate-pop" : ""}`}
    >
      <div
        className={`group flex max-w-[85%] items-end gap-2 sm:max-w-[70%] ${
          isOwn ? "flex-row-reverse" : ""
        }`}
      >
        {!isOwn && (
          <div className="w-8 shrink-0">
            {endsGroup && (
              <img
                src={avatarSrc}
                alt=""
                className="size-8 rounded-full object-cover ring-1 ring-base-300"
              />
            )}
          </div>
        )}

        <div
          className={`min-w-0 ${tl} ${tr} ${bl} ${br} ${colors} ${
            imageOnly ? "p-1" : "px-3.5 py-2"
          } ${message.pending ? "opacity-80" : ""} ${
            isBeingEdited ? "ring-2 ring-primary/60 ring-offset-2 ring-offset-base-200" : ""
          }`}
        >
          {deleted ? (
            <p className="flex items-center gap-1.5 text-sm italic">
              <Ban className="size-4 shrink-0" />
              This message was deleted
            </p>
          ) : (
            <>
              {message.image && (
                <button
                  type="button"
                  onClick={() => onOpenImage(message.image)}
                  className="block cursor-zoom-in overflow-hidden rounded-xl"
                  aria-label="Open image"
                >
                  <img
                    src={message.image}
                    alt="Attachment"
                    loading="lazy"
                    onLoad={onImageLoad}
                    className="block max-h-80 w-[260px] max-w-full bg-base-300/50 object-cover"
                  />
                </button>
              )}

              {message.text && (
                <p
                  className={`whitespace-pre-wrap break-words text-[15px] leading-relaxed ${
                    message.image ? "mt-2 px-1.5 pb-0.5" : ""
                  }`}
                >
                  {message.text}
                  {message.editedAt && (
                    <span className="ml-2 text-[10px] opacity-60">edited</span>
                  )}
                </p>
              )}
            </>
          )}
        </div>

        {canOpenMenu && (
          <button
            ref={triggerRef}
            type="button"
            aria-label="Message options"
            onClick={() => setAnchor(triggerRef.current.getBoundingClientRect())}
            className="mb-1 grid size-7 shrink-0 place-items-center rounded-full text-base-content/60 opacity-0 transition hover:bg-base-300 focus:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          >
            <MoreHorizontal className="size-4" />
          </button>
        )}
      </div>

      {reactions.length > 0 && (
        <div
          className={`relative z-10 -mt-2 mb-0.5 flex flex-wrap gap-1 ${
            isOwn ? "justify-end pr-3" : "justify-start pl-12"
          }`}
        >
          {reactions.map((r) => (
            <button
              key={r.emoji}
              type="button"
              onClick={() => toggleReaction(message._id, r.emoji)}
              aria-label={`${r.emoji} ${r.count}`}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs shadow-sm transition hover:scale-105 ${
                r.mine ? "border-primary bg-primary/10" : "border-base-300 bg-base-100"
              }`}
            >
              <span>{r.emoji}</span>
              {r.count > 1 && <span className="font-semibold">{r.count}</span>}
            </button>
          ))}
        </div>
      )}

      {endsGroup && (
        <div
          className={`mt-1 flex items-center gap-1 text-[11px] text-base-content/50 ${
            isOwn ? "" : "ml-10"
          }`}
          title={new Date(message.createdAt).toLocaleString()}
        >
          <time>{formatMessageTime(message.createdAt)}</time>
          {isOwn &&
            !deleted &&
            (message.pending ? (
              <Clock className="size-3" aria-label="Sending" />
            ) : message.seen ? (
              <CheckCheck className="size-3.5 text-primary" aria-label="Seen" />
            ) : (
              <Check className="size-3.5" aria-label="Sent" />
            ))}
        </div>
      )}

      {anchor && (
        <MessageMenu
          message={message}
          isOwn={isOwn}
          myId={myId}
          anchor={anchor}
          onClose={() => setAnchor(null)}
        />
      )}
    </div>
  );
});

export default MessageBubble;