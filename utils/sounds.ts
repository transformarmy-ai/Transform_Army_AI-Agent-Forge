// Futuristic sound effects using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize AudioContext on first user interaction
    if (typeof window !== 'undefined') {
      this.audioContext = null; // Lazy initialization
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate a futuristic beep sound
  private playBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      // Silently fail if audio context is not available
      console.debug('Audio context not available');
    }
  }

  // Hover sound - high pitch beep
  playHover(): void {
    this.playBeep(800, 0.1, 'sine');
  }

  // Click sound - medium pitch beep
  playClick(): void {
    this.playBeep(600, 0.15, 'square');
  }

  // Action sound - dual tone
  playAction(): void {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator1 = ctx.createOscillator();
      const oscillator2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator1.frequency.value = 400;
      oscillator2.frequency.value = 600;
      oscillator1.type = 'sine';
      oscillator2.type = 'sine';

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      oscillator1.start(ctx.currentTime);
      oscillator2.start(ctx.currentTime);
      oscillator1.stop(ctx.currentTime + 0.2);
      oscillator2.stop(ctx.currentTime + 0.2);
    } catch (error) {
      console.debug('Audio context not available');
    }
  }

  // Success sound - ascending tone
  playSuccess(): void {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(400, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.debug('Audio context not available');
    }
  }

  // Error sound - low descending tone
  playError(): void {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.setValueAtTime(300, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.4);
      oscillator.type = 'sawtooth';

      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.4);
    } catch (error) {
      console.debug('Audio context not available');
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export const soundManager = new SoundManager();

