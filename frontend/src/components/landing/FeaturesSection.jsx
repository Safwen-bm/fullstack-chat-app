import React from "react";
import { Image as ImageIcon, Palette, Radio, ShieldCheck, Zap } from "lucide-react";
import { LandingImage, Reveal } from "./shared";

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

const IMG_CLASS =
  "absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-110";

/* Every card shares the same shell: a background, a dark fade, and the text */
const FeatureCard = ({ background, icon: Icon, tag, title, className = "", children }) => (
  <div
    className={`group relative overflow-hidden rounded-3xl border border-base-300 bg-neutral ${className}`}
  >
    {background}
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral/95 via-neutral/40 to-transparent" />
    <div className="pointer-events-none relative flex h-full flex-col justify-end p-6 text-neutral-content">
      <span className="mb-3 inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
        <Icon className="size-3.5" />
        {tag}
      </span>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-neutral-content/80">{children}</p>
    </div>
  </div>
);

const FeaturesSection = () => {
  return (
    <section id="features" className="container mx-auto scroll-mt-24 px-4 py-24">
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
          <FeatureCard
            className="h-80"
            icon={Zap}
            tag="Real-time"
            title="Messages land the instant you hit send"
            background={
              <LandingImage
                src="/landing/feature-realtime.jpg"
                fallbackClass="from-primary/70 to-secondary/70"
                className={IMG_CLASS}
              />
            }
          >
            Powered by sockets, so conversations flow without refreshing or waiting.
          </FeatureCard>
        </Reveal>

        <Reveal className="md:col-span-2" delay={100}>
          <FeatureCard
            className="h-80"
            icon={ImageIcon}
            tag="Photos"
            title="Share the moment"
            background={
              <LandingImage
                src="/landing/feature-photos.jpg"
                fallbackClass="from-secondary/70 to-accent/70"
                className={IMG_CLASS}
              />
            }
          >
            Drop a picture into the chat and let it do the talking.
          </FeatureCard>
        </Reveal>

        <Reveal className="md:col-span-2">
          <FeatureCard
            className="h-64"
            icon={Radio}
            tag="Presence"
            title="See who is around"
            background={
              <LandingImage
                src="/landing/feature-presence.jpg"
                fallbackClass="from-accent/70 to-primary/70"
                className={IMG_CLASS}
              />
            }
          >
            Green dots show who is online right now.
          </FeatureCard>
        </Reveal>

        {/* THEMES: stripes made from the real colors of each theme */}
        <Reveal className="md:col-span-2" delay={100}>
          <FeatureCard
            className="h-64"
            icon={Palette}
            tag="Themes"
            title="10 themes, zero effort"
            background={
              <div className="absolute inset-0 flex">
                {THEMES.map((t) => (
                  <div
                    key={t}
                    data-theme={t}
                    title={t}
                    className="flex-1 bg-gradient-to-b from-primary via-secondary to-accent transition-all duration-500 hover:flex-[4]"
                  />
                ))}
              </div>
            }
          >
            From soft light to deep dracula.{" "}
            <a
              href="#themes"
              className="pointer-events-auto underline underline-offset-2 hover:text-white"
            >
              Try them live
            </a>
          </FeatureCard>
        </Reveal>

        <Reveal className="md:col-span-2" delay={200}>
          <FeatureCard
            className="h-64"
            icon={ShieldCheck}
            tag="Security"
            title="Sign in securely"
            background={
              <LandingImage
                src="/landing/feature-secure.jpg"
                fallbackClass="from-primary/80 to-accent/70"
                className={IMG_CLASS}
              />
            }
          >
            Your session is protected and your chats stay between you and the people you
            talk to.
          </FeatureCard>
        </Reveal>
      </div>
    </section>
  );
};

export default FeaturesSection;