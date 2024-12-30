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
    <div className="h-screen container mx-auto px-2 pt-16 flex flex-col justify-center items-center">
      <div className="space-y-4 w-full max-w-4xl">
        {/* Theme Selector */}
        <div>
          <h2 className="text-base font-semibold mb-1">Theme</h2>
          <p className="text-xs text-base-content/70 mb-2">
            Choose a theme for your chat interface
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`group flex flex-col items-center p-1 rounded transition-colors text-xs
                ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}`}
                onClick={() => {
                  setTheme(t); // Update the theme in the store
                  document.documentElement.setAttribute("data-theme", t); // Apply theme to root
                }}
              >
                <div className="relative h-6 w-full rounded-md overflow-hidden" data-theme={t}>
                  {/* Color boxes to preview theme */}
                  <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary"></div>
                    <div className="rounded bg-secondary"></div>
                    <div className="rounded bg-accent"></div>
                    <div className="rounded bg-neutral"></div>
                  </div>
                </div>
                <span className="truncate w-full text-center">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview Section */}
        <div>
          <h3 className="text-base font-semibold mb-2">Preview</h3>
          <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-sm">
            <div className="p-3 bg-base-200">
              {/* Chat UI */}
              <div className="bg-base-100 rounded-xl shadow-sm">
                {/* Chat Header */}
                <div className="px-3 py-2 border-b border-base-300 bg-base-100 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-content text-xs font-medium">
                    J
                  </div>
                  <div>
                    <h3 className="font-medium text-xs">John Doe</h3>
                    <p className="text-[10px] text-base-content/70">Online</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="p-3 space-y-2 min-h-[120px] max-h-[120px] overflow-y-auto bg-base-100">
                  {PREVIEW_MESSAGES.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-xl p-2 text-xs
                          ${message.isSent ? "bg-primary text-primary-content" : "bg-base-200"}
                        `}
                      >
                        <p>{message.content}</p>
                        <p
                          className={`mt-1 text-[9px]
                            ${message.isSent ? "text-primary-content/70" : "text-base-content/70"}
                          `}
                        >
                          12:00 PM
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="p-3 border-t border-base-300 bg-base-100 flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1 text-xs h-8"
                    placeholder="Type a message..."
                    value="This is a preview"
                    readOnly
                  />
                  <button className="btn btn-primary h-8 min-h-0">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
