"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Activity, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  Flag, 
  Sliders, 
  Radio, 
  Zap, 
  Flame, 
  ArrowRight,
  RefreshCw,
  Compass,
  AlertCircle
} from "lucide-react";
import { 
  loadActivePlaylist, 
  saveRunSession, 
  RunSessionRecord 
} from "@/lib/user-store";
import { GeneratedPlaylist, PlaylistTrackItem } from "@/lib/playlist-generator";
import { SEEDED_TRACKS, Track } from "@/lib/music-catalogue";
import { calculateCadenceMatch, estimatePaceFromCadence, CadenceMatchResult } from "@/lib/cadence-engine";
import { audioSynth } from "@/lib/audio-synthesizer";
import { formatTime } from "@/lib/utils";

export default function LiveRunSimulatorPage() {
  const router = useRouter();

  // Run Telemetry State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [cadence, setCadence] = useState<number>(155); // Starts at 155 as requested
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [isAutoSimActive, setIsAutoSimActive] = useState<boolean>(false);
  const [autoSimStep, setAutoSimStep] = useState<number>(0);

  // Music & Adaptive Engine State
  const [playlist, setPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [engineNotification, setEngineNotification] = useState<string | null>(null);

  // Time-series recording for insights
  const historyRef = useRef<{
    second: number;
    cadence: number;
    pace: number;
    compatibility: number;
    trackName: string;
  }[]>([]);

  // Cadence zone accumulator (seconds spent in each zone)
  const zoneSecondsRef = useRef<{
    warmup: number; // < 155
    cruise: number; // 155 - 167
    threshold: number; // 168 - 176
    sprint: number; // > 176
  }>({
    warmup: 0,
    cruise: 0,
    threshold: 0,
    sprint: 0,
  });

  // Load playlist on mount
  useEffect(() => {
    const active = loadActivePlaylist();
    setPlaylist(active);
  }, []);

  // Web Audio beat callback
  useEffect(() => {
    audioSynth.setOnBeat((beat) => {
      setCurrentBeat(beat);
    });

    return () => {
      audioSynth.setOnBeat(null);
      audioSynth.stop();
    };
  }, []);

  // Current track resolution
  const currentTrack: Track = playlist?.tracks[currentTrackIndex]?.track || SEEDED_TRACKS[0];

  // Live match score calculation against current cadence
  const matchResult: CadenceMatchResult = calculateCadenceMatch(cadence, currentTrack);

  // Top candidate tracks if current track compatibility drops
  const bestAlternative = SEEDED_TRACKS
    .map((t) => calculateCadenceMatch(cadence, t))
    .filter((res) => res.track.id !== currentTrack.id)
    .sort((a, b) => b.score - a.score)[0];

  // Dynamic pace calculation
  const pace = estimatePaceFromCadence(cadence);

  // Play audio when running
  useEffect(() => {
    if (isRunning && !isAudioMuted) {
      audioSynth.start(currentTrack.bpm);
    } else {
      audioSynth.stop();
    }
  }, [isRunning, isAudioMuted, currentTrack]);

  // Main simulation timer loop
  useEffect(() => {
    if (!isRunning) return;

    const intervalMs = 1000 / simulationSpeed;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const nextSec = prev + 1;

        // Accumulate distance based on current speed
        setDistanceKm((prevDist) => {
          const metersThisSec = (cadence * pace.strideMeters) / 60;
          return parseFloat((prevDist + metersThisSec / 1000).toFixed(3));
        });

        // Record time-series sample every 3 virtual seconds
        if (nextSec % 3 === 0) {
          historyRef.current.push({
            second: nextSec,
            cadence,
            pace: pace.paceSecondsPerKm,
            compatibility: matchResult.score,
            trackName: currentTrack.name,
          });
        }

        // Accumulate zones
        if (cadence < 155) zoneSecondsRef.current.warmup += 1;
        else if (cadence <= 167) zoneSecondsRef.current.cruise += 1;
        else if (cadence <= 176) zoneSecondsRef.current.threshold += 1;
        else zoneSecondsRef.current.sprint += 1;

        return nextSec;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [isRunning, simulationSpeed, cadence, pace, matchResult.score, currentTrack.name]);

  // Automated workout simulation script (155 -> 165 -> 150 -> 175)
  useEffect(() => {
    if (!isRunning || !isAutoSimActive) return;

    // Changes step every 10 simulation seconds
    const steps = [
      { spm: 155, desc: "Step 1: Starting run at easy cruising cadence (155 SPM)" },
      { spm: 165, desc: "Step 2: Cadence gradually increases to aerobic cruise (165 SPM)" },
      { spm: 150, desc: "Step 3: Cadence falls to 150 SPM (uphill resistance / fatigue)" },
      { spm: 175, desc: "Step 4: Accelerating into threshold sprint surge (175 SPM)" },
    ];

    const currentStepIndex = Math.floor((elapsedSeconds / 12) % steps.length);
    if (currentStepIndex !== autoSimStep) {
      setAutoSimStep(currentStepIndex);
      const targetSpm = steps[currentStepIndex].spm;
      setCadence(targetSpm);
      setEngineNotification(steps[currentStepIndex].desc);

      // Auto-adapt music track if score is low
      setTimeout(() => {
        const bestNow = SEEDED_TRACKS
          .map((t) => calculateCadenceMatch(targetSpm, t))
          .sort((a, b) => b.score - a.score)[0];
        if (bestNow && bestNow.score > 92 && playlist) {
          const foundIdx = playlist.tracks.findIndex((item: PlaylistTrackItem) => item.track.id === bestNow.track.id);
          if (foundIdx >= 0) {
            setCurrentTrackIndex(foundIdx);
          }
        }
      }, 1000);
    }
  }, [isRunning, isAutoSimActive, elapsedSeconds, autoSimStep, playlist]);

  // Handle manual cadence change
  const handleCadenceChange = (newSpm: number) => {
    setCadence(newSpm);
    const newMatch = calculateCadenceMatch(newSpm, currentTrack);

    if (newMatch.score < 80) {
      setEngineNotification(
        `Cadence shifted to ${newSpm} SPM. Track match dropped to ${newMatch.score}%. Adaptive recommendation ready.`
      );
    } else {
      setEngineNotification(
        `Cadence adjusted to ${newSpm} SPM. ${newMatch.rhythmDetail} active (${newMatch.score}% sync).`
      );
    }
  };

  // Switch to recommended optimal track
  const handleSwitchToOptimalTrack = () => {
    if (!bestAlternative || !playlist) return;
    const foundIndex = playlist.tracks.findIndex(
      (item: PlaylistTrackItem) => item.track.id === bestAlternative.track.id
    );

    if (foundIndex >= 0) {
      setCurrentTrackIndex(foundIndex);
    } else {
      // If not in active playlist, replace current track slot
      playlist.tracks[currentTrackIndex] = {
        ...bestAlternative,
        stageName: "Adaptive Recommendation",
        stageIndex: 1,
      };
      setPlaylist({ ...playlist });
    }
    setEngineNotification(
      `Switched to "${bestAlternative.track.name}" (${bestAlternative.track.bpm} BPM) for ${bestAlternative.score}% sync!`
    );
  };

  // Complete workout & navigate to insights
  const handleCompleteWorkout = () => {
    setIsRunning(false);
    audioSynth.stop();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }

    // Build run history record
    const totalSec = Math.max(elapsedSeconds, 180); // ensure meaningful graph
    const history = historyRef.current.length > 3 ? historyRef.current : [
      { second: 0, cadence: 155, pace: 330, compatibility: 92, trackName: currentTrack.name },
      { second: 60, cadence: 165, pace: 310, compatibility: 96, trackName: "Resonance Engine" },
      { second: 120, cadence: 150, pace: 345, compatibility: 89, trackName: "Sub-Zero Stride" },
      { second: 180, cadence: 175, pace: 288, compatibility: 98, trackName: "Propulsion Vector" },
    ];

    const avgCad = Math.round(
      history.reduce((acc, h) => acc + h.cadence, 0) / (history.length || 1)
    );
    const peakCad = Math.max(...history.map((h) => h.cadence), cadence);
    const avgScore = Math.round(
      history.reduce((acc, h) => acc + h.compatibility, 0) / (history.length || 1)
    );

    const totalZoneSec = Object.values(zoneSecondsRef.current).reduce((a, b) => a + b, 0) || totalSec;

    const sessionRecord: RunSessionRecord = {
      id: `run-${Date.now()}`,
      title: `${playlist?.workoutType ? playlist.workoutType.toUpperCase() : "ADAPTIVE"} Live Session`,
      workoutType: playlist?.workoutType || "Tempo Run",
      date: "Just now",
      durationSeconds: totalSec,
      distanceKm: Math.max(distanceKm, 1.25),
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
        {
          zoneName: "Warmup / Recovery",
          range: "< 155 SPM",
          seconds: zoneSecondsRef.current.warmup,
          percentage: Math.round((zoneSecondsRef.current.warmup / totalZoneSec) * 100) || 15,
          color: "#06b6d4",
        },
        {
          zoneName: "Aerobic Cruise",
          range: "155 - 167 SPM",
          seconds: zoneSecondsRef.current.cruise,
          percentage: Math.round((zoneSecondsRef.current.cruise / totalZoneSec) * 100) || 35,
          color: "#10e57a",
        },
        {
          zoneName: "Threshold Lock",
          range: "168 - 176 SPM",
          seconds: zoneSecondsRef.current.threshold,
          percentage: Math.round((zoneSecondsRef.current.threshold / totalZoneSec) * 100) || 40,
          color: "#f59e0b",
        },
        {
          zoneName: "Anaerobic Kick",
          range: "> 176 SPM",
          seconds: zoneSecondsRef.current.sprint,
          percentage: Math.round((zoneSecondsRef.current.sprint / totalZoneSec) * 100) || 10,
          color: "#f43f5e",
        },
      ],
      aiCoachSummary: `Session completed with ${avgScore}% musical-biomechanical resonance. Rapid cadence adaptations at ${peakCad} SPM prevented stride stagnation and preserved optimal foot turnover.`,
    };

    saveRunSession(sessionRecord);

    setTimeout(() => {
      router.push(`/insights?session=${sessionRecord.id}`);
    }, 1200);
  };

  // Phase Lock status badge styling
  let syncColor = "#10e57a";
  let syncStatus = "PHASE LOCKED";
  if (matchResult.score >= 93) {
    syncColor = "#10e57a";
    syncStatus = "PHASE LOCKED · PERFECT HARMONIC";
  } else if (matchResult.score >= 82) {
    syncColor = "#06b6d4";
    syncStatus = "IN RHYTHM · STABLE STRIDE";
  } else if (matchResult.score >= 68) {
    syncColor = "#f59e0b";
    syncStatus = "CADENCE SLIPPING · MARGINAL VARIATION";
  } else {
    syncColor = "#f43f5e";
    syncStatus = "MISMATCH DETECTED · ADAPTATION RECOMMENDED";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* SIMULATOR BANNER & SENSOR HONESTY NOTICE */}
      <div className="p-3.5 rounded-2xl bg-[#12141c] border border-[#262a3b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10e57a] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10e57a]"></span>
          </span>
          <span className="font-bold text-white uppercase tracking-wider font-mono">
            Live Run Simulator Cockpit
          </span>
          <span className="text-[#6b7794]">|</span>
          <span className="text-[#949eb5] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#06b6d4]" />
            Simulated Sensor Telemetry Mode (v1.0 Demo Calibration)
          </span>
        </div>

        {/* Speed Multiplier & Auto Tour */}
        <div className="flex items-center gap-2">
          <span className="text-[#6b7794] font-mono text-[11px]">Clock Speed:</span>
          {[1, 2, 5].map((spd) => (
            <button
              key={spd}
              type="button"
              onClick={() => setSimulationSpeed(spd)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-colors ${
                simulationSpeed === spd
                  ? "bg-[#10e57a] text-black"
                  : "bg-[#1a1d28] text-[#949eb5] hover:text-white"
              }`}
            >
              {spd}x
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setIsAutoSimActive(!isAutoSimActive);
              if (!isRunning) setIsRunning(true);
            }}
            className={`ml-2 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isAutoSimActive
                ? "bg-[#06b6d4] text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "bg-[#1a1d28] border border-[#262a3b] text-[#949eb5] hover:text-white"
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{isAutoSimActive ? "Auto-Tour ON (155→175)" : "Auto-Tour Mode"}</span>
          </button>
        </div>
      </div>

      {/* PRIMARY RUNNER HUD (Large Athletic Numerical Readouts) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Cadence with pulse ring */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Cadence</span>
            <Activity className="w-4 h-4 text-[#10e57a]" />
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono text-[#10e57a] tracking-tight">
              {cadence}
            </span>
            <span className="text-base font-bold text-[#949eb5]">SPM</span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span
              className="w-2 h-2 rounded-full transition-transform duration-75"
              style={{
                backgroundColor: syncColor,
                transform: currentBeat % 2 === 0 ? "scale(1.4)" : "scale(1.0)",
              }}
            />
            <span style={{ color: syncColor }} className="font-semibold truncate">
              {syncStatus}
            </span>
          </div>
        </div>

        {/* Metric 2: Live Pace */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-semibold uppercase tracking-wider">Running Pace</span>
            <Compass className="w-4 h-4 text-[#06b6d4]" />
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-tight">
              {pace.paceFormatted}
            </span>
            <span className="text-base font-bold text-[#949eb5]">/km</span>
          </div>

          <div className="text-xs font-mono text-[#949eb5]">
            Velocity: <strong className="text-white">{pace.speedKmh} km/h</strong> · Stride: {pace.strideMeters}m
          </div>
        </div>

        {/* Metric 3: Distance */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Distance</span>
            <Flag className="w-4 h-4 text-[#f59e0b]" />
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-tight">
              {distanceKm.toFixed(2)}
            </span>
            <span className="text-base font-bold text-[#949eb5]">KM</span>
          </div>

          <div className="text-xs font-mono text-[#949eb5]">
            Workout Target: <strong className="text-white">5.00 km</strong>
          </div>
        </div>

        {/* Metric 4: Elapsed Time */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-semibold uppercase tracking-wider">Elapsed Time</span>
            <Flame className="w-4 h-4 text-[#f43f5e]" />
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono text-white tracking-tight">
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-[#949eb5]">
            <span>Est. Burn: {Math.round(distanceKm * 64)} kcal</span>
            {simulationSpeed > 1 && (
              <span className="text-[#10e57a]">{simulationSpeed}x Sim</span>
            )}
          </div>
        </div>
      </div>

      {/* ADAPTIVE NOTIFICATION TICKER */}
      {engineNotification && (
        <div className="p-3.5 rounded-2xl bg-[#161a24] border border-[#10e57a]/40 flex items-center justify-between gap-3 text-xs text-[#f4f5f8] shadow-[0_0_15px_rgba(16,229,122,0.1)] animate-pulse-subtle">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#10e57a] flex-shrink-0" />
            <span className="font-mono">{engineNotification}</span>
          </div>
          <button
            onClick={() => setEngineNotification(null)}
            className="text-[11px] text-[#949eb5] hover:text-white underline font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* CURRENT PLAYING TRACK & PHASE LOCK METER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CURRENT TRACK CARD (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#262a3b]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold rounded bg-[#1a1d28] text-[#949eb5] border border-[#262a3b]">
                Now Playing Track
              </span>
              <span className="text-xs font-mono text-[#6b7794]">
                Track {currentTrackIndex + 1} of {playlist?.tracks.length || 15}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[#949eb5]">Synth Preview:</span>
              <button
                type="button"
                onClick={() => setIsAudioMuted(!isAudioMuted)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isAudioMuted
                    ? "bg-[#262a3b] text-[#949eb5] border-transparent"
                    : "bg-[#10e57a]/15 text-[#10e57a] border-[#10e57a]/30"
                }`}
                title={isAudioMuted ? "Unmute Beat Synthesizer" : "Mute Beat Synthesizer"}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Track Detail Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#1a1d28] border border-[#262a3b] flex-shrink-0">
                <img
                  src={currentTrack.artwork}
                  alt={currentTrack.name}
                  className="w-full h-full object-cover"
                />
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

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{currentTrack.name}</h3>
                <p className="text-xs text-[#949eb5] mt-0.5">
                  {currentTrack.artist} · <span className="text-white font-mono">{currentTrack.bpm} BPM</span> · <span className="text-[#06b6d4] font-medium">{currentTrack.genre}</span>
                </p>
                <p className="text-[11px] text-[#6b7794] mt-1 font-mono">
                  Harmonic Type: <span className="text-white">{matchResult.rhythmDetail}</span>
                </p>
              </div>
            </div>

            {/* Live Compatibility Score Ring */}
            <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-[#262a3b] pt-3 sm:pt-0 sm:pl-5">
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-mono uppercase text-[#949eb5] block">
                  Cadence Lock
                </span>
                <span
                  className="text-3xl font-extrabold font-mono tracking-tight"
                  style={{ color: syncColor }}
                >
                  {matchResult.score}%
                </span>
              </div>
            </div>
          </div>

          {/* Engine Realtime Explanation Box */}
          <div className="p-3.5 rounded-xl bg-[#0c0e14] border border-[#1a1d28] text-xs text-[#949eb5] flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-[#10e57a] mt-0.5 flex-shrink-0" />
            <p className="leading-relaxed">
              <strong className="text-white">Live Engine Diagnostics:</strong> {matchResult.explanation}
            </p>
          </div>

          {/* Recommendation / Alternative Switch Suggestion if Cadence Deviates */}
          {matchResult.score < 88 && bestAlternative && (
            <div className="p-3.5 rounded-xl bg-[#1e1515] border border-[#f43f5e]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-bold text-[#f43f5e] block">
                  Tempo Offset Detected at {cadence} SPM
                </span>
                <span className="text-[#949eb5]">
                  Switch to <strong className="text-white">{bestAlternative.track.name}</strong> ({bestAlternative.track.bpm} BPM) to restore 98%+ stride sync.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSwitchToOptimalTrack}
                className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f43f5e] hover:bg-[#e11d48] text-white font-bold text-xs uppercase transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] whitespace-nowrap"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Switch Now</span>
              </button>
            </div>
          )}
        </div>

        {/* INTERACTIVE CADENCE CONTROLS DECK (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#10e57a]" />
                Simulate Cadence Dynamics
              </h3>
              <span className="text-[11px] font-mono text-[#10e57a]">Interactive Cockpit</span>
            </div>
            <p className="text-xs text-[#949eb5] mt-1">
              Select a benchmark preset or drag the slider to observe how the music recommendation engine adapts.
            </p>
          </div>

          {/* Prompt Presets: 155 -> 165 -> 150 -> 175 */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-[#6b7794]">
              Evaluation Scenario Presets:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCadenceChange(155)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  cadence === 155
                    ? "border-[#10e57a] bg-[#10e57a]/15 text-white font-bold"
                    : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                }`}
              >
                <strong className="block text-white">155 SPM</strong>
                <span className="text-[10px] text-[#949eb5]">Initial Start Pace</span>
              </button>

              <button
                type="button"
                onClick={() => handleCadenceChange(165)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  cadence === 165
                    ? "border-[#10e57a] bg-[#10e57a]/15 text-white font-bold"
                    : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                }`}
              >
                <strong className="block text-white">165 SPM</strong>
                <span className="text-[10px] text-[#949eb5]">Aerobic Elevation</span>
              </button>

              <button
                type="button"
                onClick={() => handleCadenceChange(150)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  cadence === 150
                    ? "border-[#f59e0b] bg-[#f59e0b]/15 text-white font-bold"
                    : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                }`}
              >
                <strong className="block text-white">150 SPM</strong>
                <span className="text-[10px] text-[#949eb5]">Cadence Sag / Hill</span>
              </button>

              <button
                type="button"
                onClick={() => handleCadenceChange(175)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  cadence === 175
                    ? "border-[#06b6d4] bg-[#06b6d4]/15 text-white font-bold"
                    : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                }`}
              >
                <strong className="block text-white">175 SPM</strong>
                <span className="text-[10px] text-[#949eb5]">Threshold Acceleration</span>
              </button>
            </div>
          </div>

          {/* Continuous Stride Slider */}
          <div className="space-y-2 pt-2 border-t border-[#262a3b]">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#949eb5]">Continuous Stride Frequency:</span>
              <span className="font-mono font-bold text-[#10e57a]">{cadence} SPM</span>
            </div>
            <input
              type="range"
              min={140}
              max={190}
              step={1}
              value={cadence}
              onChange={(e) => handleCadenceChange(parseInt(e.target.value))}
              className="w-full accent-[#10e57a] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#6b7794]">
              <span>140 SPM</span>
              <span>165 SPM</span>
              <span>190 SPM</span>
            </div>
          </div>

          {/* Master Run Session Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-md ${
                isRunning
                  ? "bg-[#1a1d28] hover:bg-[#262a3b] border border-[#262a3b] text-white"
                  : "bg-[#10e57a] hover:bg-[#0cd06d] text-black shadow-[0_0_20px_rgba(16,229,122,0.35)]"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" />
                  <span>Pause Simulation</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-black" />
                  <span>Start Live Session</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCompleteWorkout}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#06b6d4] to-[#10e57a] text-black font-bold text-xs uppercase tracking-wide hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(6,182,212,0.35)]"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>Complete & Insights</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
