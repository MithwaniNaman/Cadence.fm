"use client";

import { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  Heart, 
  Compass, 
  Disc3, 
  Sparkles, 
  Volume2, 
  Flame, 
  CheckCircle2, 
  ArrowRight,
  Radio,
  Zap,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { Track } from "@/lib/music-catalogue";
import { CadenceMatchResult } from "@/lib/cadence-engine";
import { formatTime } from "@/lib/utils";

interface AppleWatchProps {
  cadence: number;
  onCadenceChange: (spm: number) => void;
  isRunning: boolean;
  onTogglePlay: () => void;
  currentTrack: Track;
  matchResult: CadenceMatchResult;
  elapsedSeconds: number;
  distanceKm: number;
  paceFormatted: string;
  onAutoAdapt: () => void;
  aiCoachCue: string;
}

export function AppleWatchSimulator({
  cadence,
  onCadenceChange,
  isRunning,
  onTogglePlay,
  currentTrack,
  matchResult,
  elapsedSeconds,
  distanceKm,
  paceFormatted,
  onAutoAdapt,
  aiCoachCue,
}: AppleWatchProps) {
  const [activeWatchScreen, setActiveWatchScreen] = useState<"workout" | "music">("workout");
  const [hapticTriggered, setHapticTriggered] = useState<boolean>(false);

  // Trigger simulated haptic pulse on cadence lock change
  useEffect(() => {
    setHapticTriggered(true);
    const t = setTimeout(() => setHapticTriggered(false), 300);
    return () => clearTimeout(t);
  }, [matchResult.isPhaseLocked, cadence]);

  const rotateCrown = (delta: number) => {
    const next = Math.max(140, Math.min(195, cadence + delta));
    onCadenceChange(next);
  };

  return (
    <div className="flex flex-col items-center justify-center select-none py-4">
      {/* WATCH HARDWARE BEZEL CONTAINER */}
      <div className="relative flex items-center justify-center">
        {/* Watch Straps (Alpine Loop Orange / Charcoal Stitched) */}
        <div className="absolute -top-12 w-44 h-16 bg-gradient-to-b from-[#222533] to-[#161822] rounded-t-3xl border-t border-x border-[#343a4e] shadow-inner" />
        <div className="absolute -bottom-12 w-44 h-16 bg-gradient-to-t from-[#222533] to-[#161822] rounded-b-3xl border-b border-x border-[#343a4e] shadow-inner" />

        {/* Digital Crown (Right Top) */}
        <button
          onClick={() => rotateCrown(2)}
          className="absolute -right-3.5 top-16 w-3.5 h-16 bg-gradient-to-r from-[#5a627a] via-[#8f9bb3] to-[#404658] rounded-r-md border border-[#2a2f3f] shadow-md hover:brightness-125 transition-all flex flex-col items-center justify-center gap-1 cursor-ns-resize group"
          title="Digital Crown: Click or drag to adjust cadence"
        >
          <span className="w-1.5 h-0.5 bg-black/50" />
          <span className="w-1.5 h-0.5 bg-black/50" />
          <span className="w-1.5 h-0.5 bg-black/50" />
        </button>

        {/* Side Button (Right Bottom) */}
        <button
          onClick={() => setActiveWatchScreen(activeWatchScreen === "workout" ? "music" : "workout")}
          className="absolute -right-2 top-36 w-2 h-10 bg-[#404658] rounded-r border border-[#2a2f3f] hover:brightness-125"
          title="Side Button: Switch Watch App Screen"
        />

        {/* Ultra Action Button (Left - Safety Orange) */}
        <button
          onClick={onAutoAdapt}
          className="absolute -left-3 top-24 w-3 h-14 bg-[#f97316] rounded-l-md border border-[#c2410c] shadow-[0_0_10px_rgba(249,115,22,0.4)] hover:brightness-110 active:scale-95 transition-all"
          title="Action Button: Instant AI Cadence Match"
        />

        {/* Apple Watch Titanium Chassis Body */}
        <div className={`relative w-72 h-[380px] bg-[#1a1c24] rounded-[52px] p-3 border-4 border-[#3c4254] shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_0_8px_rgba(255,255,255,0.1)] transition-transform duration-100 ${
          hapticTriggered ? "scale-[1.01]" : "scale-100"
        }`}>
          {/* Edge Bezel Rim */}
          <div className="w-full h-full bg-black rounded-[42px] overflow-hidden relative flex flex-col p-4 border border-[#222533]">
            {/* Top WatchOS Status Bar */}
            <div className="flex items-center justify-between text-[11px] text-[#949eb5] font-semibold pb-1 border-b border-white/5">
              <span className="font-mono text-white">10:09</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10e57a] animate-ping" />
                <span className="text-[10px] text-[#10e57a] font-mono">CADENCE</span>
                <span className="text-[10px] text-white/60">84%</span>
              </div>
            </div>

            {/* SCREEN 1: WORKOUT METRICS HUD */}
            {activeWatchScreen === "workout" && (
              <div className="flex-1 flex flex-col justify-between py-2">
                {/* Big Cadence SPM Gauge */}
                <div className="text-center pt-1">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#949eb5] block">
                    Cadence SPM
                  </span>
                  <div className="flex items-baseline justify-center gap-1 my-0.5">
                    <span className="text-5xl font-extrabold font-mono text-[#10e57a] tracking-tight">
                      {cadence}
                    </span>
                    <span className="text-xs font-bold text-[#949eb5]">SPM</span>
                  </div>

                  {/* AI Match Badge on Watch */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#10e57a]/20 border border-[#10e57a]/30 text-[10px] font-mono text-[#10e57a]">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>{matchResult.score}% Sync · {matchResult.relationship}</span>
                  </div>
                </div>

                {/* Secondary 2-Column Metrics */}
                <div className="grid grid-cols-2 gap-2 my-1 px-1">
                  <div className="bg-[#12141c] p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase text-[#949eb5] block font-mono">Pace</span>
                    <span className="text-sm font-bold font-mono text-white">{paceFormatted} /km</span>
                  </div>
                  <div className="bg-[#12141c] p-2 rounded-xl border border-white/5">
                    <span className="text-[9px] uppercase text-[#949eb5] block font-mono">Distance</span>
                    <span className="text-sm font-bold font-mono text-white">{distanceKm.toFixed(2)} KM</span>
                  </div>
                </div>

                {/* Mini Now Playing Row on Watch */}
                <div className="bg-[#12141c] p-2 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-md bg-[#262a3b] overflow-hidden flex-shrink-0">
                      <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{currentTrack.name}</p>
                      <p className="text-[9px] text-[#10e57a] font-mono">{currentTrack.bpm} BPM</p>
                    </div>
                  </div>

                  <button
                    onClick={onTogglePlay}
                    className="w-7 h-7 rounded-full bg-[#10e57a] text-black flex items-center justify-center flex-shrink-0"
                  >
                    {isRunning ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-black ml-0.5" />}
                  </button>
                </div>

                {/* AI Coach Voice Cue Bubble */}
                <div className="text-[9px] text-white/70 bg-[#16201b] p-1.5 rounded-lg border border-[#10e57a]/20 line-clamp-1 text-center font-mono">
                  🤖 {aiCoachCue}
                </div>
              </div>
            )}

            {/* SCREEN 2: NOW PLAYING & AI ADAPT SCREEN */}
            {activeWatchScreen === "music" && (
              <div className="flex-1 flex flex-col justify-between py-2 text-center">
                {/* Artwork */}
                <div className="relative w-20 h-20 mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-lg mt-1">
                  <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-[#10e57a] text-black">
                    {currentTrack.bpm} BPM
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white truncate px-2">{currentTrack.name}</h4>
                  <p className="text-[10px] text-[#949eb5] truncate">{currentTrack.artist}</p>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => rotateCrown(-3)}
                    className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20"
                    title="Lower Cadence"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onTogglePlay}
                    className="w-10 h-10 rounded-full bg-[#10e57a] text-black flex items-center justify-center shadow-lg"
                  >
                    {isRunning ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                  </button>
                  <button
                    onClick={() => rotateCrown(3)}
                    className="p-1.5 rounded-full bg-white/10 text-white hover:bg-white/20"
                    title="Increase Cadence"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* AI Adapt Button */}
                <button
                  onClick={onAutoAdapt}
                  className="w-full py-2 rounded-xl bg-[#f97316] text-black font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                >
                  <Sparkles className="w-3 h-3 fill-black" />
                  <span>AI Auto-Sync (Crown: {cadence} SPM)</span>
                </button>
              </div>
            )}

            {/* Bottom Screen Indicator Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <button
                onClick={() => setActiveWatchScreen("workout")}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeWatchScreen === "workout" ? "bg-[#10e57a] w-3" : "bg-white/30"
                }`}
              />
              <button
                onClick={() => setActiveWatchScreen("music")}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeWatchScreen === "music" ? "bg-[#10e57a] w-3" : "bg-white/30"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* WATCH INTERACTIVE INSTRUCTION HINT */}
      <div className="mt-6 flex items-center gap-4 text-xs font-mono text-[#949eb5]">
        <button
          onClick={() => rotateCrown(-2)}
          className="px-2.5 py-1 rounded bg-[#1a1d28] border border-[#262a3b] hover:text-white"
        >
          -2 SPM
        </button>
        <span className="text-[#10e57a]">Rotate Crown / Click Buttons</span>
        <button
          onClick={() => rotateCrown(2)}
          className="px-2.5 py-1 rounded bg-[#1a1d28] border border-[#262a3b] hover:text-white"
        >
          +2 SPM
        </button>
      </div>
    </div>
  );
}
