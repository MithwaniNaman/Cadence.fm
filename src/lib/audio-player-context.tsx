"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Track } from "./music-catalogue";
import { realAudioPlayer } from "./open-source-player";
import { audioSynth } from "./audio-synthesizer";

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentBeat: number;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  stopPlayback: () => void;
  currentTime: number;
  duration: number;
  isUsingFallback: boolean;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);

  useEffect(() => {
    // Listen to real audio player state changes
    realAudioPlayer.setCallbacks(
      () => {
        setIsPlaying(realAudioPlayer.getIsPlaying());
        setCurrentTrack(realAudioPlayer.getCurrentTrack());
        setIsUsingFallback(realAudioPlayer.getIsUsingFallback());
      },
      (curr, dur) => {
        setCurrentTime(curr);
        setDuration(dur);
      }
    );

    // Also connect beat callback for pulse animations
    audioSynth.setOnBeat((beat) => {
      setCurrentBeat(beat);
    });

    return () => {
      realAudioPlayer.stop();
      audioSynth.setOnBeat(null);
    };
  }, []);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    realAudioPlayer.playTrack(track);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    realAudioPlayer.togglePlayPause();
  }, []);

  const stopPlayback = useCallback(() => {
    realAudioPlayer.stop();
    setCurrentTrack(null);
    setIsPlaying(false);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentBeat,
        playTrack,
        togglePlayPause,
        stopPlayback,
        currentTime,
        duration,
        isUsingFallback,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  }
  return context;
}
