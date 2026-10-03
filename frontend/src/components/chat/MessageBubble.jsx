import React, { memo } from "react";
import { Check, CheckCheck, Clock } from "lucide-react";
import { formatMessageTime } from "../../lib/utils";

const MessageBubble = memo(function MessageBubble({
  message,
  isOwn,
  startsGroup,
  endsGroup,
  avatarSrc,
  onOpenImage,
  onImageLoad,
}) {
  // corners get tighter inside a group of consecutive messages
  const tl = !isOwn ? (startsGroup ? "rounded-tl-2xl" : "rounded-tl-md") : "rounded-tl-2xl";
  const bl = !isOwn ? (endsGroup ? "rounded-bl-sm" : "rounded-bl-md") : "rounded-bl-2xl";
  const tr = isOwn ? (startsGroup ? "rounded-tr-2xl" : "rounded-tr-md") : "rounded-tr-2xl";
  const br = isOwn ? (endsGroup ? "rounded-br-sm" : "rounded-br-md") : "rounded-br-2xl";

  const imageOnly = message.image && !message.text;

  return (
    <div
      className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${
        startsGroup ? "mt-3" : "mt-0.5"
      } ${message.pending ? "animate-pop" : ""}`}
    >
      <div className={`flex max-w-[85%] items-end gap-2 sm:max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}>
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
          className={`min-w-0 shadow-sm ${tl} ${tr} ${bl} ${br} ${
            isOwn
              ? "bg-primary text-primary-content"
              : "border border-base-300 bg-base-100 text-base-content"
          } ${imageOnly ? "p-1" : "px-3.5 py-2"} ${message.pending ? "opacity-80" : ""}`}
        >
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
            </p>
          )}
        </div>
      </div>

      {endsGroup && (
        <div
          className={`mt-1 flex items-center gap-1 text-[11px] text-base-content/50 ${
            isOwn ? "" : "ml-10"
          }`}
          title={new Date(message.createdAt).toLocaleString()}
        >
          <time>{formatMessageTime(message.createdAt)}</time>
          {isOwn &&
            (message.pending ? (
              <Clock className="size-3" aria-label="Sending" />
            ) : message.seen ? (
              <CheckCheck className="size-3.5 text-primary" aria-label="Seen" />
            ) : (
              <Check className="size-3.5" aria-label="Sent" />
            ))}
        </div>
      )}
    </div>
  );
});

export default MessageBubble;