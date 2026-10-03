import React from "react";
import { MessageSquare } from "lucide-react";
import AuthShowcase from "./AuthShowcase";

const AuthLayout = ({
  title,
  subtitle,
  footer,
  variant,
  showcaseTitle,
  showcaseSubtitle,
  children,
}) => {
  return (
    <div className="grid min-h-screen bg-base-200 lg:grid-cols-2">
      {/* FORM SIDE (first in the DOM so keyboard focus lands on the form) */}
      <div className="relative flex items-center justify-center overflow-hidden px-4 pb-12 pt-10 sm:px-12 lg:pt-28">
        <div className="pointer-events-none absolute -left-20 top-10 size-72 rounded-full bg-primary/20 blur-3xl motion-reduce:animate-none lg:animate-blob" />
        <div className="pointer-events-none absolute -right-20 bottom-0 size-72 rounded-full bg-secondary/20 blur-3xl [animation-delay:-7s] motion-reduce:animate-none lg:animate-blob" />

        <div className="animate-pop relative w-full max-w-md rounded-3xl border border-base-300/60 bg-base-100/75 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-content shadow-lg shadow-primary/30">
              <MessageSquare className="size-7" />
            </div>
            <h1 className="mt-5 text-3xl font-extrabold">{title}</h1>
            <p className="mt-1 text-base-content/60">{subtitle}</p>
          </div>

          {children}

          <div className="mt-6 text-center text-base-content/60">{footer}</div>
        </div>
      </div>

      {/* SHOWCASE: above the form on small screens, on the right on large screens */}
      <AuthShowcase variant={variant} title={showcaseTitle} subtitle={showcaseSubtitle} />
    </div>
  );
};

export default AuthLayout;