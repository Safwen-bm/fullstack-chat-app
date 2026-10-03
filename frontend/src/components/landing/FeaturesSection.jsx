import { Image as ImageIcon, Palette, Radio, ShieldCheck, Zap } from "lucide-react";
import { LandingImage, Reveal } from "./shared";

const THEME_DOTS = ["light", "dark", "dracula", "sunset", "nord", "luxury"];

const ImageCard = ({ src, icon: Icon, tag, title, text, className = "", fallbackClass }) => (
  <div
    className={`group relative overflow-hidden rounded-3xl border border-base-300 bg-neutral ${className}`}
  >
    <LandingImage
      src={src}
      fallbackClass={fallbackClass}
      className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-neutral/95 via-neutral/40 to-transparent" />
    <div className="relative flex h-full flex-col justify-end p-6 text-neutral-content">
      <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
        <Icon className="size-3.5" />
        {tag}
      </span>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-neutral-content/80">{text}</p>
    </div>
  </div>
);

const FeaturesSection = () => {
  return (
    <section id="features" className="container mx-auto scroll-mt-20 px-4 py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Features
        </p>
        <h2 className="mt-3 text-4xl font-extrabold sm:text-5xl">
          Everything a good conversation needs
        </h2>
        <p className="mt-4 text-base-content/70">
          No clutter, no noise. Just the tools that make talking to your people fast,
          fun and personal.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 md:grid-cols-6">
        <Reveal className="md:col-span-4">
          <ImageCard
            className="h-80"
            src="/landing/feature-realtime.jpg"
            fallbackClass="from-primary/70 to-secondary/70"
            icon={Zap}
            tag="Real-time"
            title="Messages land the instant you hit send"
            text="Powered by sockets, so conversations flow without refreshing or waiting."
          />
        </Reveal>

        <Reveal className="md:col-span-2" delay={100}>
          <ImageCard
            className="h-80"
            src="/landing/feature-photos.jpg"
            fallbackClass="from-secondary/70 to-accent/70"
            icon={ImageIcon}
            tag="Photos"
            title="Share the moment"
            text="Drop a picture into the chat and let it do the talking."
          />
        </Reveal>

        <Reveal className="md:col-span-2">
          <ImageCard
            className="h-64"
            src="/landing/feature-presence.jpg"
            fallbackClass="from-accent/70 to-primary/70"
            icon={Radio}
            tag="Presence"
            title="See who is around"
            text="Green dots show who is online right now."
          />
        </Reveal>

        <Reveal className="md:col-span-2" delay={100}>
          <div className="flex h-64 flex-col justify-between rounded-3xl border border-base-300 bg-base-200 p-6">
            <div className="flex -space-x-2">
              {THEME_DOTS.map((t) => (
                <div
                  key={t}
                  data-theme={t}
                  title={t}
                  className="size-9 rounded-full bg-primary ring-2 ring-base-200"
                />
              ))}
            </div>
            <div>
              <span className="mb-2 inline-flex items-center gap-2 text-xs font-medium text-primary">
                <Palette className="size-3.5" />
                Themes
              </span>
              <h3 className="text-2xl font-bold">10 themes, zero effort</h3>
              <p className="mt-1 text-sm text-base-content/70">
                From soft light to deep dracula.{" "}
                <a href="#themes" className="link link-primary">
                  Try them live
                </a>
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="md:col-span-2" delay={200}>
          <div className="flex h-64 flex-col justify-between rounded-3xl border border-base-300 bg-gradient-to-br from-primary/15 to-secondary/15 p-6">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary text-primary-content shadow-lg shadow-primary/30">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Sign in securely</h3>
              <p className="mt-1 text-sm text-base-content/70">
                Your session is protected and your chats stay between you and the people
                you talk to.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default FeaturesSection;