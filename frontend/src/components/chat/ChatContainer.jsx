import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ArrowDown, Loader2 } from "lucide-react";

import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { formatDayLabel, isSameDay } from "../../lib/utils";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble";
import ImageLightbox from "./ImageLightbox";
import MessageSkeleton from "../skeletons/MessageSkeleton";

const FIVE_MIN = 5 * 60 * 1000;

const ChatContainer = () => {
  const selectedUser = useChatStore((s) => s.selectedUser);
  const messages = useChatStore((s) => s.messages);
  const isMessagesLoading = useChatStore((s) => s.isMessagesLoading);
  const isLoadingOlder = useChatStore((s) => s.isLoadingOlder);
  const hasMoreMessages = useChatStore((s) => s.hasMoreMessages);
  const isTyping = useChatStore((s) => !!s.typingUsers[s.selectedUser?._id]);
  const getMessages = useChatStore((s) => s.getMessages);
  const loadOlderMessages = useChatStore((s) => s.loadOlderMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const authUserId = useAuthStore((s) => s.authUser._id);

  const userId = selectedUser._id;
  const peerPic = selectedUser.profilePic || "/avatar.png";

  const scrollRef = useRef(null);
  const nearBottomRef = useRef(true);
  const firstIdRef = useRef(null);
  const lastIdRef = useRef(null);
  const restoreRef = useRef(null); // scrollHeight before older messages were added

  const [showJump, setShowJump] = useState(false);
  const [unseenBelow, setUnseenBelow] = useState(0);
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  const scrollToBottom = useCallback((behavior = "smooth") => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  // load the conversation
  useEffect(() => {
    getMessages(userId);
  }, [userId, getMessages]);

  // mark messages as read when the tab becomes visible again
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const store = useChatStore.getState();
      const user = store.users.find((u) => u._id === userId);
      if (user?.unreadCount > 0) store.markAsRead(userId);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [userId]);

  // first paint of a conversation: jump to the latest message
  useLayoutEffect(() => {
    if (isMessagesLoading) return;
    firstIdRef.current = messages[0]?._id ?? null;
    lastIdRef.current = messages[messages.length - 1]?._id ?? null;
    nearBottomRef.current = true;
    scrollToBottom("auto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMessagesLoading]);

  // react to messages added at the end (new) or at the start (older)
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || isMessagesLoading) return;

    const first = messages[0]?._id ?? null;
    const previousFirst = firstIdRef.current;
    firstIdRef.current = first;

    // older messages were prepended: keep the reading position
    if (restoreRef.current !== null && first !== previousFirst) {
      el.scrollTop = el.scrollHeight - restoreRef.current;
      restoreRef.current = null;
      return;
    }

    const last = messages[messages.length - 1];
    const lastId = last?._id ?? null;
    if (lastId === lastIdRef.current) return;

    const hadMessages = lastIdRef.current !== null;
    lastIdRef.current = lastId;
    if (!hadMessages || !last) return;

    if (last.senderId === authUserId || nearBottomRef.current) {
      scrollToBottom("smooth");
    } else {
      setUnseenBelow((c) => c + 1);
    }
  }, [messages, isMessagesLoading, authUserId, scrollToBottom]);

  // keep the typing bubble in view
  useEffect(() => {
    if (isTyping && nearBottomRef.current) scrollToBottom("smooth");
  }, [isTyping, scrollToBottom]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    const near = distance < 120;
    nearBottomRef.current = near;
    setShowJump(!near);
    if (near) setUnseenBelow(0);
  };

  // images change the height after loading
  const handleImageLoad = useCallback(() => {
    if (nearBottomRef.current) scrollToBottom("auto");
  }, [scrollToBottom]);

  const handleLoadOlder = async () => {
    const el = scrollRef.current;
    if (el) restoreRef.current = el.scrollHeight;
    const ok = await loadOlderMessages();
    if (!ok) restoreRef.current = null;
  };

  // day separators and message grouping
  const items = useMemo(() => {
    const out = [];
    messages.forEach((m, i) => {
      const prev = messages[i - 1];
      const next = messages[i + 1];
      const time = new Date(m.createdAt).getTime();

      if (!prev || !isSameDay(prev.createdAt, m.createdAt)) {
        out.push({ type: "day", key: `day-${m._id}`, label: formatDayLabel(m.createdAt) });
      }

      const startsGroup =
        !prev ||
        prev.senderId !== m.senderId ||
        !isSameDay(prev.createdAt, m.createdAt) ||
        time - new Date(prev.createdAt).getTime() > FIVE_MIN;

      const endsGroup =
        !next ||
        next.senderId !== m.senderId ||
        !isSameDay(next.createdAt, m.createdAt) ||
        new Date(next.createdAt).getTime() - time > FIVE_MIN;

      out.push({ type: "msg", key: m._id, message: m, startsGroup, endsGroup });
    });
    return out;
  }, [messages]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChatHeader />

      {isMessagesLoading ? (
        <MessageSkeleton />
      ) : (
        <div className="relative min-h-0 flex-1">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="h-full overflow-y-auto overscroll-contain bg-base-200/50 px-3 py-4 sm:px-6"
          >
            <div className="mx-auto w-full max-w-4xl">
              {hasMoreMessages && (
                <div className="mb-2 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadOlder}
                    disabled={isLoadingOlder}
                    className="btn btn-sm btn-ghost gap-2 rounded-full"
                  >
                    {isLoadingOlder && <Loader2 className="size-4 animate-spin" />}
                    Load earlier messages
                  </button>
                </div>
              )}

              {messages.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-16 text-center">
                  <img
                    src={peerPic}
                    alt=""
                    className="size-24 rounded-full object-cover ring-4 ring-base-100 shadow-xl"
                  />
                  <div>
                    <p className="text-lg font-bold">{selectedUser.fullName}</p>
                    <p className="text-sm text-base-content/60">
                      No messages yet. Break the ice!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => sendMessage({ text: "👋", image: null })}
                    className="btn btn-primary rounded-full"
                  >
                    Say hi 👋
                  </button>
                </div>
              )}

              {items.map((item) =>
                item.type === "day" ? (
                  <div key={item.key} className="my-4 flex justify-center">
                    <span className="rounded-full border border-base-300 bg-base-100 px-3 py-1 text-xs font-medium text-base-content/60 shadow-sm">
                      {item.label}
                    </span>
                  </div>
                ) : (
                  <MessageBubble
                    key={item.key}
                    message={item.message}
                    isOwn={item.message.senderId === authUserId}
                    startsGroup={item.startsGroup}
                    endsGroup={item.endsGroup}
                    avatarSrc={peerPic}
                    onOpenImage={setLightboxSrc}
                    onImageLoad={handleImageLoad}
                  />
                )
              )}

              {isTyping && (
                <div className="mt-3 flex items-end gap-2">
                  <img src={peerPic} alt="" className="size-8 rounded-full object-cover" />
                  <div className="rounded-2xl rounded-bl-sm border border-base-300 bg-base-100 px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <span
                          key={d}
                          className="size-1.5 animate-bounce rounded-full bg-base-content/50"
                          style={{ animationDelay: `${d * 150}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showJump && (
            <button
              type="button"
              onClick={() => scrollToBottom("smooth")}
              aria-label="Scroll to the latest message"
              className="btn btn-circle btn-primary btn-sm absolute bottom-4 right-4 shadow-lg"
            >
              <ArrowDown className="size-4" />
              {unseenBelow > 0 && (
                <span className="absolute -right-1 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-error px-1 text-[11px] font-bold text-error-content">
                  {unseenBelow}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      <MessageInput />

      {lightboxSrc && <ImageLightbox src={lightboxSrc} onClose={closeLightbox} />}
    </div>
  );
};

export default ChatContainer;