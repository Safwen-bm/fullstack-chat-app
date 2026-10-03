import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { Avatar, LandingImage, Reveal } from "./shared";
import { PEOPLE } from "./data";

const CtaFooter = () => {
  const { authUser } = useAuthStore();

  return (
    <>
      <section className="container mx-auto px-4 pb-24">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[2.5rem] bg-neutral px-6 py-20 text-center text-neutral-content">
            <LandingImage
              src="/landing/cta-bg.jpg"
              fallbackClass="from-primary/60 to-secondary/60"
              className="absolute inset-0 -z-10 h-full w-full opacity-70"
            />
            <div className="absolute inset-0 -z-10 bg-neutral/50" />

            <div className="mb-6 flex justify-center -space-x-3">
              {PEOPLE.map((p) => (
                <Avatar
                  key={p.name}
                  src={p.src}
                  name={p.name}
                  size="size-12"
                  className="rounded-full ring-2 ring-neutral"
                />
              ))}
            </div>

            <h2 className="mx-auto max-w-2xl text-4xl font-extrabold sm:text-5xl">
              Your people are one message away
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-neutral-content/80">
              Jump in, say hi, and make your next conversation a good one.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {authUser ? (
                <Link to="/chat" className="btn btn-primary btn-lg gap-2 rounded-full">
                  Open your chats
                  <ArrowRight className="size-5" />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-lg gap-2 rounded-full">
                    Create your account
                    <ArrowRight className="size-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="btn btn-lg rounded-full border-white/30 bg-white/10 text-neutral-content hover:bg-white/20"
                  >
                    I already have one
                  </Link>
                </>
              )}
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-base-300 bg-base-200/50">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-xl border border-primary/30 bg-primary/10">
              <MessageSquare className="size-5 text-primary" />
            </div>
            <span className="text-lg font-extrabold">OnlyChat</span>
          </Link>

          <nav className="flex flex-wrap justify-center gap-5 text-sm text-base-content/70">
            <a href="#features" className="hover:text-primary">Features</a>
            <a href="#themes" className="hover:text-primary">Themes</a>
            <a href="#about" className="hover:text-primary">About</a>
            <a href="#faq" className="hover:text-primary">FAQ</a>
          </nav>

          <p className="text-center text-sm text-base-content/60">
            © {new Date().getFullYear()} OnlyChat. Built with React, Node, MongoDB and
            Socket.io.
          </p>
        </div>
      </footer>
    </>
  );
};

export default CtaFooter;