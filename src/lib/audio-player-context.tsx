"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Track } from "./music-catalogue";
import { audioSynth } from "./audio-synthesizer";

interface AudioPlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentBeat: number;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  stopPlayback: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export function AudioPlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);

  useEffect(() => {
    audioSynth.setOnBeat((beat) => {
      setCurrentBeat(beat);
    });

    return () => {
      audioSynth.setOnBeat(null);
      audioSynth.stop();
    };
  }, []);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    audioSynth.start(track.bpm);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioSynth.stop();
      setIsPlaying(false);
    } else {
      audioSynth.start(currentTrack.bpm);
      setIsPlaying(true);
    }
  }, [currentTrack, isPlaying]);

  const stopPlayback = useCallback(() => {
    audioSynth.stop();
    setIsPlaying(false);
    setCurrentTrack(null);
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
