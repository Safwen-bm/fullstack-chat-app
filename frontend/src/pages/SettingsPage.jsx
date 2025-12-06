import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-4 pt-20 flex justify-center items-start">
      <div className="w-full max-w-4xl space-y-8">

        {/* THEME SELECTOR */}
        <section className="space-y-2">
          <h2 className="text-lg font-bold">Theme</h2>
          <p className="text-sm text-base-content/60">
            Choose the appearance for your chat interface
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTheme(t);
                  document.documentElement.setAttribute("data-theme", t);
                }}
                className={`
                  group flex flex-col items-center p-2 rounded-lg border text-xs
                  transition-all 
                  ${theme === t
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-base-300 hover:bg-base-200/40"}
                `}
              >
                <div
                  className="w-full h-7 rounded-md overflow-hidden shadow-inner"
                  data-theme={t}
                >
                  <div className="grid grid-cols-4 gap-px p-1 h-full">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>

                <span className="mt-1 truncate w-full text-center font-medium">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* PREVIEW */}
        <section className="space-y-3">
          <h3 className="text-lg font-bold">Preview</h3>

          <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-md">
            <div className="p-4 bg-base-200">

              <div className="bg-base-100 rounded-xl border border-base-300 shadow-sm overflow-hidden">

                {/* Chat Header */}
                <div className="px-3 py-2 border-b border-base-300 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center text-xs">
                    J
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">John Doe</h4>
                    <p className="text-xs text-base-content/70">Online</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="p-3 space-y-2 min-h-[140px] max-h-[140px] overflow-y-auto">
                  {PREVIEW_MESSAGES.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`
                          max-w-[75%] rounded-xl p-2 text-xs shadow-sm
                          ${msg.isSent
                            ? "bg-primary text-primary-content"
                            : "bg-base-200"}
                        `}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={`
                            mt-1 text-[10px]
                            ${msg.isSent ? "text-primary-content/70" : "text-base-content/60"}
                          `}
                        >
                          12:00 PM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-base-300 flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered h-9 text-sm flex-1"
                    value="This is a preview"
                    readOnly
                  />
                  <button className="btn btn-primary h-9 min-h-0">
                    <Send size={16} />
                  </button>
                </div>

              </div>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
};

export default SettingsPage;
