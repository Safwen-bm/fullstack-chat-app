import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import { Avatar } from "../landing/shared";
import { PEOPLE } from "../landing/data";

const SCRIPTS = {
  login: [
    { from: "them", text: "Welcome back 👋" },
    { from: "them", text: "The group chat missed you" },
    { from: "me", text: "Logging in right now 😄" },
    { from: "them", text: "Yay! Come catch up ✨" },
  ],
  signup: [
    { from: "them", text: "New here? Say hi 👋" },
    { from: "me", text: "Just creating my account!" },
    { from: "them", text: "Add a photo and you are set 📸" },
    { from: "me", text: "Done. Where is everyone?" },
    { from: "them", text: "Right here 🎉" },
  ],
};

const ORBS = [
  { person: 1, pos: "left-[2%] top-[4%]", size: "size-9 sm:size-12 lg:size-14", delay: "0s", ring: true },
  { person: 2, pos: "right-[4%] top-[0%]", size: "size-10 sm:size-14 lg:size-16", delay: "-2s", ring: false },
  { person: 3, pos: "left-[-1%] top-[48%]", size: "size-8 sm:size-10 lg:size-12", delay: "-4s", ring: true },
  { person: 4, pos: "right-[-1%] top-[52%]", size: "size-9 sm:size-12 lg:size-14", delay: "-1s", ring: false },
  { person: 5, pos: "left-[8%] bottom-[0%]", size: "size-10 sm:size-14 lg:size-16", delay: "-3s", ring: false },
];

const PILLS = ["Real-time", "Photo sharing", "10 themes"];

const useChatLoop = (script) => {
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let timer;
    if (count < script.length) {
      const fromThem = script[count].from === "them";
      setTyping(fromThem);
      timer = setTimeout(
        () => {
          setTyping(false);
          setCount((c) => c + 1);
        },
        fromThem ? 1300 : 900
      );
    } else {
      timer = setTimeout(() => setCount(0), 3500);
    }
    return () => clearTimeout(timer);
  }, [count, script]);

  return { count, typing };
};

const Bubble = ({ msg }) => {
  const mine = msg.from === "me";
  return (
    <div
      className={`animate-pop max-w-[85%] text-[13px] leading-snug ${
        mine ? "self-end" : "self-start"
      }`}
    >
      <div
        className={`rounded-2xl px-3 py-2 ${
          mine
            ? "rounded-br-md bg-primary text-primary-content"
            : "rounded-bl-md bg-base-200"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
};

const AuthShowcase = ({ variant = "login", title, subtitle }) => {
  const script = SCRIPTS[variant] || SCRIPTS.login;
  const { count, typing } = useChatLoop(script);
  const host = PEOPLE[0];

  return (
    <div className="relative order-first flex flex-col items-center justify-center overflow-hidden border-b border-base-300 bg-gradient-to-br from-primary/15 via-base-200 to-secondary/15 px-4 pb-8 pt-24 sm:px-12 lg:order-none lg:border-b-0 lg:border-l lg:py-24">
      {/* background decoration */}
      <div className="pointer-events-none absolute inset-0 text-base-content/20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 size-64 rounded-full bg-primary/25 blur-3xl motion-reduce:animate-none lg:size-96 lg:animate-blob" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-64 rounded-full bg-secondary/25 blur-3xl [animation-delay:-6s] motion-reduce:animate-none lg:size-96 lg:animate-blob" />

      {/* STAGE */}
      <div className="relative h-60 w-full max-w-lg sm:h-80 lg:h-[26rem]">
        {ORBS.map((o) => (
          <div
            key={o.person}
            style={{ animationDelay: o.delay }}
            className={`absolute animate-float motion-reduce:animate-none ${o.pos}`}
          >
            <Avatar
              src={PEOPLE[o.person].src}
              name={PEOPLE[o.person].name}
              size={o.size}
              ring={o.ring}
              online
              className="drop-shadow-xl"
            />
          </div>
        ))}

        <div className="absolute right-[20%] top-[7%] hidden animate-float rounded-full border border-base-300 bg-base-100/90 px-3 py-1.5 text-sm shadow-lg backdrop-blur [animation-delay:-2s] motion-reduce:animate-none sm:block">
          ❤️ 24
        </div>
        <div className="absolute bottom-[5%] left-[26%] hidden animate-float rounded-full border border-base-300 bg-base-100/90 px-3 py-1.5 text-sm shadow-lg backdrop-blur [animation-delay:-4s] motion-reduce:animate-none sm:block">
          🔥 New message
        </div>

        {/* CHAT CARD */}
        <div className="absolute left-1/2 top-1/2 w-56 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-base-300 bg-base-100/90 shadow-2xl shadow-primary/20 backdrop-blur-xl sm:w-64 lg:w-72">
          <div className="flex items-center gap-3 border-b border-base-300 px-4 py-3">
            <Avatar src={host.src} name={host.name} size="size-9" online />
            <div className="leading-tight">
              <p className="text-sm font-semibold">{host.name}</p>
              <p className="text-[11px] text-success">online</p>
            </div>
          </div>

          <div className="flex h-24 flex-col justify-end gap-2 overflow-hidden px-3 py-3 [mask-image:linear-gradient(to_bottom,transparent,black_22%)] sm:h-36 lg:h-44">
            {script.slice(0, count).map((m, i) => (
              <Bubble key={i} msg={m} />
            ))}
            {typing && (
              <div className="animate-pop self-start rounded-2xl rounded-bl-md bg-base-200 px-3 py-2.5">
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
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-base-300 px-3 py-3">
            <div className="flex-1 rounded-full bg-base-200 px-4 py-2 text-xs text-base-content/50">
              Message {host.name}...
            </div>
            <div className="grid size-8 place-items-center rounded-full bg-primary text-primary-content">
              <Send className="size-4" />
            </div>
          </div>
        </div>
      </div>

      {/* TEXT */}
      <div className="relative mt-5 text-center sm:mt-8 lg:mt-10">
        <h2 className="text-2xl font-extrabold sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-3 hidden max-w-md text-base-content/60 sm:block">
          {subtitle}
        </p>
        <div className="mt-6 hidden flex-wrap justify-center gap-2 sm:flex">
          {PILLS.map((p) => (
            <span
              key={p}
              className="rounded-full border border-base-300 bg-base-100/70 px-4 py-1.5 text-xs font-medium backdrop-blur"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthShowcase;