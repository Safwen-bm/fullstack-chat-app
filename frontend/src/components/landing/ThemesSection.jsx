import { useState } from "react";
import { Send } from "lucide-react";
import { Avatar, Reveal } from "./shared";
import { PEOPLE } from "./data";

const THEMES = [
  "light",
  "dark",
  "nord",
  "winter",
  "luxury",
  "dracula",
  "business",
  "dim",
  "emerald",
  "sunset",
];

const ThemesSection = () => {
  const [active, setActive] = useState("dracula");

  return (
    <section id="themes" className="scroll-mt-20 bg-base-200/60 py-24">
      <div className="container mx-auto grid items-center gap-14 px-4 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Themes
          </p>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">
            Make it look like you
          </h2>
          <p className="mt-4 max-w-md text-base-content/70">
            Tap a theme and watch the chat change instantly. Once you are in, you can
            switch your look anytime from Settings.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActive(t)}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                  active === t
                    ? "border-primary bg-primary/10 shadow-md"
                    : "border-base-300 bg-base-100 hover:border-primary/40"
                }`}
              >
                <span
                  data-theme={t}
                  className="flex shrink-0 -space-x-1 rounded-full bg-base-100 p-1 ring-1 ring-base-300"
                >
                  <span className="size-3.5 rounded-full bg-primary" />
                  <span className="size-3.5 rounded-full bg-secondary" />
                  <span className="size-3.5 rounded-full bg-accent" />
                </span>
                <span className="text-sm font-medium capitalize">{t}</span>
              </button>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150}>
          <div
            data-theme={active}
            className="mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-base-300 bg-base-100 text-base-content shadow-2xl transition-colors duration-500"
          >
            <div className="flex items-center gap-3 border-b border-base-300 px-5 py-4">
              <Avatar src={PEOPLE[2].src} name={PEOPLE[2].name} size="size-10" online />
              <div className="leading-tight">
                <p className="font-semibold">{PEOPLE[2].name}</p>
                <p className="text-xs text-success">online</p>
              </div>
              <span className="badge badge-primary ml-auto capitalize">{active}</span>
            </div>

            <div className="space-y-1 px-4 py-5">
              <div className="chat chat-start">
                <div className="chat-bubble">Which theme are you using?</div>
              </div>
              <div className="chat chat-end">
                <div className="chat-bubble chat-bubble-primary capitalize">
                  {active}, obviously ✨
                </div>
              </div>
              <div className="chat chat-start">
                <div className="chat-bubble chat-bubble-secondary">
                  Okay that looks really good.
                </div>
              </div>
              <div className="chat chat-end">
                <div className="chat-bubble chat-bubble-accent">Told you 😎</div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-base-300 px-4 py-3">
              <div className="flex-1 rounded-full bg-base-200 px-4 py-2 text-sm text-base-content/60">
                Type a message...
              </div>
              <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-content">
                <Send className="size-4" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default ThemesSection;