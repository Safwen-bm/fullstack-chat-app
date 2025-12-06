import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 w-full z-50 transition-all duration-300
        backdrop-blur-xl 
        ${scrolled ? "bg-white/30 shadow-lg border-b border-white/40" : "bg-white/10 border-b border-white/20"}
      `}
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-3 group relative"
          >
            <div className="
              size-11 rounded-2xl bg-primary/10 flex items-center justify-center
              border border-primary/30 shadow-sm backdrop-blur-sm
              transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20
            ">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>

            <h1
              className="
                text-2xl font-extrabold tracking-wider select-none
                bg-gradient-to-r from-primary via-purple-500 to-primary
                bg-clip-text text-transparent 
                transition-all duration-300 group-hover:tracking-widest group-hover:scale-105
              "
            >
              OnlyChat
            </h1>

            {/* glowing underline */}
            <span className="
              absolute -bottom-1 left-0 w-0 h-[2px] bg-primary/70 rounded-full
              transition-all duration-300 group-hover:w-full
            " />
          </Link>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3">

            {/* SETTINGS */}
            <Link
              to="/settings"
              className={`
                px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium
                border shadow-sm backdrop-blur
                transition-all duration-300
                ${location.pathname === "/settings"
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "bg-white/30 border-white/40 hover:bg-white/50"
                }
              `}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {/* Logged in */}
            {authUser && (
              <>
                {/* PROFILE */}
                <Link
                  to="/profile"
                  className={`
                    px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium
                    border shadow-sm backdrop-blur
                    transition-all duration-300 
                    ${location.pathname === "/profile"
                      ? "bg-primary/20 border-primary/40 text-primary"
                      : "bg-white/30 border-white/40 hover:bg-white/50"
                    }
                  `}
                >
                  <div className="relative">
                    <img
                      src={authUser.profilePic || "/avatar.png"}
                      className="size-6 rounded-full object-cover shadow"
                    />
                    {/* online dot */}
                    <span className="
                      absolute -bottom-0.5 -right-0.5 size-2.5 
                      bg-green-500 rounded-full border border-white
                    " />
                  </div>

                  <span className="hidden sm:inline">Profile</span>
                </Link>

                {/* LOGOUT */}
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
            )}
          </div>
        </div>
      </div>

      {/* bottom glow strip */}
      <div className="
        absolute bottom-0 left-0 w-full h-[2px]
        bg-gradient-to-r from-transparent via-primary/40 to-transparent
        opacity-80
      " />
    </header>
  );
};

export default Navbar;
