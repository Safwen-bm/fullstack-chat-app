import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Phone, Send, Sparkles, Video } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { Avatar, LandingImage } from "./shared";
import { PEOPLE } from "./data";

const SCRIPT = [
  { from: "them", text: "Are you coming tonight? 🎉" },
  { from: "me", text: "Wouldn't miss it!" },
  { from: "them", text: "Look at this view", image: "/landing/chat-photo-1.jpg" },
  { from: "me", text: "Okay now I'm jealous 😍" },
  { from: "them", text: "Saving you a seat ✨" },
];

const TOPICS = [
  "Late night talks",
  "Group plans",
  "Photo dumps",
  "Memes only",
  "Good morning texts",
  "Study sessions",
  "Road trip playlists",
  "Birthday surprises",
];

const Bubble = ({ msg }) => {
  const mine = msg.from === "me";
  return (
    <div
      className={`animate-pop max-w-[82%] text-[13px] leading-snug ${
        mine ? "self-end" : "self-start"
      }`}
    >
      <div
        className={`rounded-2xl px-3 py-2 ${
          mine
            ? "bg-primary text-primary-content rounded-br-md"
            : "bg-base-200 rounded-bl-md"
        }`}
      >
        {msg.image && (
          <LandingImage src={msg.image} className="mb-2 h-28 w-44 rounded-xl" />
        )}
        {msg.text}
      </div>
    </div>
  );
};

const PhoneChat = () => {
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    let timer;
    if (count < SCRIPT.length) {
      const fromThem = SCRIPT[count].from === "them";
      setTyping(fromThem);
      timer = setTimeout(
        () => {
          setTyping(false);
          setCount((c) => c + 1);
        },
        fromThem ? 1500 : 900
      );
    } else {
      timer = setTimeout(() => setCount(0), 3800);
    }
    return () => clearTimeout(timer);
  }, [count]);

  const lina = PEOPLE[0];

  return (
    <div className="relative w-[290px] sm:w-[320px] overflow-hidden rounded-[2.8rem] border-[9px] border-neutral bg-base-100 shadow-2xl shadow-primary/30">
      <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-neutral" />

      {/* stories */}
      <div className="px-4 pb-3 pt-10">
        <div className="flex gap-3">
          {PEOPLE.slice(1, 5).map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-1">
              <Avatar src={p.src} name={p.name} size="size-11" ring />
              <span className="text-[10px] text-base-content/60">{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* chat header */}
      <div className="flex items-center gap-3 border-y border-base-300 px-4 py-3">
        <Avatar src={lina.src} name={lina.name} size="size-9" online />
        <div className="flex-1 leading-tight">
          <p className="text-sm font-semibold">{lina.name}</p>
          <p className="text-[11px] text-success">online</p>
        </div>
        <Phone className="size-4 text-base-content/50" />
        <Video className="size-4 text-base-content/50" />
      </div>

      {/* messages */}
      <div className="flex h-[290px] flex-col justify-end gap-2 overflow-hidden px-3 py-3 [mask-image:linear-gradient(to_bottom,transparent,black_18%)]">
        {SCRIPT.slice(0, count).map((m, i) => (
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

      {/* input */}
      <div className="flex items-center gap-2 border-t border-base-300 px-3 py-3">
        <div className="flex-1 rounded-full bg-base-200 px-4 py-2 text-xs text-base-content/50">
          Message {lina.name}...
        </div>
        <div className="grid size-8 place-items-center rounded-full bg-primary text-primary-content">
          <Send className="size-4" />
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  const { authUser } = useAuthStore();

  return (
    <section className="relative isolate pt-28">
      {/* background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <LandingImage
          src="/landing/hero-bg.jpg"
          className="h-full w-full opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent)]"
          fallbackClass="from-transparent to-transparent"
        />
        <div className="absolute -left-24 top-10 size-96 animate-blob rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -right-24 top-40 size-96 animate-blob rounded-full bg-secondary/30 blur-3xl [animation-delay:-6s]" />
      </div>

      <div className="container mx-auto grid items-center gap-16 px-4 pb-20 lg:grid-cols-2">
        {/* LEFT */}
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="size-4" />
            Chat that feels alive
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl">
            Talk to your people.
            <span className="block animate-gradient bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_auto] bg-clip-text pb-2 text-transparent">
              Like you are in the same room.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-base-content/70 lg:mx-0">
            OnlyChat is a real-time messaging app made for the moments that matter.
            Instant messages, photo sharing, live presence and ten themes to match
            your mood.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {authUser ? (
              <Link
                to="/chat"
                className="btn btn-primary btn-lg gap-2 rounded-full shadow-lg shadow-primary/30"
              >
                Open your chats
                <ArrowRight className="size-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-lg gap-2 rounded-full shadow-lg shadow-primary/30"
                >
                  Get started
                  <ArrowRight className="size-5" />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg rounded-full">
                  Log in
                </Link>
              </>
            )}
            <a href="#features" className="btn btn-ghost btn-lg rounded-full">
              See features
            </a>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 lg:justify-start">
            <div className="flex -space-x-3">
              {PEOPLE.slice(0, 5).map((p) => (
                <Avatar
                  key={p.name}
                  src={p.src}
                  name={p.name}
                  size="size-10"
                  className="rounded-full ring-2 ring-base-100"
                />
              ))}
            </div>
            <p className="text-sm text-base-content/70">
              Invite your friends and
              <br />
              start talking in seconds.
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative mx-auto w-fit">
          <div className="absolute inset-0 m-auto size-72 rounded-full bg-gradient-to-tr from-primary/40 to-secondary/40 blur-2xl" />

          <div className="relative animate-float-slow">
            <PhoneChat />
          </div>

          <div className="absolute -left-20 top-24 hidden animate-float items-center gap-2 rounded-2xl border border-base-300 bg-base-100/90 px-3 py-2 text-sm shadow-xl backdrop-blur lg:flex">
            <Heart className="size-4 fill-error text-error" />
            Maya liked your photo
          </div>

          <div className="absolute -right-16 top-56 hidden animate-float items-center gap-2 rounded-2xl border border-base-300 bg-base-100/90 px-3 py-2 text-sm shadow-xl backdrop-blur [animation-delay:-2s] lg:flex">
            <Avatar src={PEOPLE[3].src} name={PEOPLE[3].name} size="size-6" />
            3 new messages
          </div>

          <div className="absolute -left-24 bottom-24 hidden animate-float items-center gap-2 rounded-2xl border border-base-300 bg-base-100/90 px-3 py-2 text-sm shadow-xl backdrop-blur [animation-delay:-4s] lg:flex">
            <span className="size-2.5 rounded-full bg-success" />
            Weekend plans, 5 online
          </div>
        </div>
      </div>

      {/* marquee */}
      <div className="relative overflow-hidden border-y border-base-300 bg-base-200/60 py-4">
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {[...TOPICS, ...TOPICS].map((t, i) => (
            <span
              key={i}
              className="mr-4 inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-5 py-2 text-sm font-medium text-base-content/80"
            >
              <span className="size-1.5 rounded-full bg-primary" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;