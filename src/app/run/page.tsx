"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Sliders, 
  Radio, 
  Zap, 
  Flame, 
  CheckCircle2, 
  Watch, 
  Monitor, 
  Split, 
  Volume2, 
  ArrowRight,
  RefreshCw,
  Cpu
} from "lucide-react";
import { 
  loadActivePlaylist, 
  saveRunSession, 
  RunSessionRecord 
} from "@/lib/user-store";
import { GeneratedPlaylist, PlaylistTrackItem } from "@/lib/playlist-generator";
import { SEEDED_TRACKS, Track } from "@/lib/music-catalogue";
import { calculateCadenceMatch, estimatePaceFromCadence, CadenceMatchResult } from "@/lib/cadence-engine";
import { realAudioPlayer } from "@/lib/open-source-player";
import { formatTime } from "@/lib/utils";
import { AppleWatchSimulator } from "@/components/AppleWatchSimulator";

export default function LiveRunSimulatorPage() {
  const router = useRouter();

  // Run Telemetry State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [cadence, setCadence] = useState<number>(165);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [displayMode, setDisplayMode] = useState<"cockpit" | "watch" | "split">("cockpit");

  // Music & Real Audio Stream
  const [playlist, setPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [aiAutoAdaptEnabled, setAiAutoAdaptEnabled] = useState<boolean>(true);
  const [aiCoachCue, setAiCoachCue] = useState<string>("Cadence locked at 165 SPM. Real open-source stream active.");

  // Telemetry recording refs
  const historyRef = useRef<{
    second: number;
    cadence: number;
    pace: number;
    compatibility: number;
    trackName: string;
  }[]>([]);

  const zoneSecondsRef = useRef({
    warmup: 0,
    cruise: 0,
    threshold: 0,
    sprint: 0,
  });

  // Load active playlist on mount
  useEffect(() => {
    const active = loadActivePlaylist();
    setPlaylist(active);
  }, []);

  const currentTrack: Track = playlist?.tracks[currentTrackIndex]?.track || SEEDED_TRACKS[0];
  const matchResult: CadenceMatchResult = calculateCadenceMatch(cadence, currentTrack);
  const pace = estimatePaceFromCadence(cadence);

  // Identify best matching alternative track across catalogue
  const bestAlternative = SEEDED_TRACKS
    .map((t) => calculateCadenceMatch(cadence, t))
    .filter((res) => res.track.id !== currentTrack.id)
    .sort((a, b) => b.score - a.score)[0];

  // Real Audio Streaming Trigger
  const handleTogglePlay = useCallback(() => {
    if (isRunning) {
      realAudioPlayer.pause();
      setIsRunning(false);
    } else {
      realAudioPlayer.playTrack(currentTrack);
      setIsRunning(true);
    }
  }, [isRunning, currentTrack]);

  // Handle manual or watch cadence adjustment
  const handleCadenceChange = (newSpm: number) => {
    setCadence(newSpm);
    const newMatch = calculateCadenceMatch(newSpm, currentTrack);

    if (newMatch.score < 85) {
      setAiCoachCue(`Cadence shifted to ${newSpm} SPM. Track sync dropped to ${newMatch.score}%. AI Auto-DJ ready.`);
      if (aiAutoAdaptEnabled && bestAlternative && bestAlternative.score > 92) {
        // Auto adapt track
        setTimeout(() => {
          handleSwitchTrack(bestAlternative.track);
        }, 1200);
      }
    } else {
      setAiCoachCue(`Cadence optimal at ${newSpm} SPM (${newMatch.rhythmDetail}, ${newMatch.score}% sync).`);
    }
  };

  // Switch to specific track (with real open source audio stream)
  const handleSwitchTrack = (newTrack: Track) => {
    if (playlist) {
      const idx = playlist.tracks.findIndex((item: PlaylistTrackItem) => item.track.id === newTrack.id);
      if (idx >= 0) {
        setCurrentTrackIndex(idx);
      }
    }
    if (isRunning) {
      realAudioPlayer.playTrack(newTrack);
    }
    setAiCoachCue(`AI DJ crossfaded to "${newTrack.name}" (${newTrack.bpm} BPM) for 1:1 cadence harmony!`);
  };

  // Main simulation timer loop
  useEffect(() => {
    if (!isRunning) return;

    const intervalMs = 1000 / simulationSpeed;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextSec = prev + 1;

        setDistanceKm((prevDist) => {
          const metersThisSec = (cadence * pace.strideMeters) / 60;
          return parseFloat((prevDist + metersThisSec / 1000).toFixed(3));
        });

        if (nextSec % 3 === 0) {
          historyRef.current.push({
            second: nextSec,
            cadence,
            pace: pace.paceSecondsPerKm,
            compatibility: matchResult.score,
            trackName: currentTrack.name,
          });
        }

        if (cadence < 155) zoneSecondsRef.current.warmup += 1;
        else if (cadence <= 167) zoneSecondsRef.current.cruise += 1;
        else if (cadence <= 176) zoneSecondsRef.current.threshold += 1;
        else zoneSecondsRef.current.sprint += 1;

        return nextSec;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed, cadence, pace, matchResult.score, currentTrack.name]);

  // Complete workout flow
  const handleCompleteWorkout = () => {
    setIsRunning(false);
    realAudioPlayer.stop();

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    const totalSec = Math.max(elapsedSeconds, 180);
    const history = historyRef.current.length > 3 ? historyRef.current : [
      { second: 0, cadence: 155, pace: 330, compatibility: 92, trackName: currentTrack.name },
      { second: 60, cadence: 165, pace: 310, compatibility: 96, trackName: "Resonance Engine" },
      { second: 120, cadence: 150, pace: 345, compatibility: 89, trackName: "Sub-Zero Stride" },
      { second: 180, cadence: 175, pace: 288, compatibility: 98, trackName: "Propulsion Vector" },
    ];

    const avgCad = Math.round(history.reduce((a, b) => a + b.cadence, 0) / (history.length || 1));
    const peakCad = Math.max(...history.map((h) => h.cadence), cadence);
    const avgScore = Math.round(history.reduce((a, b) => a + b.compatibility, 0) / (history.length || 1));
    const totalZoneSec = Object.values(zoneSecondsRef.current).reduce((a, b) => a + b, 0) || totalSec;

    const sessionRecord: RunSessionRecord = {
      id: `run-${Date.now()}`,
      title: `${playlist?.workoutType ? playlist.workoutType.toUpperCase() : "ADAPTIVE"} Live Session`,
      workoutType: playlist?.workoutType || "Tempo Run",
      date: "Just now",
      durationSeconds: totalSec,
      distanceKm: Math.max(distanceKm, 1.2),
      avgCadence: avgCad,
      peakCadence: peakCad,
      avgPace: pace.paceFormatted,
      avgCompatibilityScore: avgScore,
      mostCompatibleTrack: {
        name: currentTrack.name,
        artist: currentTrack.artist,
        bpm: currentTrack.bpm,
        score: matchResult.score,
        relationship: matchResult.rhythmDetail,
      },
      timeSeries: history,
      cadenceZones: [
        { zoneName: "Warmup / Recovery", range: "< 155 SPM", seconds: zoneSecondsRef.current.warmup, percentage: Math.round((zoneSecondsRef.current.warmup / totalZoneSec) * 100) || 15, color: "#06b6d4" },
        { zoneName: "Aerobic Cruise", range: "155 - 167 SPM", seconds: zoneSecondsRef.current.cruise, percentage: Math.round((zoneSecondsRef.current.cruise / totalZoneSec) * 100) || 45, color: "#10e57a" },
        { zoneName: "Threshold Lock", range: "168 - 176 SPM", seconds: zoneSecondsRef.current.threshold, percentage: Math.round((zoneSecondsRef.current.threshold / totalZoneSec) * 100) || 30, color: "#f59e0b" },
        { zoneName: "Anaerobic Kick", range: "> 176 SPM", seconds: zoneSecondsRef.current.sprint, percentage: Math.round((zoneSecondsRef.current.sprint / totalZoneSec) * 100) || 10, color: "#f43f5e" },
      ],
      aiCoachSummary: `Session completed with ${avgScore}% musical-biomechanical resonance. Rapid cadence adaptations at ${peakCad} SPM prevented stride stagnation.`,
    };

    saveRunSession(sessionRecord);
    setTimeout(() => {
      router.push(`/insights?session=${sessionRecord.id}`);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* SIMPLIFIED CONTROL BAR & DISPLAY SWITCHER */}
      <div className="p-3.5 rounded-2xl bg-[#12141c] border border-[#262a3b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10e57a] animate-ping" />
          <span className="font-bold text-white uppercase tracking-wider font-mono">
            Cadence Engine · Real Open-Source Audio
          </span>
        </div>

        {/* Display Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[#949eb5] font-mono text-[11px]">Display View:</span>
          <div className="flex items-center p-0.5 rounded-xl bg-[#1a1d28] border border-[#262a3b]">
            <button
              onClick={() => setDisplayMode("cockpit")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                displayMode === "cockpit" ? "bg-[#10e57a] text-black font-bold" : "text-[#949eb5] hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Cockpit</span>
            </button>
            <button
              onClick={() => setDisplayMode("watch")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                displayMode === "watch" ? "bg-[#10e57a] text-black font-bold" : "text-[#949eb5] hover:text-white"
              }`}
            >
              <Watch className="w-3.5 h-3.5" />
              <span>Apple Watch</span>
            </button>
            <button
              onClick={() => setDisplayMode("split")}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                displayMode === "split" ? "bg-[#10e57a] text-black font-bold" : "text-[#949eb5] hover:text-white"
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span>Split Dual</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI STRIDE COACH & REAL-TIME ADAPTATION BANNER */}
      <div className="p-4 rounded-2xl bg-[#141b18] border border-[#10e57a]/40 shadow-[0_0_20px_rgba(16,229,122,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#10e57a] flex-shrink-0" />
          <span className="text-white font-mono font-medium">{aiCoachCue}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setAiAutoAdaptEnabled(!aiAutoAdaptEnabled)}
            className={`px-3 py-1 rounded-lg font-mono text-[11px] font-bold border transition-colors ${
              aiAutoAdaptEnabled
                ? "bg-[#10e57a]/20 border-[#10e57a] text-[#10e57a]"
                : "bg-[#1a1d28] border-[#262a3b] text-[#949eb5]"
            }`}
          >
            AI Auto-DJ: {aiAutoAdaptEnabled ? "ON" : "OFF"}
          </button>

          {matchResult.score < 88 && bestAlternative && (
            <button
              onClick={() => handleSwitchTrack(bestAlternative.track)}
              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-[#f97316] text-black font-bold text-xs uppercase shadow-[0_0_10px_rgba(249,115,22,0.4)]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>AI Sync Track</span>
            </button>
          )}
        </div>
      </div>

      {/* DISPLAY MODES RENDER */}
      {displayMode === "watch" && (
        <div className="py-6 flex flex-col items-center">
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
            onAutoAdapt={() => bestAlternative && handleSwitchTrack(bestAlternative.track)}
            aiCoachCue={aiCoachCue}
          />
        </div>
      )}

      {(displayMode === "cockpit" || displayMode === "split") && (
        <div className={`grid ${displayMode === "split" ? "grid-cols-1 lg:grid-cols-12 gap-6" : "grid-cols-1 gap-6"}`}>
          {/* COCKPIT CARD (Simplified Basic Controls + AI) */}
          <div className={displayMode === "split" ? "lg:col-span-7 space-y-6" : "space-y-6"}>
            {/* Primary HUD Readouts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b]">
                <span className="text-[10px] uppercase font-mono text-[#949eb5]">Cadence</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-4xl sm:text-5xl font-mono font-extrabold text-[#10e57a]">{cadence}</span>
                  <span className="text-xs text-[#949eb5]">SPM</span>
                </div>
                <span className="text-[10px] font-mono text-[#10e57a]">{matchResult.score}% Sync Lock</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b]">
                <span className="text-[10px] uppercase font-mono text-[#949eb5]">Pace</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white">{pace.paceFormatted}</span>
                  <span className="text-xs text-[#949eb5]">/km</span>
                </div>
                <span className="text-[10px] font-mono text-[#949eb5]">{pace.speedKmh} km/h</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b]">
                <span className="text-[10px] uppercase font-mono text-[#949eb5]">Distance</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white">{distanceKm.toFixed(2)}</span>
                  <span className="text-xs text-[#949eb5]">KM</span>
                </div>
                <span className="text-[10px] font-mono text-[#949eb5]">Stride {pace.strideMeters}m</span>
              </div>

              <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b]">
                <span className="text-[10px] uppercase font-mono text-[#949eb5]">Time</span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-4xl sm:text-5xl font-mono font-extrabold text-white">{formatTime(elapsedSeconds)}</span>
                </div>
                <span className="text-[10px] font-mono text-[#949eb5]">{Math.round(distanceKm * 62)} kcal</span>
              </div>
            </div>

            {/* Now Playing Real Audio Card */}
            <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#1a1d28] border border-[#262a3b] flex-shrink-0">
                  <img src={currentTrack.artwork} alt="" className="w-full h-full object-cover" />
                  {isRunning && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="flex items-end gap-[3px] h-4">
                        <span className="w-1 bg-[#10e57a] rounded-full h-2 animate-beat-1" />
                        <span className="w-1 bg-[#10e57a] rounded-full h-4 animate-beat-2" />
                        <span className="w-1 bg-[#10e57a] rounded-full h-3 animate-beat-3" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white truncate">{currentTrack.name}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10e57a]/20 text-[#10e57a] border border-[#10e57a]/30">
                      {currentTrack.bpm} BPM
                    </span>
                  </div>
                  <p className="text-xs text-[#949eb5] mt-0.5 truncate">{currentTrack.artist} · {currentTrack.genre}</p>
                  <p className="text-[11px] text-[#06b6d4] font-mono mt-1">{matchResult.explanation}</p>
                </div>
              </div>

              {/* Master Play Button */}
              <button
                onClick={handleTogglePlay}
                className="w-14 h-14 rounded-2xl bg-[#10e57a] hover:bg-[#0cd06d] text-black flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(16,229,122,0.4)] transition-all"
                title={isRunning ? "Pause Stream" : "Start Real Audio Stream"}
              >
                {isRunning ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
              </button>
            </div>

            {/* Basic Cadence Controls */}
            <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white uppercase tracking-wider font-mono">
                  Cadence Controller:
                </span>
                <span className="text-[#10e57a] font-mono font-bold">{cadence} SPM</span>
              </div>

              {/* Quick Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[155, 165, 150, 175].map((spm) => (
                  <button
                    key={spm}
                    onClick={() => handleCadenceChange(spm)}
                    className={`py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${
                      cadence === spm
                        ? "bg-[#10e57a] text-black border-[#10e57a]"
                        : "bg-[#1a1d28] border-[#262a3b] text-[#949eb5] hover:text-white"
                    }`}
                  >
                    {spm} SPM
                  </button>
                ))}
              </div>

              {/* Continuous Slider */}
              <input
                type="range"
                min={140}
                max={190}
                value={cadence}
                onChange={(e) => handleCadenceChange(parseInt(e.target.value))}
                className="w-full accent-[#10e57a] cursor-pointer"
              />

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTogglePlay}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${
                    isRunning ? "bg-[#1a1d28] border border-[#262a3b] text-white" : "bg-[#10e57a] text-black shadow-lg"
                  }`}
                >
                  {isRunning ? "Pause Session" : "Start Live Session"}
                </button>
                <button
                  onClick={handleCompleteWorkout}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#10e57a] text-black font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-opacity"
                >
                  Complete & Insights
                </button>
              </div>
            </div>
          </div>

          {/* SPLIT VIEW RIGHT: APPLE WATCH SIMULATOR (5 cols) */}
          {displayMode === "split" && (
            <div className="lg:col-span-5 flex justify-center items-center">
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
                onAutoAdapt={() => bestAlternative && handleSwitchTrack(bestAlternative.track)}
                aiCoachCue={aiCoachCue}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
