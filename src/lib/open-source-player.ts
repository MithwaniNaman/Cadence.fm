/**
 * Rock-Solid Dual Audio Player Engine
 * Combines zero-latency high-fidelity procedural synth music (0ms buffering, never fails)
 * with open-source remote audio streaming and seamless fallback bridging.
 */

import { Track } from "./music-catalogue";
import { audioSynth } from "./audio-synthesizer";

class OpenSourceAudioPlayer {
  private audioElement: HTMLAudioElement | null = null;
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.8;
  private onStateChange: (() => void) | null = null;
  private onTimeUpdate: ((currentSec: number, totalSec: number) => void) | null = null;
  private isStreamingActive: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (typeof window === "undefined") return;
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.preload = "none";
      this.audioElement.volume = this.volume;

      this.audioElement.addEventListener("play", () => {
        this.isPlaying = true;
        this.isStreamingActive = true;
        this.notifyState();
      });

      this.audioElement.addEventListener("pause", () => {
        this.notifyState();
      });

      this.audioElement.addEventListener("timeupdate", () => {
        if (this.audioElement && this.onTimeUpdate) {
          this.onTimeUpdate(this.audioElement.currentTime, this.audioElement.duration || 0);
        }
      });

      this.audioElement.addEventListener("ended", () => {
        this.isPlaying = false;
        audioSynth.stop();
        this.notifyState();
      });

      this.audioElement.addEventListener("error", () => {
        // Fall back seamlessly to high-fidelity procedural synth engine
        this.isStreamingActive = false;
        if (this.currentTrack && this.isPlaying) {
          audioSynth.start(this.currentTrack.bpm);
        }
        this.notifyState();
      });
    }
  }

  public setCallbacks(
    onState: () => void,
    onTime?: (currentSec: number, totalSec: number) => void
  ) {
    this.onStateChange = onState;
    if (onTime) this.onTimeUpdate = onTime;
  }

  public playTrack(track: Track) {
    this.initAudioElement();
    this.currentTrack = track;
    this.isPlaying = true;

    // 1. Immediately start procedural synth music (0ms latency, zero buffering hesitation)
    audioSynth.start(track.bpm);

    // 2. Concurrently attempt streaming remote track with safety guards
    if (this.audioElement && track.audioUrl) {
      try {
        this.audioElement.pause();
        this.audioElement.src = track.audioUrl;
        this.audioElement.load();
        
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              this.isStreamingActive = true;
              this.notifyState();
            })
            .catch((err) => {
              // Browser autoplay policy or remote load abort
              this.isStreamingActive = false;
              // Synth is already running smoothly!
              this.notifyState();
            });
        }
      } catch (err) {
        this.isStreamingActive = false;
      }
    }

    this.notifyState();
  }

  public setBpm(newBpm: number) {
    if (this.isPlaying) {
      audioSynth.setBpm(newBpm);
    }
  }

  public togglePlayPause() {
    this.initAudioElement();
    if (!this.currentTrack) return;

    if (this.isPlaying) {
      this.pause();
    } else {
      this.playTrack(this.currentTrack);
    }
  }

  public pause() {
    this.isPlaying = false;
    audioSynth.stop();
    if (this.audioElement) {
      try {
        this.audioElement.pause();
      } catch {
        // ignore
      }
    }
    this.notifyState();
  }

  public stop() {
    this.pause();
    if (this.audioElement) {
      try {
        this.audioElement.currentTime = 0;
      } catch {
        // ignore
      }
    }
    this.currentTrack = null;
    this.notifyState();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.volume;
    }
  }

  public getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsStreaming(): boolean {
    return this.isStreamingActive;
  }

  public getIsUsingFallback(): boolean {
    return !this.isStreamingActive;
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}

export const realAudioPlayer = new OpenSourceAudioPlayer();
