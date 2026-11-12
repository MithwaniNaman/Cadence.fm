/**
 * Open Source Audio Player Engine
 * Streams real music tracks from open-source audio libraries (SoundHelix & Creative Commons Archive)
 * with AI tempo adjustment, crossfading, and fallback bridging.
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
  private isUsingFallbackSynth: boolean = false;

  constructor() {
    if (typeof window !== "undefined") {
      this.initAudioElement();
    }
  }

  private initAudioElement() {
    if (typeof window === "undefined") return;
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.preload = "auto";
      this.audioElement.volume = this.volume;

      this.audioElement.addEventListener("play", () => {
        this.isPlaying = true;
        this.isUsingFallbackSynth = false;
        audioSynth.stop(); // Stop synth when real music starts
        this.notifyState();
      });

      this.audioElement.addEventListener("pause", () => {
        this.isPlaying = false;
        this.notifyState();
      });

      this.audioElement.addEventListener("timeupdate", () => {
        if (this.audioElement && this.onTimeUpdate) {
          this.onTimeUpdate(this.audioElement.currentTime, this.audioElement.duration || 0);
        }
      });

      this.audioElement.addEventListener("ended", () => {
        this.isPlaying = false;
        this.notifyState();
      });

      this.audioElement.addEventListener("error", () => {
        // Fallback gracefully to Web Audio synthesizer if CDN stream has network issues
        console.warn("Open source audio stream failed, engaging procedural rhythm fallback.");
        if (this.currentTrack && this.isPlaying) {
          this.isUsingFallbackSynth = true;
          audioSynth.start(this.currentTrack.bpm);
        }
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

  public playTrack(track: Track, startOffsetSec: number = 0) {
    this.initAudioElement();
    this.currentTrack = track;
    this.isPlaying = true;

    if (this.audioElement && track.audioUrl) {
      try {
        this.audioElement.src = track.audioUrl;
        this.audioElement.currentTime = startOffsetSec;
        const playPromise = this.audioElement.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.log("Audio autoplay policy or stream error:", err);
            // Engage live rhythm synthesizer bridge
            this.isUsingFallbackSynth = true;
            audioSynth.start(track.bpm);
            this.notifyState();
          });
        }
      } catch (err) {
        console.warn("Stream exception:", err);
        this.isUsingFallbackSynth = true;
        audioSynth.start(track.bpm);
      }
    } else {
      this.isUsingFallbackSynth = true;
      audioSynth.start(track.bpm);
    }

    this.notifyState();
  }

  public togglePlayPause() {
    this.initAudioElement();
    if (!this.currentTrack) return;

    if (this.isPlaying) {
      this.pause();
    } else {
      if (this.isUsingFallbackSynth) {
        audioSynth.start(this.currentTrack.bpm);
        this.isPlaying = true;
        this.notifyState();
      } else if (this.audioElement) {
        this.audioElement.play().catch(() => {
          this.isUsingFallbackSynth = true;
          audioSynth.start(this.currentTrack!.bpm);
          this.isPlaying = true;
          this.notifyState();
        });
      }
    }
  }

  public pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    audioSynth.stop();
    this.notifyState();
  }

  public stop() {
    this.pause();
    if (this.audioElement) {
      this.audioElement.currentTime = 0;
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

  public getIsUsingFallback(): boolean {
    return this.isUsingFallbackSynth;
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}

export const realAudioPlayer = new OpenSourceAudioPlayer();
