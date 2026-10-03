import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Info,
  LogOut,
  Menu,
  MessageCircle,
  MessageSquare,
  MessagesSquare,
  Palette,
  Sparkles,
  X,
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import ThemeSwitcher from "./ThemeSwitcher";
import { useChatStore } from "../store/useChatStore";

const SECTION_LINKS = [
  { id: "features", label: "Features", icon: Sparkles },
  { id: "themes", label: "Themes", icon: Palette },
  { id: "about", label: "About", icon: Info },
  { id: "faq", label: "FAQ", icon: MessageCircle },
];

const SECTION_IDS = ["features", "themes", "about", "how", "faq"];

const NavPill = ({ to, active, title, children }) => (
  <Link
    to={to}
    title={title}
    className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all ${
      active
        ? "bg-primary/15 text-primary"
        : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
    }`}
  >
    {children}
  </Link>
);

const rowClass = (active) =>
  `flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition-colors ${
    active ? "bg-primary/15 text-primary" : "hover:bg-base-200"
  }`;

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const path = location.pathname;
  const onLanding = path === "/";
  const inConversation = useChatStore((s) => path === "/chat" && !!s.selectedUser);

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState("");

  const close = () => setOpen(false);

  // blur / shadow when scrolled, and clear the active section at the top
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      if (window.scrollY < 300) setActiveId("");
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close the mobile menu when the route changes
  useEffect(() => {
    setOpen(false);
  }, [path]);

  // close the mobile menu with Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // scroll spy for the landing page sections
  useEffect(() => {
    if (!onLanding) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id === "how" ? "about" : entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [onLanding]);

  return (
    <header 
      className={`fixed inset-x-0 top-3 z-50 px-3 ${
        inConversation ? "hidden lg:block" : ""
      }`}
    >
      {/* backdrop for the mobile menu */}
      {open && (
        <div
          onClick={close}
          className="fixed inset-0 -z-10 bg-base-300/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* FLOATING PILL */}
      <div
        className={`mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border pl-2 pr-2 backdrop-blur-xl transition-all duration-300 ${
          scrolled || open
            ? "border-base-300 bg-base-100/85 shadow-xl"
            : "border-base-300/50 bg-base-100/50 shadow-md"
        }`}
      >
        {/* LOGO */}
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content shadow-md shadow-primary/30 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
            <MessageSquare className="size-5" />
          </span>
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-xl font-extrabold tracking-wide text-transparent">
            OnlyChat
          </span>
        </Link>

        {/* SECTION LINKS (desktop, landing only) */}
        {onLanding && (
          <nav className="hidden items-center gap-1 rounded-full border border-base-300/60 bg-base-200/60 p-1 lg:flex">
            {SECTION_LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  activeId === l.id
                    ? "bg-primary text-primary-content shadow"
                    : "text-base-content/70 hover:bg-base-100 hover:text-base-content"
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>
        )}

        {/* ACTIONS (desktop) */}
        <div className="hidden items-center gap-1 lg:flex">
          <ThemeSwitcher />

          {authUser ? (
            <>
              <NavPill to="/chat" active={path === "/chat"} title="Chat">
                <MessagesSquare className="size-4" />
                <span className="hidden xl:inline">Chat</span>
              </NavPill>

              <NavPill to="/profile" active={path === "/profile"} title="Profile">
                <div className="relative">
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt="Your avatar"
                    className="size-6 rounded-full object-cover shadow"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border border-white bg-green-500" />
                </div>
                <span className="hidden xl:inline">Profile</span>
              </NavPill>

              <button
                onClick={logout}
                title="Logout"
                className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-error transition-all hover:bg-error/10 active:scale-95"
              >
                <LogOut className="size-4" />
                <span className="hidden xl:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm rounded-full">
                Log in
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary btn-sm rounded-full shadow-md shadow-primary/30"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* BURGER (mobile and tablet) */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="grid size-10 place-items-center rounded-full border border-base-300 bg-base-200/70 transition-all active:scale-90 lg:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* MOBILE PANEL */}
      {open && (
        <div className="animate-pop mx-auto mt-2 max-h-[80vh] max-w-6xl overflow-y-auto rounded-3xl border border-base-300 bg-base-100/95 p-3 shadow-2xl backdrop-blur-xl lg:hidden">
          {onLanding && (
            <>
              <nav className="space-y-1">
                {SECTION_LINKS.map((l) => (
                  <a
                    key={l.id}
                    href={`#${l.id}`}
                    onClick={close}
                    className={rowClass(activeId === l.id)}
                  >
                    <l.icon className="size-5" />
                    {l.label}
                  </a>
                ))}
              </nav>
              <div className="my-2 h-px bg-base-300" />
            </>
          )}

          <div className="space-y-1">
            {authUser && (
              <Link to="/chat" onClick={close} className={rowClass(path === "/chat")}>
                <MessagesSquare className="size-5" />
                Chat
              </Link>
            )}

            {authUser && (
              <Link to="/profile" onClick={close} className={rowClass(path === "/profile")}>
                <img
                  src={authUser.profilePic || "/avatar.png"}
                  alt="Your avatar"
                  className="size-5 rounded-full object-cover"
                />
                Profile
              </Link>
            )}

            <ThemeSwitcher variant="inline" />

            {authUser && (
              <button
                onClick={() => {
                  close();
                  logout();
                }}
                className={`${rowClass(false)} text-error hover:bg-error/10`}
              >
                <LogOut className="size-5" />
                Logout
              </button>
            )}
          </div>

          {!authUser && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link to="/login" onClick={close} className="btn btn-outline rounded-full">
                Log in
              </Link>
              <Link to="/signup" onClick={close} className="btn btn-primary rounded-full">
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;