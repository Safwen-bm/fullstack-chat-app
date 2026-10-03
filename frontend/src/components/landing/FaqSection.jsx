import React, { useState } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { LandingImage, Reveal } from "./shared";

const FAQS = [
  {
    q: "Is OnlyChat free to use?",
    a: "Yes. Creating an account is free and you can start chatting right away.",
  },
  {
    q: "Do I need an account to use OnlyChat?",
    a: "Yes. Create one with your name, email and a password, then you can see everyone on the app and start chatting.",
  },
  {
    q: "Can I send photos?",
    a: "Yes. Attach an image to a message and it shows up in the conversation right away.",
  },
  {
    q: "How do I know who is online?",
    a: "A green dot appears next to people who are connected at the moment.",
  },
  {
    q: "Can I change how the app looks?",
    a: "Absolutely. Open Settings and pick from ten themes. Your choice is applied across the whole app.",
  },
  {
    q: "Does it work on my phone?",
    a: "OnlyChat is built to adapt to phones, tablets and desktops, so you can talk from wherever you are.",
  },
];

const FaqSection = () => {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative scroll-mt-24 overflow-hidden py-24">
      {/* background decoration */}
      <div className="pointer-events-none absolute -left-32 top-20 size-96 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-10 size-96 rounded-full bg-secondary/15 blur-3xl" />
      <span className="pointer-events-none absolute -right-10 -top-16 select-none text-[24rem] font-black leading-none text-primary/5">
        ?
      </span>

      <div className="container relative mx-auto grid gap-14 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        {/* LEFT: heading + visual */}
        <Reveal className="lg:sticky lg:top-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            FAQ
          </p>
          <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">
            Got questions?
            <span className="block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              We have answers.
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base-content/70">
            The quick version of everything people ask before they jump in.
          </p>

          <div className="relative mt-10">
            <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 to-secondary/30 blur-2xl" />
            <LandingImage
              src="/landing/faq-visual.jpg"
              fallbackClass="from-primary/50 to-accent/50"
              className="relative aspect-[4/3] w-full rounded-[2rem] border border-base-300 shadow-2xl"
            />

            <div className="absolute left-3 top-6 animate-float rounded-2xl rounded-bl-md border border-base-300 bg-base-100 px-4 py-2 text-sm shadow-xl sm:-left-4">
              Wait, how does it work? 🤔
            </div>
            <div className="absolute bottom-8 right-3 animate-float rounded-2xl rounded-br-md bg-primary px-4 py-2 text-sm text-primary-content shadow-xl [animation-delay:-3s] sm:-right-4">
              Let me show you ✨
            </div>
          </div>
        </Reveal>

        {/* RIGHT: chat style accordion */}
        <Reveal delay={100} className="space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? "border-primary/40 bg-base-100 shadow-lg shadow-primary/10"
                    : "border-base-300 bg-base-100/60 hover:border-primary/30"
                }`}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                >
                  <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors ${
                      isOpen
                        ? "bg-primary text-primary-content"
                        : "bg-base-200 text-base-content/70"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-semibold">{f.q}</span>
                  <Plus
                    className={`size-5 shrink-0 text-primary transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="flex items-start gap-3 px-5 pb-5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content">
                        <MessageSquare className="size-4" />
                      </span>
                      <p className="rounded-2xl rounded-tl-md bg-primary px-4 py-3 text-sm text-primary-content">
                        {f.a}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
};

export default FaqSection;