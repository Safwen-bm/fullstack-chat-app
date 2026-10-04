import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Bell,
  CornerDownLeft,
  Loader2,
  Lock,
  Palette,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Volume2,
} from "lucide-react";

import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { usePreferencesStore } from "../store/usePreferencesStore";
import { requestDesktopPermission } from "../lib/notify";
import { validatePassword } from "../lib/validation";
import AuthField from "../components/auth/AuthField";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const Section = ({ icon: Icon, title, description, danger = false, children }) => (
  <section
    className={`rounded-3xl border p-6 shadow-sm sm:p-8 ${
      danger ? "border-error/40 bg-error/5" : "border-base-300 bg-base-100"
    }`}
  >
    <div className="mb-5 flex items-start gap-3">
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-xl ${
          danger ? "bg-error/15 text-error" : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <h2 className="text-lg font-bold">{title}</h2>
        {description && <p className="text-sm text-base-content/60">{description}</p>}
      </div>
    </div>
    {children}
  </section>
);

const ToggleRow = ({ icon: Icon, title, description, checked, onChange }) => (
  <label className="flex cursor-pointer items-center gap-4 rounded-2xl border border-base-300 bg-base-200/60 p-4">
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
      <Icon className="size-5" />
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-semibold">{title}</span>
      <span className="block text-sm text-base-content/60">{description}</span>
    </span>
    <input
      type="checkbox"
      className="toggle toggle-primary"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);

const PasswordForm = () => {
  const changePassword = useAuthStore((s) => s.changePassword);
  const isChangingPassword = useAuthStore((s) => s.isChangingPassword);

  const empty = { currentPassword: "", newPassword: "", confirm: "" };
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isChangingPassword) return;

    const next = {
      currentPassword: validatePassword(form.currentPassword),
      newPassword:
        validatePassword(form.newPassword, 6) ||
        (form.newPassword.length > 72 ? "Password is too long (72 characters max)." : ""),
      confirm: form.confirm !== form.newPassword ? "Passwords do not match." : "",
    };
    setErrors(next);

    const firstInvalid = Object.keys(next).find((key) => next[key]);
    if (firstInvalid) {
      e.currentTarget.elements[firstInvalid]?.focus();
      return;
    }

    const ok = await changePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
    if (ok) setForm(empty);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-md space-y-4">
      <AuthField
        label="Current password"
        icon={Lock}
        type="password"
        name="currentPassword"
        autoComplete="current-password"
        value={form.currentPassword}
        onChange={handleChange}
        error={errors.currentPassword}
      />
      <AuthField
        label="New password"
        icon={Lock}
        type="password"
        name="newPassword"
        autoComplete="new-password"
        placeholder="At least 6 characters"
        value={form.newPassword}
        onChange={handleChange}
        error={errors.newPassword}
      />
      <AuthField
        label="Confirm new password"
        icon={Lock}
        type="password"
        name="confirm"
        autoComplete="new-password"
        value={form.confirm}
        onChange={handleChange}
        error={errors.confirm}
      />

      <button type="submit" disabled={isChangingPassword} className="btn btn-primary rounded-xl">
        {isChangingPassword && <Loader2 className="size-4 animate-spin" />}
        Update password
      </button>
    </form>
  );
};

const DeleteAccount = () => {
  const navigate = useNavigate();
  const deleteAccount = useAuthStore((s) => s.deleteAccount);
  const isDeletingAccount = useAuthStore((s) => s.isDeletingAccount);

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleDelete = async (e) => {
    e.preventDefault();
    if (isDeletingAccount) return;
    if (!password) {
      setError("Enter your password to confirm.");
      return;
    }
    const ok = await deleteAccount(password);
    if (ok) navigate("/");
  };

  if (!open) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="max-w-md text-sm text-base-content/70">
          Permanently delete your account and every message you sent or received. This
          cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-outline btn-error rounded-xl"
        >
          <Trash2 className="size-4" />
          Delete my account
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleDelete} noValidate className="max-w-md space-y-4">
      <p className="text-sm font-medium text-error">
        This will permanently erase your account, your photo and all your conversations.
      </p>
      <AuthField
        label="Confirm with your password"
        icon={Lock}
        type="password"
        name="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (error) setError("");
        }}
        error={error}
      />
      <div className="flex gap-2">
        <button type="submit" disabled={isDeletingAccount} className="btn btn-error rounded-xl">
          {isDeletingAccount && <Loader2 className="size-4 animate-spin" />}
          Delete forever
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setPassword("");
            setError("");
          }}
          className="btn btn-ghost rounded-xl"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const authUser = useAuthStore((s) => s.authUser);

  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const desktopNotifications = usePreferencesStore((s) => s.desktopNotifications);
  const enterToSend = usePreferencesStore((s) => s.enterToSend);
  const setPreference = usePreferencesStore((s) => s.setPreference);

  const handleDesktopToggle = async (on) => {
    if (!on) {
      setPreference("desktopNotifications", false);
      return;
    }
    const result = await requestDesktopPermission();
    if (result === "granted") {
      setPreference("desktopNotifications", true);
    } else {
      toast.error(
        result === "unsupported"
          ? "This browser does not support desktop notifications."
          : "Notifications are blocked. Allow them in your browser's site settings."
      );
    }
  };

  return (
    <div className="min-h-screen bg-base-200 px-4 pb-16 pt-24">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="mb-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-base-content/60">
            Make OnlyChat work the way you like.
          </p>
        </div>

        {/* APPEARANCE */}
        <Section
          icon={Palette}
          title="Appearance"
          description="Pick a theme. You can also change it anytime from the navbar."
        >
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {THEMES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTheme(t);
                  document.documentElement.setAttribute("data-theme", t);
                }}
                className={`flex flex-col items-center rounded-xl border p-2 text-xs transition-all ${
                  theme === t
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-base-300 hover:bg-base-200/60"
                }`}
              >
                <div className="h-7 w-full overflow-hidden rounded-md shadow-inner" data-theme={t}>
                  <div className="grid h-full grid-cols-4 gap-px p-1">
                    <div className="rounded bg-primary" />
                    <div className="rounded bg-secondary" />
                    <div className="rounded bg-accent" />
                    <div className="rounded bg-neutral" />
                  </div>
                </div>
                <span className="mt-1 w-full truncate text-center font-medium capitalize">{t}</span>
              </button>
            ))}
          </div>

          {/* preview */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-base-300 bg-base-200 p-4">
            <div className="overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm">
              <div className="flex items-center gap-2 border-b border-base-300 px-3 py-2">
                <div className="grid size-7 place-items-center rounded-full bg-primary text-xs text-primary-content">
                  J
                </div>
                <div>
                  <h4 className="text-sm font-medium">John Doe</h4>
                  <p className="text-xs text-base-content/70">Online</p>
                </div>
              </div>

              <div className="space-y-2 p-3">
                {PREVIEW_MESSAGES.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl p-2 text-xs shadow-sm ${
                        msg.isSent ? "bg-primary text-primary-content" : "bg-base-200"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          msg.isSent ? "text-primary-content/70" : "text-base-content/60"
                        }`}
                      >
                        12:00
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 border-t border-base-300 p-3">
                <input
                  type="text"
                  className="input input-bordered h-9 flex-1 text-sm"
                  value="This is a preview"
                  readOnly
                />
                <button type="button" className="btn btn-primary h-9 min-h-0">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* NOTIFICATIONS */}
        <Section
          icon={Bell}
          title="Notifications"
          description="How OnlyChat gets your attention when a message arrives."
        >
          <div className="space-y-3">
            <ToggleRow
              icon={Volume2}
              title="Message sound"
              description="Play a short chime when a message arrives in a chat you are not looking at."
              checked={soundEnabled}
              onChange={(v) => setPreference("soundEnabled", v)}
            />
            <ToggleRow
              icon={Bell}
              title="Desktop notifications"
              description="Show a notification when OnlyChat is in the background. Your browser will ask for permission."
              checked={desktopNotifications}
              onChange={handleDesktopToggle}
            />
          </div>
        </Section>

        {/* CHAT */}
        <Section icon={CornerDownLeft} title="Chat" description="How the message box behaves.">
          <ToggleRow
            icon={CornerDownLeft}
            title="Press Enter to send"
            description="Turn this off to use Enter for a new line and Ctrl+Enter (Cmd+Enter on Mac) to send."
            checked={enterToSend}
            onChange={(v) => setPreference("enterToSend", v)}
          />
        </Section>

        {authUser && (
          <>
            <Section
              icon={ShieldCheck}
              title="Security"
              description="Change the password you use to sign in."
            >
              <PasswordForm />
            </Section>

            <Section
              icon={ShieldAlert}
              title="Danger zone"
              description="Actions here are permanent."
              danger
            >
              <DeleteAccount />
            </Section>
          </>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;