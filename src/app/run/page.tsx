"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { 
  Play, 
  Pause, 
  Sparkles, 
  Watch, 
  Monitor, 
  Split, 
  RefreshCw,
  Footprints,
  Activity,
  Zap
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
import { audioSynth } from "@/lib/audio-synthesizer";
import { formatTime } from "@/lib/utils";
import { AppleWatchSimulator } from "@/components/AppleWatchSimulator";

export default function LiveRunSimulatorPage() {
  const router = useRouter();

  // Run Telemetry State - Starting at 135 SPM (recreational cruising cadence)
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [cadence, setCadence] = useState<number>(135);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [displayMode, setDisplayMode] = useState<"cockpit" | "watch" | "split">("cockpit");

  // Tap-tempo stride detector state
  const [stepTaps, setStepTaps] = useState<number[]>([]);
  const [isSteppingVisual, setIsSteppingVisual] = useState<boolean>(false);
  const [lastTapFeedback, setLastTapFeedback] = useState<string | null>(null);

  // Music & Real Audio Stream
  const [playlist, setPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [aiAutoAdaptEnabled, setAiAutoAdaptEnabled] = useState<boolean>(true);
  const [aiCoachCue, setAiCoachCue] = useState<string>("Cadence calibrated at 135 SPM. Spacebar or Step button active.");

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
  const handleCadenceChange = useCallback((newSpm: number) => {
    setCadence(newSpm);
    realAudioPlayer.setBpm(newSpm);
    const newMatch = calculateCadenceMatch(newSpm, currentTrack);

    if (newMatch.score < 85) {
      setAiCoachCue(`Cadence shifted to ${newSpm} SPM. Track sync at ${newMatch.score}%. AI Auto-DJ ready.`);
      if (aiAutoAdaptEnabled && bestAlternative && bestAlternative.score > 92) {
        setTimeout(() => {
          handleSwitchTrack(bestAlternative.track);
        }, 1000);
      }
    } else {
      setAiCoachCue(`Cadence locked at ${newSpm} SPM (${newMatch.rhythmDetail}, ${newMatch.score}% sync).`);
    }
  }, [currentTrack, aiAutoAdaptEnabled, bestAlternative]);

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

  // STEP BUTTON / SPACEBAR TAP-TEMPO DETECTOR
  const handleStepTap = useCallback(() => {
    const now = performance.now();

    // Trigger visual footstep flash
    setIsSteppingVisual(true);
    setTimeout(() => setIsSteppingVisual(false), 180);

    // If run isn't started yet, automatically start on footstrike!
    if (!isRunning) {
      realAudioPlayer.playTrack(currentTrack);
      setIsRunning(true);
    }

    setStepTaps((prevTaps) => {
      // Filter out taps older than 2.8 seconds
      const recent = prevTaps.filter((t) => now - t < 2800);
      const updated = [...recent, now];

      if (updated.length >= 2) {
        // Calculate intervals between consecutive taps
        const intervals: number[] = [];
        for (let i = 1; i < updated.length; i++) {
          const delta = updated[i] - updated[i - 1];
          // Reject accidental key chatter / debounce (< 160ms)
          if (delta > 160) {
            intervals.push(delta);
          }
        }

        if (intervals.length > 0) {
          const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
          // Calculate SPM = 60,000 ms / avgInterval
          const calculatedSpm = Math.round(60000 / avgInterval);
          // Clamp to realistic range
          const clampedSpm = Math.max(100, Math.min(185, calculatedSpm));

          handleCadenceChange(clampedSpm);
          setLastTapFeedback(`👟 Stride locked: ${clampedSpm} SPM (${Math.round(avgInterval)}ms per step)`);
        }
      } else {
        setLastTapFeedback("👟 Tap again to calibrate stride cadence...");
      }

      return updated.slice(-5); // keep last 5 taps
    });
  }, [isRunning, currentTrack, handleCadenceChange]);

  // Global Spacebar Keydown Listener for Step Tap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === "INPUT" || targetTag === "TEXTAREA" || targetTag === "SELECT") {
        return;
      }

      if (e.code === "Space" || e.key === " ") {
        e.preventDefault(); // Stop page scrolling
        handleStepTap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleStepTap]);

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

        if (cadence < 130) zoneSecondsRef.current.warmup += 1;
        else if (cadence <= 145) zoneSecondsRef.current.cruise += 1;
        else if (cadence <= 160) zoneSecondsRef.current.threshold += 1;
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
      { second: 0, cadence: 125, pace: 360, compatibility: 94, trackName: currentTrack.name },
      { second: 60, cadence: 135, pace: 340, compatibility: 97, trackName: "Rhythm Calibration" },
      { second: 120, cadence: 140, pace: 325, compatibility: 96, trackName: "Pacific Highway" },
      { second: 180, cadence: 150, pace: 310, compatibility: 98, trackName: "Resonance Engine" },
    ];

    const avgCad = Math.round(history.reduce((a, b) => a + b.cadence, 0) / (history.length || 1));
    const peakCad = Math.max(...history.map((h) => h.cadence), cadence);
    const avgScore = Math.round(history.reduce((a, b) => a + b.compatibility, 0) / (history.length || 1));
    const totalZoneSec = Object.values(zoneSecondsRef.current).reduce((a, b) => a + b, 0) || totalSec;

    const sessionRecord: RunSessionRecord = {
      id: `run-${Date.now()}`,
      title: `${playlist?.workoutType ? playlist.workoutType.toUpperCase() : "CADENCE"} Session`,
      workoutType: playlist?.workoutType || "Easy Run",
      date: "Just now",
      durationSeconds: totalSec,
      distanceKm: Math.max(distanceKm, 1.4),
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
        { zoneName: "Warmup / Easy Jog", range: "< 130 SPM", seconds: zoneSecondsRef.current.warmup, percentage: Math.round((zoneSecondsRef.current.warmup / totalZoneSec) * 100) || 20, color: "#06b6d4" },
        { zoneName: "Aerobic Cruise", range: "130 - 145 SPM", seconds: zoneSecondsRef.current.cruise, percentage: Math.round((zoneSecondsRef.current.cruise / totalZoneSec) * 100) || 50, color: "#10e57a" },
        { zoneName: "Threshold Lock", range: "146 - 160 SPM", seconds: zoneSecondsRef.current.threshold, percentage: Math.round((zoneSecondsRef.current.threshold / totalZoneSec) * 100) || 20, color: "#f59e0b" },
        { zoneName: "Fast Surge", range: "> 160 SPM", seconds: zoneSecondsRef.current.sprint, percentage: Math.round((zoneSecondsRef.current.sprint / totalZoneSec) * 100) || 10, color: "#f43f5e" },
      ],
      aiCoachSummary: `Session completed with ${avgScore}% musical-biomechanical resonance. Step-frequency matching maintained an even aerobic stride at ${avgCad} SPM.`,
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
            Cadence Engine · Real Open-Source Music
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

      {/* TACTILE STEP BUTTON & KEYBOARD SHORTCUT BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#16201b] via-[#121815] to-[#16201b] border border-[#10e57a]/50 shadow-[0_0_25px_rgba(16,229,122,0.18)] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
            isSteppingVisual
              ? "bg-[#10e57a] text-black scale-110 shadow-[0_0_20px_#10e57a]"
              : "bg-[#10e57a]/15 text-[#10e57a] border border-[#10e57a]/30"
          }`}>
            <Footprints className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Tap-Tempo Step Detector</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1a1d28] text-[#10e57a] border border-[#262a3b]">
                ⌨️ Spacebar Shortcut Active
              </span>
            </div>
            <p className="text-xs text-[#949eb5] mt-0.5">
              {lastTapFeedback || "Press the Spacebar or tap the button in rhythm with your footsteps to set live cadence."}
            </p>
          </div>
        </div>

        {/* Big Tap Step Button */}
        <button
          onClick={handleStepTap}
          type="button"
          className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all select-none active:scale-95 ${
            isSteppingVisual
              ? "bg-white text-black shadow-[0_0_25px_#ffffff]"
              : "bg-[#10e57a] hover:bg-[#0cd06d] text-black shadow-[0_0_20px_rgba(16,229,122,0.35)]"
          }`}
        >
          <Footprints className="w-4 h-4 fill-black" />
          <span>Tap Step (Space)</span>
        </button>
      </div>

      {/* AI STRIDE COACH & REAL-TIME ADAPTATION BANNER */}
      <div className="p-4 rounded-2xl bg-[#141b18] border border-[#10e57a]/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
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
              <div className={`p-5 rounded-2xl bg-[#12141c] border transition-colors ${
                isSteppingVisual ? "border-[#10e57a] bg-[#16201b]" : "border-[#262a3b]"
              }`}>
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
                title={isRunning ? "Pause Music" : "Start Live Music"}
              >
                {isRunning ? <Pause className="w-6 h-6 fill-black" /> : <Play className="w-6 h-6 fill-black ml-0.5" />}
              </button>
            </div>

            {/* Basic Cadence Controls with Lower Range Benchmarks */}
            <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white uppercase tracking-wider font-mono">
                  Cadence Controller (Recreational & Jogger Range):
                </span>
                <span className="text-[#10e57a] font-mono font-bold">{cadence} SPM</span>
              </div>

              {/* Quick Presets: 120, 135, 150, 165 */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { spm: 120, label: "120 Warmup" },
                  { spm: 135, label: "135 Cruise" },
                  { spm: 150, label: "150 Steady" },
                  { spm: 165, label: "165 Tempo" },
                ].map((item) => (
                  <button
                    key={item.spm}
                    onClick={() => handleCadenceChange(item.spm)}
                    className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-colors ${
                      cadence === item.spm
                        ? "bg-[#10e57a] text-black border-[#10e57a]"
                        : "bg-[#1a1d28] border-[#262a3b] text-[#949eb5] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Continuous Slider from 100 to 180 SPM */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={100}
                  max={180}
                  value={cadence}
                  onChange={(e) => handleCadenceChange(parseInt(e.target.value))}
                  className="w-full accent-[#10e57a] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#6b7794]">
                  <span>100 (Walk)</span>
                  <span>120 (Jog)</span>
                  <span>135 (Sweet Spot)</span>
                  <span>150 (Run)</span>
                  <span>180 (Sprint)</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTogglePlay}
                  className={`flex-1 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all ${
                    isRunning ? "bg-[#1a1d28] border border-[#262a3b] text-white" : "bg-[#10e57a] text-black shadow-lg"
                  }`}
                >
                  {isRunning ? "Pause Music" : "Start Live Music"}
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
