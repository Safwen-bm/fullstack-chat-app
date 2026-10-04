import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, LogIn, MessagesSquare } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const NotFoundPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.authUser);

  useEffect(() => {
    const previous = document.title;
    document.title = "Page not found | OnlyChat";
    return () => {
      document.title = previous;
    };
  }, []);

  const goBack = () => {
    // a direct visit has no history to go back to
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-base-200 to-secondary/10 px-4 pb-16 pt-28">
      <div className="pointer-events-none absolute inset-0 text-base-content/20 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="pointer-events-none absolute -left-24 top-10 size-80 animate-blob rounded-full bg-primary/20 blur-3xl motion-reduce:animate-none" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-80 animate-blob rounded-full bg-secondary/20 blur-3xl [animation-delay:-6s] motion-reduce:animate-none" />

      <div className="relative w-full max-w-xl text-center">
        <div className="relative mx-auto w-fit">
          <h1 className="animate-gradient select-none bg-gradient-to-r from-primary via-secondary to-accent bg-[length:200%_auto] bg-clip-text text-[8rem] font-black leading-none tracking-tighter text-transparent sm:text-[11rem]">
            404
          </h1>

          <span className="absolute -top-2 left-0 animate-float rounded-2xl rounded-br-sm border border-base-300 bg-base-100 px-3 py-1.5 text-sm shadow-lg motion-reduce:animate-none sm:-left-16">
            Hello? Anyone here? 👀
          </span>
          <span className="absolute -bottom-2 right-0 animate-float rounded-2xl rounded-bl-sm bg-primary px-3 py-1.5 text-sm text-primary-content shadow-lg [animation-delay:-3s] motion-reduce:animate-none sm:-right-20">
            This page left the chat
          </span>
        </div>

        <h2 className="mt-8 text-3xl font-extrabold">Lost in the conversation</h2>
        <p className="mx-auto mt-3 max-w-md text-base-content/70">
          We could not find{" "}
          <code className="break-all rounded-md bg-base-300 px-2 py-0.5 text-sm">
            {pathname}
          </code>
          . It may have moved, or the link is broken.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn btn-primary gap-2 rounded-full shadow-lg shadow-primary/30">
            <Home className="size-4" />
            Back to home
          </Link>

          <button type="button" onClick={goBack} className="btn btn-outline gap-2 rounded-full">
            <ArrowLeft className="size-4" />
            Go back
          </button>

          {authUser ? (
            <Link to="/chat" className="btn btn-ghost gap-2 rounded-full">
              <MessagesSquare className="size-4" />
              Open chat
            </Link>
          ) : (
            <Link to="/login" className="btn btn-ghost gap-2 rounded-full">
              <LogIn className="size-4" />
              Log in
            </Link>
          )}
        </div>
      </div>
    </main>
  );
};

export default NotFoundPage;