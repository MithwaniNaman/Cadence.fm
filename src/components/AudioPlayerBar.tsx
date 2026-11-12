"use client";

import { useAudioPlayer } from "@/lib/audio-player-context";
import { Play, Pause, Square, Music, Volume2, Sparkles, Radio } from "lucide-react";
import { formatTime } from "@/lib/utils";

export function AudioPlayerBar() {
  const { 
    currentTrack, 
    isPlaying, 
    currentBeat, 
    togglePlayPause, 
    stopPlayback, 
    currentTime, 
    duration,
    isUsingFallback 
  } = useAudioPlayer();

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#12141c]/95 border-t border-[#262a3b] backdrop-blur-lg px-4 py-3 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Track Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#1a1d28] border border-[#262a3b] flex-shrink-0">
            {currentTrack.artwork ? (
              <img
                src={currentTrack.artwork}
                alt={currentTrack.name}
                className="w-full h-full object-cover"
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
            <div className="flex items-center gap-2">
              <h4 className="text-white font-semibold text-sm truncate">{currentTrack.name}</h4>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#10e57a]/20 text-[#10e57a] border border-[#10e57a]/30">
                LIVE AUDIO
              </span>
            </div>
            <p className="text-xs text-[#949eb5] truncate">
              {currentTrack.artist} · <span className="text-[#10e57a] font-mono font-medium">{currentTrack.bpm} BPM</span> · <span className="text-white/60 font-mono text-[10px]">{formatTime(currentTime)} / {formatTime(duration || currentTrack.durationSec)}</span>
            </p>
          </div>
        </div>

        {/* AI Cue & Open Source Library Indicator */}
        <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#1a1d28] border border-[#262a3b] text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#10e57a]" />
          <span className="text-[#949eb5]">AI Rhythm Match:</span>
          <span className="text-white font-medium truncate max-w-xs">{currentTrack.aiCue || "Harmonic tempo lock"}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={togglePlayPause}
            className="w-10 h-10 rounded-full bg-[#10e57a] hover:bg-[#0cd06d] text-black flex items-center justify-center transition-all shadow-[0_0_15px_rgba(16,229,122,0.3)]"
            title={isPlaying ? "Pause Stream" : "Play Real Audio"}
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
            title="Stop Playback"
          >
            <Square className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
