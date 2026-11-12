"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Watch, Footprints } from "lucide-react";
import { AppleWatchSimulator } from "@/components/AppleWatchSimulator";
import { SEEDED_TRACKS, Track } from "@/lib/music-catalogue";
import { calculateCadenceMatch, estimatePaceFromCadence, CadenceMatchResult } from "@/lib/cadence-engine";
import { realAudioPlayer } from "@/lib/open-source-player";

export default function StandaloneWatchPage() {
  const [cadence, setCadence] = useState<number>(135);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds] = useState<number>(142);
  const [distanceKm] = useState<number>(1.85);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [aiCoachCue, setAiCoachCue] = useState<string>("watchOS Cadence companion active at 135 SPM. Spacebar or Crown controls active.");
  const [, setStepTaps] = useState<number[]>([]);

  const currentTrack: Track = SEEDED_TRACKS[currentTrackIndex] || SEEDED_TRACKS[0];
  const matchResult: CadenceMatchResult = calculateCadenceMatch(cadence, currentTrack);
  const pace = estimatePaceFromCadence(cadence);

  const bestAlternative = SEEDED_TRACKS
    .map((t) => calculateCadenceMatch(cadence, t))
    .filter((res) => res.track.id !== currentTrack.id)
    .sort((a, b) => b.score - a.score)[0];

  const handleTogglePlay = useCallback(() => {
    if (isRunning) {
      realAudioPlayer.pause();
      setIsRunning(false);
    } else {
      realAudioPlayer.playTrack(currentTrack);
      setIsRunning(true);
    }
  }, [isRunning, currentTrack]);

  const handleCadenceChange = useCallback((newSpm: number) => {
    setCadence(newSpm);
    realAudioPlayer.setBpm(newSpm);
    const newMatch = calculateCadenceMatch(newSpm, currentTrack);
    setAiCoachCue(`Digital Crown: ${newSpm} SPM. Sync score: ${newMatch.score}%.`);
  }, [currentTrack]);

  const handleAutoAdapt = () => {
    if (bestAlternative) {
      const idx = SEEDED_TRACKS.findIndex((t) => t.id === bestAlternative.track.id);
      if (idx >= 0) setCurrentTrackIndex(idx);
      if (isRunning) realAudioPlayer.playTrack(bestAlternative.track);
      setAiCoachCue(`Action Button triggered! Switched to "${bestAlternative.track.name}" for 100% lock.`);
    }
  };

  const [clickCount, setClickCount] = useState<number>(0);

  // Step tap via Spacebar on watch page (Calibrated from first 4 clicks)
  const handleStepTap = useCallback(() => {
    const now = performance.now();
    if (!isRunning) {
      realAudioPlayer.playTrack(currentTrack);
      setIsRunning(true);
    }

    setStepTaps((prev) => {
      const isStale = prev.length > 0 && (now - prev[prev.length - 1] > 2500);
      const startingFresh = isStale || prev.length >= 4;
      const updated = startingFresh ? [now] : [...prev, now];
      const count = updated.length;
      setClickCount(count);

      if (count === 4) {
        const totalDurationMs = updated[3] - updated[0];
        const avgIntervalMs = totalDurationMs / 3;
        const measuredSpm = Math.round(60000 / avgIntervalMs);
        const clampedSpm = Math.max(100, Math.min(185, measuredSpm));
        handleCadenceChange(clampedSpm);
        setAiCoachCue(`Watch calibrated from 4 clicks: ${clampedSpm} SPM!`);
        setTimeout(() => setClickCount(0), 2200);
      } else {
        setAiCoachCue(`Step ${count}/4 recorded — tap ${4 - count} more times...`);
      }
      return updated;
    });
  }, [isRunning, currentTrack, handleCadenceChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        handleStepTap();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStepTap]);

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-between py-6 px-4">
      {/* Top Navigation */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between text-xs">
        <Link
          href="/run"
          className="flex items-center gap-1.5 text-[#949eb5] hover:text-white px-3 py-1.5 rounded-xl bg-[#12141c] border border-[#262a3b] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cockpit View</span>
        </Link>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#10e57a]/15 text-[#10e57a] border border-[#10e57a]/20 font-mono">
          <Watch className="w-3.5 h-3.5" />
          <span>Apple Watch Ultra Mode</span>
        </div>
      </div>

      {/* Center Watch Display */}
      <div className="flex-1 flex flex-col items-center justify-center py-4">
        <AppleWatchSimulator
          cadence={cadence}
          onCadenceChange={handleCadenceChange}
          isRunning={isRunning}
          onTogglePlay={handleTogglePlay}
          currentTrack={currentTrack}
          matchResult={matchResult}
          elapsedSeconds={elapsedSeconds}
          distanceKm={distanceKm}
          paceFormatted={pace.paceFormatted}
          onAutoAdapt={handleAutoAdapt}
          aiCoachCue={aiCoachCue}
        />

        {/* Spacebar step shortcut bar under watch */}
        <button
          onClick={handleStepTap}
          className="mt-4 flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1a1d28] hover:bg-[#262a3b] border border-[#262a3b] text-white text-xs font-mono transition-all active:scale-95 shadow-md"
        >
          <Footprints className="w-4 h-4 text-[#10e57a]" />
          <span>Tap Step [Spacebar] ({clickCount}/4)</span>
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="max-w-sm mx-auto text-center text-xs text-[#949eb5] font-mono space-y-1">
        <p className="text-white font-semibold">watchOS 11 Companion App Prototype</p>
        <p>Rotate Digital Crown or tap Spacebar to calibrate step SPM in real-time</p>
      </div>
    </div>
  );
}
