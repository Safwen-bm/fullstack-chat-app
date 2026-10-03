import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Palette } from "lucide-react";
import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";

const LABEL = "Theme";

const ThemeList = () => {
  const { theme, setTheme } = useThemeStore();

  const pick = (t) => {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {THEMES.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => pick(t)}
          className={`flex items-center gap-2 rounded-xl border p-2 text-left text-sm transition-all ${
            theme === t
              ? "border-primary bg-primary/10"
              : "border-base-300 hover:border-primary/40 hover:bg-base-200"
          }`}
        >
          <span
            data-theme={t}
            className="flex shrink-0 -space-x-1 rounded-full bg-base-100 p-1 ring-1 ring-base-300"
          >
            <span className="size-3.5 rounded-full bg-primary" />
            <span className="size-3.5 rounded-full bg-secondary" />
            <span className="size-3.5 rounded-full bg-accent" />
          </span>
          <span className="flex-1 truncate font-medium capitalize">{t}</span>
          {theme === t && <Check className="size-4 shrink-0 text-primary" />}
        </button>
      ))}
    </div>
  );
};

/*
  variant="dropdown": button + floating panel (desktop navbar)
  variant="inline":   expandable row (mobile menu)
*/
const ThemeSwitcher = ({ variant = "dropdown" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { theme } = useThemeStore();

  // close on outside click or Escape (dropdown only)
  useEffect(() => {
    if (!open || variant !== "dropdown") return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, variant]);

  if (variant === "inline") {
    return (
      <div>
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition-colors ${
            open ? "bg-primary/15 text-primary" : "hover:bg-base-200"
          }`}
        >
          <Palette className="size-5" />
          {LABEL}
          <span className="ml-auto text-xs capitalize text-base-content/50">{theme}</span>
          <ChevronDown
            className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="animate-pop px-1 pb-2 pt-2">
            <ThemeList />
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Change theme"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all ${
          open
            ? "bg-primary/15 text-primary"
            : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
        }`}
      >
        <Palette className="size-4" />
        <span className="hidden xl:inline">{LABEL}</span>
        <ChevronDown
          className={`size-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="animate-pop absolute right-0 top-full z-50 mt-3 w-72 rounded-3xl border border-base-300 bg-base-100/95 p-3 shadow-2xl backdrop-blur-xl">
          <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-base-content/60">
            Choose a theme
          </p>
          <ThemeList />
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;