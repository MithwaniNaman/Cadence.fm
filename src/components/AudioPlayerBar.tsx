"use client";

import { useAudioPlayer } from "@/lib/audio-player-context";
import { Play, Pause, Square, Music, Volume2 } from "lucide-react";
import Image from "next/image";

export function AudioPlayerBar() {
  const { currentTrack, isPlaying, currentBeat, togglePlayPause, stopPlayback } = useAudioPlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#12141c]/95 border-t border-[#262a3b] backdrop-blur-lg px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a1d28] border border-[#262a3b] flex-shrink-0">
            {currentTrack.artwork ? (
              <Image
                src={currentTrack.artwork}
                alt={currentTrack.name}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#949eb5]">
                <Music className="w-5 h-5" />
              </div>
            )}
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="flex items-end gap-[2px] h-3">
                  <span className="w-1 bg-[#10e57a] rounded-full h-2 animate-beat-1" />
                  <span className="w-1 bg-[#10e57a] rounded-full h-3 animate-beat-2" />
                  <span className="w-1 bg-[#10e57a] rounded-full h-1.5 animate-beat-3" />
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h4 className="text-white font-semibold text-sm truncate">{currentTrack.name}</h4>
            <p className="text-xs text-[#949eb5] truncate">
              {currentTrack.artist} · <span className="text-[#10e57a] font-mono font-medium">{currentTrack.bpm} BPM</span>
            </p>
          </div>
        </div>

        {/* Metronome Beat Indicator & Synth Notice */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1d28] border border-[#262a3b] text-xs font-mono">
            <span className="text-[#949eb5]">Metronome Beat:</span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((b) => (
                <span
                  key={b}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${
                    isPlaying && currentBeat === b
                      ? "bg-[#10e57a] scale-125 shadow-[0_0_8px_#10e57a]"
                      : "bg-[#262a3b]"
                  }`}
                />
              ))}
            </div>
          </div>
          <span className="text-[11px] text-[#6b7794] hidden lg:inline">
            Web Audio Synthesizer @ {currentTrack.bpm} BPM
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-[#10e57a] hover:bg-[#0cd06d] text-black flex items-center justify-center transition-all shadow-[0_0_15px_rgba(16,229,122,0.3)]"
            title={isPlaying ? "Pause Beat Preview" : "Play Beat Preview"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-black" />
            ) : (
              <Play className="w-4 h-4 fill-black ml-0.5" />
            )}
          </button>
          <button
            onClick={stopPlayback}
            className="p-2 rounded-lg text-[#949eb5] hover:text-white hover:bg-[#1a1d28] transition-colors"
            title="Stop & Close Preview"
          >
            <Square className="w-4 h-4" />
          </button>
          <div className="hidden sm:flex items-center gap-1 text-[#6b7794] text-xs pl-2 border-l border-[#262a3b]">
            <Volume2 className="w-4 h-4 text-[#949eb5]" />
          </div>
        </div>
      </div>
    </div>
  );
}
