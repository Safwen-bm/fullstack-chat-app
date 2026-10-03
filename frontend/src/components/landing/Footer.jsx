import React from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Github, Linkedin, MessageSquare } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

const EXPLORE = [
  { href: "#features", label: "Features" },
  { href: "#themes", label: "Themes" },
  { href: "#about", label: "About us" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

const SOCIALS = [
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/safwen-ben-mabrouk",
    icon: Linkedin,
  },
  {
    name: "GitHub",
    href: "https://github.com/Safwen-bm",
    icon: Github,
  },
];

const footerLink =
  "text-sm text-base-content/70 transition-colors hover:text-primary";

const Footer = () => {
  const { authUser } = useAuthStore();

  return (
    <footer className="relative overflow-hidden border-t border-base-300 bg-base-200/60">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative mx-auto px-4 pt-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="grid size-11 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content shadow-md shadow-primary/30">
                <MessageSquare className="size-5" />
              </span>
              <span className="text-2xl font-extrabold">OnlyChat</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-base-content/70">
              A real-time chat app for the people who matter. Fast, personal and made
              to feel alive.
            </p>
          </div>

          {/* explore */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest">Explore</h4>
            <ul className="mt-4 space-y-3">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={footerLink}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* account */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest">Account</h4>
            <ul className="mt-4 space-y-3">
              {authUser ? (
                <>
                  <li>
                    <Link to="/chat" className={footerLink}>
                      Open chat
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className={footerLink}>
                      Profile
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/login" className={footerLink}>
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link to="/signup" className={footerLink}>
                      Sign up
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link to="/settings" className={footerLink}>
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* connect: icons only */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest">
              Find me online
            </h4>
            <div className="mt-4 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  title={s.name}
                  className="grid size-11 place-items-center rounded-full border border-base-300 bg-base-100 transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:bg-primary hover:text-primary-content hover:shadow-lg hover:shadow-primary/30"
                >
                  <s.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-base-300 pt-6 text-sm text-base-content/60 sm:flex-row">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} OnlyChat. Built by{" "}
            <span className="font-semibold text-base-content">Safwen Ben Mabrouk</span>.
            All rights reserved.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-4 py-2 font-medium transition-all hover:border-primary/50 hover:text-primary"
          >
            Back to top
            <ArrowUp className="size-4" />
          </button>
        </div>

        {/* giant faded wordmark */}
        <div
          aria-hidden="true"
          className="-mb-3 mt-8 select-none bg-gradient-to-b from-primary/30 to-transparent bg-clip-text text-center text-[20vw] font-black leading-none tracking-tighter text-transparent sm:text-[14vw] lg:text-[11rem]"
        >
          OnlyChat
        </div>
      </div>
    </footer>
  );
};

export default Footer;