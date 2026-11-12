"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Monitor, Watch, Sparkles, Volume2 } from "lucide-react";
import { AppleWatchSimulator } from "@/components/AppleWatchSimulator";
import { SEEDED_TRACKS, Track } from "@/lib/music-catalogue";
import { calculateCadenceMatch, estimatePaceFromCadence, CadenceMatchResult } from "@/lib/cadence-engine";
import { realAudioPlayer } from "@/lib/open-source-player";
import { loadActivePlaylist } from "@/lib/user-store";

export default function StandaloneWatchPage() {
  const [cadence, setCadence] = useState<number>(168);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(142);
  const [distanceKm, setDistanceKm] = useState<number>(1.85);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(2);
  const [aiCoachCue, setAiCoachCue] = useState<string>("Crown rotated. 168 SPM locked into 84 BPM half-time groove.");

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

  const handleCadenceChange = (newSpm: number) => {
    setCadence(newSpm);
    const newMatch = calculateCadenceMatch(newSpm, currentTrack);
    setAiCoachCue(`Digital Crown: ${newSpm} SPM. Sync score: ${newMatch.score}%.`);
  };

  const handleAutoAdapt = () => {
    if (bestAlternative) {
      const idx = SEEDED_TRACKS.findIndex((t) => t.id === bestAlternative.track.id);
      if (idx >= 0) setCurrentTrackIndex(idx);
      if (isRunning) realAudioPlayer.playTrack(bestAlternative.track);
      setAiCoachCue(`Action Button triggered! Switched to "${bestAlternative.track.name}" for 100% lock.`);
    }
  };

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
      <div className="flex-1 flex items-center justify-center py-6">
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
      </div>

      {/* Bottom Hint */}
      <div className="max-w-sm mx-auto text-center text-xs text-[#949eb5] font-mono space-y-1">
        <p className="text-white font-semibold">watchOS 11 Companion App Prototype</p>
        <p>Interactive Digital Crown adjusts cadence · Orange Action Button triggers AI Auto-Sync</p>
      </div>
    </div>
  );
}
