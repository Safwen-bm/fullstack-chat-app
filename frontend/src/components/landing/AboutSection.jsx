import { Check, Send, UserPlus, Users } from "lucide-react";
import { Avatar, LandingImage, Reveal } from "./shared";
import { PEOPLE } from "./data";

const POINTS = [
  "No ads, no noise, just conversations",
  "Fast and real-time from the very first message",
  "Ten themes so the app feels like yours",
];

const STATS = [
  { value: "10", label: "themes" },
  { value: "Live", label: "messaging" },
  { value: "0", label: "ads" },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    text: "Sign up with your name, email and a password. It takes less than a minute.",
  },
  {
    icon: Users,
    title: "Find your people",
    text: "See everyone on OnlyChat and spot who is online right now.",
  },
  {
    icon: Send,
    title: "Start talking",
    text: "Send messages and photos that arrive instantly, in a theme that feels like you.",
  },
];

const AboutSection = () => {
  return (
    <>
      {/* ABOUT */}
      <section id="about" className="container mx-auto scroll-mt-20 px-4 py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-tr from-primary/30 to-secondary/30 blur-2xl" />
              <LandingImage
                src="/landing/about-story.jpg"
                className="relative aspect-[4/5] w-full rounded-[2.5rem] border border-base-300 shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-2 flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100/95 p-4 shadow-xl backdrop-blur sm:-right-8">
                <Avatar src={PEOPLE[3].src} name={PEOPLE[3].name} size="size-10" online />
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{PEOPLE[3].name}</p>
                  <p className="text-xs text-base-content/60">is typing...</p>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              About us
            </p>
            <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">
              We built the chat app we wanted to use
            </h2>
            <p className="mt-5 text-base-content/70">
              Most chat apps feel like tools. We wanted one that feels like a place:
              somewhere you open with a smile, where your friends are one tap away and
              nothing gets between you and the conversation.
            </p>
            <p className="mt-3 text-base-content/70">
              OnlyChat keeps things simple on purpose. Real-time messages, photos,
              presence and a look you can change whenever you like.
            </p>

            <ul className="mt-6 space-y-3">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="grid size-6 place-items-center rounded-full bg-primary/15 text-primary">
                    <Check className="size-4" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>

            <div className="mt-8 grid grid-cols-3 gap-4">
              {STATS.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-base-300 bg-base-200 p-4 text-center"
                >
                  <p className="text-3xl font-extrabold text-primary">{s.value}</p>
                  <p className="text-xs uppercase tracking-wider text-base-content/60">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-20 bg-base-200/60 py-24">
        <div className="container mx-auto px-4">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              How it works
            </p>
            <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">
              From hello to chatting in three steps
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <div className="relative h-full rounded-3xl border border-base-300 bg-base-100 p-8 transition-transform duration-300 hover:-translate-y-2">
                  <span className="absolute right-6 top-4 text-6xl font-black text-base-content/5">
                    {i + 1}
                  </span>
                  <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg shadow-primary/30">
                    <s.icon className="size-7" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-sm text-base-content/70">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutSection;