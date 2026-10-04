import { create } from "zustand";

const STORAGE_KEY = "onlychat-preferences";

const defaults = {
  soundEnabled: true,
  desktopNotifications: false,
  enterToSend: true,
};

const load = () => {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return defaults;
  }
};

export const usePreferencesStore = create((set, get) => ({
  ...load(),

  setPreference: (key, value) => {
    set({ [key]: value });
    const { soundEnabled, desktopNotifications, enterToSend } = get();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ soundEnabled, desktopNotifications, enterToSend })
      );
    } catch {
      // storage can be blocked, the setting just will not persist
    }
  },
}));