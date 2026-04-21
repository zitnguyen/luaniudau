let audioContext = null;
let audioUnlocked = false;
let lastPlayedAt = 0;

const getAudioContext = () => {
  if (audioContext) return audioContext;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioContext = new Ctx();
  return audioContext;
};

const unlockAudio = async () => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      await ctx.resume();
    }
    audioUnlocked = ctx.state === "running";
  } catch {
    audioUnlocked = false;
  }
};

export const initNotificationSound = () => {
  const onUserGesture = () => {
    unlockAudio();
    window.removeEventListener("click", onUserGesture);
    window.removeEventListener("keydown", onUserGesture);
    window.removeEventListener("touchstart", onUserGesture);
  };
  window.addEventListener("click", onUserGesture, { passive: true });
  window.addEventListener("keydown", onUserGesture, { passive: true });
  window.addEventListener("touchstart", onUserGesture, { passive: true });
};

const playBeep = async () => {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const now = ctx.currentTime;
  const createTone = (startAt, freqFrom, freqTo, durationSec) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freqFrom, startAt);
    osc.frequency.linearRampToValueAtTime(freqTo, startAt + 0.06);

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.22, startAt + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + durationSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startAt);
    osc.stop(startAt + durationSec);
  };

  // Two louder short tones for clearer notification.
  createTone(now, 920, 1080, 0.22);
  createTone(now + 0.24, 980, 1180, 0.24);
};

export const playNotificationSound = () => {
  const now = Date.now();
  // Anti-spam: one sound at most every 4 seconds.
  if (now - lastPlayedAt < 4000) return;
  lastPlayedAt = now;

  const run = async () => {
    if (!audioUnlocked) {
      await unlockAudio();
    }
    if (!audioUnlocked) return;
    await playBeep();
  };
  run().catch(() => {
    // Silent fail by design.
  });
};

export const debugPlayNotificationSound = async () => {
  await unlockAudio();
  if (!audioUnlocked) return false;
  await playBeep();
  return true;
};
