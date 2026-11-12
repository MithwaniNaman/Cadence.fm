/**
 * Web Audio Rhythm Synthesizer for Cadence.fm
 * Synthesizes an authentic metronomic athletic beat in real-time matching the exact track BPM.
 * Allows instant auditory validation of cadence-tempo lock directly in the browser!
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private currentBpm: number = 170;
  private nextNoteTime: number = 0;
  private timerId: number | null = null;
  private beatCount: number = 0;
  private gainNode: GainNode | null = null;
  private onBeatCallback: ((beat: number) => void) | null = null;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setOnBeat(cb: ((beat: number) => void) | null) {
    this.onBeatCallback = cb;
  }

  public start(bpm: number) {
    if (typeof window === "undefined") return;
    this.initContext();
    if (!this.ctx) return;

    this.currentBpm = Math.max(60, Math.min(220, bpm));
    this.isRunning = true;
    this.beatCount = 0;
    this.nextNoteTime = this.ctx.currentTime + 0.05;

    this.scheduler();
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  public setBpm(newBpm: number) {
    this.currentBpm = Math.max(60, Math.min(220, newBpm));
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getCurrentBpm(): number {
    return this.currentBpm;
  }

  private scheduler = () => {
    if (!this.isRunning || !this.ctx) return;

    // Schedule audio notes ahead by 0.1s lookahead
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.scheduleBeat(this.beatCount, this.nextNoteTime);
      this.advanceNote();
    }

    this.timerId = window.setTimeout(this.scheduler, 25);
  };

  private advanceNote() {
    // Seconds per beat (quarter note)
    const secondsPerBeat = 60.0 / this.currentBpm;
    this.nextNoteTime += secondsPerBeat;
    this.beatCount = (this.beatCount + 1) % 4;
  }

  private scheduleBeat(beat: number, time: number) {
    if (!this.ctx || !this.gainNode) return;

    const ctx = this.ctx;

    // Trigger visual callback slightly ahead
    if (this.onBeatCallback) {
      const delayMs = Math.max(0, (time - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (this.isRunning && this.onBeatCallback) {
          this.onBeatCallback(beat);
        }
      }, delayMs);
    }

    // 1. Kick Drum on beats 0 and 2 (or all 4 for electronic drive)
    if (beat === 0 || beat === 2) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(150, time);
      osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

      gain.gain.setValueAtTime(0.8, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.gainNode);

      osc.start(time);
      osc.stop(time + 0.16);
    }

    // 2. Snare / Clack on beats 1 and 3
    if (beat === 1 || beat === 3) {
      // Noise burst for snare
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.setValueAtTime(1200, time);

      const snareGain = ctx.createGain();
      snareGain.gain.setValueAtTime(0.3, time);
      snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      noise.connect(filter);
      filter.connect(snareGain);
      snareGain.connect(this.gainNode);

      noise.start(time);
      noise.stop(time + 0.09);
    }

    // 3. Crisp Hi-Hat tick on every beat
    const hatOsc = ctx.createOscillator();
    const hatGain = ctx.createGain();
    hatOsc.type = "triangle";
    hatOsc.frequency.setValueAtTime(9000, time);

    hatGain.gain.setValueAtTime(0.12, time);
    hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    hatOsc.connect(hatGain);
    hatGain.connect(this.gainNode);

    hatOsc.start(time);
    hatOsc.stop(time + 0.035);
  }
}

export const audioSynth = new AudioSynthesizer();
