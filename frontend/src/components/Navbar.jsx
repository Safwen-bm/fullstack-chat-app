import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, MessageSquare, MessagesSquare, Settings } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const pill = (active) => `
  px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium
  border shadow-sm backdrop-blur transition-all duration-300
  ${active
    ? "bg-primary/20 border-primary/40 text-primary"
    : "bg-base-200/60 border-base-300 hover:bg-base-200"}
`;

const SECTION_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#themes", label: "Themes" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
];

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLanding = location.pathname === "/";

  return (
    <header
      className={`
        fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-xl
        ${scrolled
          ? "bg-base-100/80 shadow-lg border-b border-base-300"
          : "bg-base-100/40 border-b border-base-300/50"}
      `}
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group relative">
            <div
              className="
                size-11 rounded-2xl bg-primary/10 flex items-center justify-center
                border border-primary/30 shadow-sm backdrop-blur-sm
                transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20
              "
            >
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>

            <h1
              className="
                text-2xl font-extrabold tracking-wider select-none
                bg-gradient-to-r from-primary via-secondary to-primary
                bg-clip-text text-transparent
                transition-all duration-300 group-hover:tracking-widest group-hover:scale-105
              "
            >
              OnlyChat
            </h1>

            <span
              className="
                absolute -bottom-1 left-0 w-0 h-[2px] bg-primary/70 rounded-full
                transition-all duration-300 group-hover:w-full
              "
            />
          </Link>

          {/* SECTION LINKS (landing only) */}
          {onLanding && (
            <nav className="hidden md:flex items-center gap-1">
              {SECTION_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-base-content/70 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          )}

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">
            <Link to="/settings" className={pill(location.pathname === "/settings")}>
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser ? (
              <>
                <Link to="/chat" className={pill(location.pathname === "/chat")}>
                  <MessagesSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Chat</span>
                </Link>

                <Link to="/profile" className={pill(location.pathname === "/profile")}>
                  <div className="relative">
                    <img
                      src={authUser.profilePic || "/avatar.png"}
                      alt="Your avatar"
                      className="size-6 rounded-full object-cover shadow"
                    />
                    <span
                      className="
                        absolute -bottom-0.5 -right-0.5 size-2.5
                        bg-green-500 rounded-full border border-white
                      "
                    />
                  </div>
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <button
                  onClick={logout}
                  className="
                    px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium
                    bg-red-500/10 text-red-600 border border-red-400/20 shadow-sm
                    hover:bg-red-500/20 hover:text-red-700 active:scale-95
                    transition-all duration-300 backdrop-blur
                  "
                >
                  <LogOut className="size-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm rounded-xl">
                  Log in
                </Link>
                <Link to="/signup" className="btn btn-primary btn-sm rounded-xl">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* bottom glow strip */}
      <div
        className="
          absolute bottom-0 left-0 w-full h-[2px]
          bg-gradient-to-r from-transparent via-primary/40 to-transparent
          opacity-80
        "
      />
    </header>
  );
};

export default Navbar;