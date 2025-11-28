/**
 * Try to unlock/create an AudioContext on the first user gesture.
 * Many mobile browsers require a user gesture to start audio. Call this
 * on app mount and it will attach a one-time listener to resume AudioContext.
 */
export function unlockAudioOnUserGesture(): void {
  try {
    const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      const resume = async () => {
        try {
          await ctx.resume();
        } catch (e) {}
        window.removeEventListener('touchend', resume);
        window.removeEventListener('click', resume);
      };
      window.addEventListener('touchend', resume, { passive: true });
      window.addEventListener('click', resume);
    }
  } catch (e) {}
}

/**
 * Try to synchronously create/resume a shared AudioContext so mobile
 * touch/pointer handlers that run synchronously can play audio immediately.
 */
export function ensureAudioUnlockedNow(): void {
  try {
    const w = window as any;
    const AudioCtx = w.AudioContext || w.webkitAudioContext;
    if (!AudioCtx) return;
    if (!w.__APP_AUDIO_CONTEXT) {
      try {
        w.__APP_AUDIO_CONTEXT = new AudioCtx();
      } catch (e) {
        return;
      }
    }
    const ctx: AudioContext = w.__APP_AUDIO_CONTEXT;
    if (ctx && ctx.state === 'suspended') {
      // Attempt to resume synchronously; browsers may still treat this as user gesture
      ctx.resume().catch(() => {});
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Try to prime the Web Speech API (SpeechSynthesis) by issuing a very short
 * utterance during a user gesture and then cancelling it. Some mobile
 * browsers only allow speech synthesis to start when it is initiated directly
 * from a user gesture; this helper attempts to trigger that permission.
 */
export function primeSpeechSynthesisNow(): void {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return;
    // Create a very short utterance. Use a low-volume marker and cancel quickly.
    const u = new SpeechSynthesisUtterance('\u200B'); // zero-width space
    // Some platforms ignore volume=0; keep it to minimal settings
    try { u.volume = 0; } catch (e) {}
    synth.speak(u);
    // Cancel shortly after to avoid audible output
    setTimeout(() => {
      try { synth.cancel(); } catch (e) {}
    }, 50);
  } catch (e) {
    // ignore
  }
}

/**
 * Play a very short silent buffer through the shared AudioContext to ensure
 * the WebAudio output is unlocked. This approach is effective on many mobile
 * browsers where creating/resuming an AudioContext alone is not sufficient.
 */
export function playSilentAudioNow(): void {
  try {
    const w = window as any;
    const AudioCtx = w.AudioContext || w.webkitAudioContext;
    if (!AudioCtx) return;

    if (!w.__APP_AUDIO_CONTEXT) {
      try {
        w.__APP_AUDIO_CONTEXT = new AudioCtx();
      } catch (e) {
        return;
      }
    }

    const ctx: AudioContext = w.__APP_AUDIO_CONTEXT;
    // Try to resume if suspended
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.01, ctx.sampleRate); // 10ms silent
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(ctx.destination);
      // Start and stop quickly
      src.start(0);
      setTimeout(() => {
        try { src.stop(); } catch (e) {}
      }, 20);
    } catch (e) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
}

// Debug/logging helpers removed (no in-app audio debug collection).
/**
 * Decodes a base64 string into a Uint8Array.
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data (Int16) into an AudioBuffer.
 * This is required because Gemini TTS returns raw PCM without headers.
 */
export function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): AudioBuffer {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
