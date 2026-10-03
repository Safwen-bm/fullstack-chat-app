import React from "react";
import { MessageSquare } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const TIPS = [
  "Enter sends, Shift+Enter adds a new line",
  "Paste an image straight into the message box",
  "Press Esc to close a conversation",
];

const NoChatSelected = () => {
  const firstName = useAuthStore((s) => s.authUser?.fullName?.split(" ")[0]);

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-base-200/50 to-secondary/10 p-10">
      <div className="pointer-events-none absolute inset-0 text-base-content/20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-20 top-10 size-80 animate-blob rounded-full bg-primary/20 blur-3xl motion-reduce:animate-none" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-80 animate-blob rounded-full bg-secondary/20 blur-3xl [animation-delay:-6s] motion-reduce:animate-none" />

      <div className="relative max-w-md text-center">
        <div className="relative mx-auto mb-8 w-fit">
          <div className="grid size-24 animate-float-slow place-items-center rounded-[2rem] bg-gradient-to-br from-primary to-secondary text-primary-content shadow-2xl shadow-primary/30 motion-reduce:animate-none">
            <MessageSquare className="size-11" />
          </div>
          <span className="absolute -right-10 -top-3 animate-float rounded-2xl rounded-bl-sm border border-base-300 bg-base-100 px-3 py-1.5 text-sm shadow-lg motion-reduce:animate-none">
            Hey! 👋
          </span>
          <span className="absolute -bottom-3 -left-12 animate-float rounded-2xl rounded-br-sm bg-primary px-3 py-1.5 text-sm text-primary-content shadow-lg [animation-delay:-3s] motion-reduce:animate-none">
            What&apos;s up? ✨
          </span>
        </div>

        <h2 className="text-3xl font-extrabold">
          {firstName ? `Hi ${firstName}!` : "Welcome to OnlyChat!"}
        </h2>
        <p className="mt-2 text-base-content/60">
          Pick a conversation from the list to start chatting.
        </p>

        <ul className="mt-8 space-y-2">
          {TIPS.map((tip) => (
            <li
              key={tip}
              className="rounded-full border border-base-300 bg-base-100/70 px-4 py-2 text-sm text-base-content/70 backdrop-blur"
            >
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NoChatSelected;