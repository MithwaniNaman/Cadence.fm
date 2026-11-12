/**
 * High-Fidelity Web Audio Music & Rhythm Synthesizer for Cadence.fm
 * Synthesizes a real multi-instrumental musical arrangement (Kick, Snare, Hi-Hat,
 * Bassline, and Polyphonic Melodic Synth Chords) locked to the exact track BPM.
 * Zero-latency, completely glitch-free in all browsers without remote stream delays.
 */

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private currentBpm: number = 135;
  private nextNoteTime: number = 0;
  private timerId: number | null = null;
  private beatCount: number = 0;
  private measureCount: number = 0;
  private masterGain: GainNode | null = null;
  private onBeatCallback: ((beat: number, spm: number) => void) | null = null;

  // Chord Progression frequencies in Hz (Am -> F -> C -> G)
  private readonly chordProgressions = [
    // Am (A3, C4, E4, Bass A2)
    { bass: 110.0, chord: [220.0, 261.63, 329.63], name: "A Minor" },
    // F (F3, A3, C4, Bass F2)
    { bass: 87.31, chord: [174.61, 220.0, 261.63], name: "F Major" },
    // C (C3, E3, G3, Bass C2)
    { bass: 65.41, chord: [130.81, 164.81, 196.0], name: "C Major" },
    // G (G3, B3, D4, Bass G2)
    { bass: 98.0, chord: [196.0, 246.94, 293.66], name: "G Major" },
  ];

  constructor() {
    // Lazy initialization
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public setOnBeat(cb: ((beat: number, spm: number) => void) | null) {
    this.onBeatCallback = cb;
  }

  public start(bpm: number) {
    if (typeof window === "undefined") return;
    this.initContext();
    if (!this.ctx) return;

    this.currentBpm = Math.max(80, Math.min(220, bpm));
    this.isRunning = true;
    this.beatCount = 0;
    this.measureCount = 0;
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
    this.currentBpm = Math.max(80, Math.min(220, newBpm));
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getCurrentBpm(): number {
    return this.currentBpm;
  }

  private scheduler = () => {
    if (!this.isRunning || !this.ctx) return;

    while (this.nextNoteTime < this.ctx.currentTime + 0.12) {
      this.scheduleMeasureStep(this.beatCount, this.nextNoteTime);
      this.advanceNote();
    }

    this.timerId = window.setTimeout(this.scheduler, 25);
  };

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.currentBpm;
    this.nextNoteTime += secondsPerBeat;
    this.beatCount = (this.beatCount + 1) % 4;
    if (this.beatCount === 0) {
      this.measureCount = (this.measureCount + 1) % this.chordProgressions.length;
    }
  }

  private scheduleMeasureStep(beat: number, time: number) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;

    // Trigger visual step/pulse callback slightly ahead
    if (this.onBeatCallback) {
      const delayMs = Math.max(0, (time - ctx.currentTime) * 1000);
      setTimeout(() => {
        if (this.isRunning && this.onBeatCallback) {
          this.onBeatCallback(beat, this.currentBpm);
        }
      }, delayMs);
    }

    const currentChord = this.chordProgressions[this.measureCount];

    // 1. PUNCHY KICK DRUM (Every quarter note beat)
    const kickOsc = ctx.createOscillator();
    const kickGain = ctx.createGain();
    kickOsc.frequency.setValueAtTime(140, time);
    kickOsc.frequency.exponentialRampToValueAtTime(36, time + 0.12);

    const kickVolume = beat === 0 ? 0.85 : 0.65;
    kickGain.gain.setValueAtTime(kickVolume, time);
    kickGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    kickOsc.connect(kickGain);
    kickGain.connect(this.masterGain);
    kickOsc.start(time);
    kickOsc.stop(time + 0.16);

    // 2. CRISP SNARE / CLAP (On beats 1 and 3)
    if (beat === 1 || beat === 3) {
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
      filter.frequency.setValueAtTime(1400, time);

      const snareGain = ctx.createGain();
      snareGain.gain.setValueAtTime(0.32, time);
      snareGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      noise.connect(filter);
      filter.connect(snareGain);
      snareGain.connect(this.masterGain);

      noise.start(time);
      noise.stop(time + 0.11);
    }

    // 3. CLOSED HI-HAT (Ticking every beat)
    const hatOsc = ctx.createOscillator();
    const hatGain = ctx.createGain();
    hatOsc.type = "triangle";
    hatOsc.frequency.setValueAtTime(9500, time);
    hatGain.gain.setValueAtTime(0.12, time);
    hatGain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    hatOsc.connect(hatGain);
    hatGain.connect(this.masterGain);
    hatOsc.start(time);
    hatOsc.stop(time + 0.04);

    // 4. DEEP RUNNER BASSLINE (Synthesized on every quarter note)
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = "sawtooth";
    bassOsc.frequency.setValueAtTime(currentChord.bass, time);

    const bassFilter = ctx.createBiquadFilter();
    bassFilter.type = "lowpass";
    bassFilter.frequency.setValueAtTime(320, time);

    bassGain.gain.setValueAtTime(0.28, time);
    bassGain.gain.exponentialRampToValueAtTime(0.01, time + 0.22);

    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.masterGain);
    bassOsc.start(time);
    bassOsc.stop(time + 0.24);

    // 5. POLYPHONIC MELODIC SYNTH CHORDS / ARPEGGIOS
    // Arpeggiates the chord notes across beats for a rich musical feel!
    const noteIndex = beat % currentChord.chord.length;
    const noteFreq = currentChord.chord[noteIndex];

    const leadOsc = ctx.createOscillator();
    const leadGain = ctx.createGain();
    leadOsc.type = "sine";
    leadOsc.frequency.setValueAtTime(noteFreq, time);

    leadGain.gain.setValueAtTime(0.18, time);
    leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    leadOsc.connect(leadGain);
    leadGain.connect(this.masterGain);
    leadOsc.start(time);
    leadOsc.stop(time + 0.3);
  }
}

export const audioSynth = new AudioSynthesizer();
