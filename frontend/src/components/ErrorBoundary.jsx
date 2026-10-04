import React from "react";
import { Home, RefreshCw } from "lucide-react";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="grid min-h-dvh place-items-center bg-base-200 px-4 pt-24">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 grid size-20 place-items-center rounded-3xl bg-error/15 text-4xl">
            😵
          </div>
          <h1 className="text-3xl font-extrabold">Something went wrong</h1>
          <p className="mt-3 text-base-content/70">
            An unexpected error stopped this page. Reloading usually fixes it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-primary gap-2 rounded-full"
            >
              <RefreshCw className="size-4" />
              Reload the page
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="btn btn-outline gap-2 rounded-full"
            >
              <Home className="size-4" />
              Go home
            </button>
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;