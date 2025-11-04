// Futuristic sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled = true;
  private hasUserInteracted = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = async () => {
        this.hasUserInteracted = true;
        try {
          const ctx = this.getOrCreateContext();
          if (ctx.state === 'suspended') {
            await ctx.resume();
          }
        } catch (error) {
          console.debug('Audio context resume blocked', error);
        }
      };

      const unlockEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown', 'touchstart'];
      unlockEvents.forEach(event => {
        window.addEventListener(event, unlockAudio, { once: true, passive: true });
      });
    }
  }

  private getOrCreateContext(): AudioContext {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioCtx = (window.AudioContext || (window as any).webkitAudioContext);
      this.audioContext = new AudioCtx();
    }
    return this.audioContext as AudioContext;
  }

  private async withContext(play: (ctx: AudioContext) => void): Promise<void> {
    if (!this.enabled) return;
    try {
      const ctx = this.getOrCreateContext();
      if (!ctx) return;

      // Defer playback until after a user interaction unlocks audio
      if (!this.hasUserInteracted) {
        return;
      }

      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (error) {
          console.debug('Audio context resume failed', error);
          return;
        }
      }

      play(ctx);
    } catch (error) {
      console.debug('Audio playback failed', error);
    }
  }

  private async playBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): Promise<void> {
    await this.withContext((ctx) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      const start = ctx.currentTime;
      gainNode.gain.setValueAtTime(0.12, start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, start + duration);

      oscillator.start(start);
      oscillator.stop(start + duration);
    });
  }

  async playHover(): Promise<void> {
    await this.playBeep(800, 0.1, 'sine');
  }

  async playClick(): Promise<void> {
    await this.playBeep(600, 0.15, 'square');
  }

  async playAction(): Promise<void> {
    await this.withContext((ctx) => {
      const oscillator1 = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator1.frequency.value = 420;
      oscillator2.frequency.value = 660;
      oscillator1.type = 'sine';
      oscillator2.type = 'triangle';

      const start = ctx.currentTime;
      gainNode.gain.setValueAtTime(0.15, start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, start + 0.22);

      oscillator1.start(start);
      oscillator2.start(start + 0.02);
      oscillator1.stop(start + 0.22);
      oscillator2.stop(start + 0.22);
    });
  }

  async playSuccess(): Promise<void> {
    await this.withContext((ctx) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const start = ctx.currentTime;
      oscillator.frequency.setValueAtTime(360, start);
      oscillator.frequency.exponentialRampToValueAtTime(880, start + 0.35);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.18, start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, start + 0.35);

      oscillator.start(start);
      oscillator.stop(start + 0.35);
    });
  }

  async playError(): Promise<void> {
    await this.withContext((ctx) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const start = ctx.currentTime;
      oscillator.frequency.setValueAtTime(320, start);
      oscillator.frequency.exponentialRampToValueAtTime(140, start + 0.45);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0.18, start);
      gainNode.gain.exponentialRampToValueAtTime(0.01, start + 0.45);

      oscillator.start(start);
      oscillator.stop(start + 0.45);
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export const soundManager = new SoundManager();

