import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send, Image as ImageIcon, Smile, Paperclip } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20 max-w-5xl pb-10">
      <div className="space-y-10">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent w-max">
            Appearance
          </h2>
          <p className="text-base text-base-content/70">
            Personalize your chat experience with a custom theme.
          </p>
        </div>

        {/* Theme Selector */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-wide">Select Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {THEMES.map((t) => (
              <button
                key={t}
                className={`
                  group relative flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300
                  ${theme === t
                    ? "bg-base-200/80 ring-2 ring-primary shadow-lg scale-[1.02]"
                    : "hover:bg-base-200/50 hover:shadow-md border border-base-200/50"
                  }
                `}
                onClick={() => setTheme(t)}
              >
                {/* Theme Preview Box */}
                <div
                  className="relative h-20 w-full rounded-xl overflow-hidden shadow-sm flex border border-base-300"
                  data-theme={t}
                >
                  <div className="flex-1 bg-base-100 p-2 border-r border-base-300 flex flex-col gap-1 justify-end">
                    <div className="w-10 h-3 rounded-full bg-base-300"></div>
                    <div className="w-14 h-3 rounded-full bg-primary/20 self-end"></div>
                  </div>
                  <div className="w-10 flex flex-col pt-2 gap-1 px-1.5 bg-base-200">
                    <div className="w-full h-3 rounded-full bg-primary"></div>
                    <div className="w-full h-3 rounded-full bg-secondary"></div>
                    <div className="w-full h-3 rounded-full bg-accent"></div>
                  </div>
                </div>

                <span className="text-sm font-semibold tracking-wide w-full text-center">
                  {t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ")}
                </span>

                {/* Active Indicator */}
                {theme === t && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold tracking-wide">Live Preview</h3>
          <div className="rounded-2xl border border-base-300 overflow-hidden bg-base-100 shadow-2xl shadow-base-300/20">
            <div className="p-6 bg-base-200/50">
              <div className="max-w-lg mx-auto">
                {/* Mock Chat UI */}
                <div className="bg-base-100 rounded-2xl shadow-xl overflow-hidden border border-base-300/50">
                  {/* Chat Header */}
                  <div className="px-5 py-4 border-b border-base-300 bg-base-100 flex justify-between items-center backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold shadow-md">
                          S
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Shubham</h3>
                        <p className="text-xs text-base-content/60">typing...</p>
                      </div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="p-5 space-y-5 min-h-[240px] max-h-[240px] overflow-y-auto bg-base-100/50">
                    {PREVIEW_MESSAGES.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`
                            max-w-[80%] rounded-2xl p-3 shadow-md relative
                            ${message.isSent
                              ? "bg-primary text-primary-content rounded-tr-sm"
                              : "bg-base-200 rounded-tl-sm text-base-content"
                            }
                          `}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p
                            className={`
                              text-[10px] mt-1.5 font-medium
                              ${message.isSent ? "text-primary-content/70" : "text-base-content/50"}
                              text-right
                            `}
                          >
                            12:00 PM
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 bg-base-100 border-t border-base-300">
                    <div className="flex items-center gap-2 bg-base-200/50 rounded-full p-1.5 border border-base-300/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                      <button className="p-2 text-base-content/50 hover:text-primary transition-colors">
                        <Smile size={20} />
                      </button>
                      <button className="p-2 text-base-content/50 hover:text-primary transition-colors">
                        <Paperclip size={20} />
                      </button>
                      <input
                        type="text"
                        className="bg-transparent border-none flex-1 text-sm outline-none px-2 placeholder:text-base-content/40"
                        placeholder="Type a message..."
                        value="This is a preview"
                        readOnly
                      />
                      <button className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                        <Send size={18} className="translate-x-[1px]" />
                      </button>
                    </div>
                  </div>
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
