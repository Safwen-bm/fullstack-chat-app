let audioContext = null;

// a short two-note chime made with the browser, no sound file needed
export function playNotificationSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    audioContext = audioContext || new AudioCtx();
    if (audioContext.state === "suspended") audioContext.resume();

    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    [660, 880].forEach((frequency, i) => {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + i * 0.12);
      oscillator.connect(gain);
      oscillator.start(now + i * 0.12);
      oscillator.stop(now + i * 0.12 + 0.2);
    });
  } catch {
    // sound is optional
  }
}

const supportsNotifications = () => typeof Notification !== "undefined";

// returns "granted", "denied" or "unsupported"
export async function requestDesktopPermission() {
  if (!supportsNotifications()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export function showDesktopNotification({ title, body, tag, onClick }) {
  if (!supportsNotifications() || Notification.permission !== "granted") return;
  try {
    const notification = new Notification(title, { body, tag, icon: "/avatar.png" });
    notification.onclick = () => {
      window.focus();
      onClick?.();
      notification.close();
    };
  } catch {
    // some browsers only allow notifications from a service worker
  }
}