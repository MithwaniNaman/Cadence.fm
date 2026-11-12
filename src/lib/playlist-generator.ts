import { SEEDED_TRACKS, Track } from "./music-catalogue";
import { calculateCadenceMatch, CadenceMatchResult } from "./cadence-engine";

export type WorkoutType = "easy" | "tempo" | "intervals" | "long-run" | "race-day";

export interface WorkoutStageConfig {
  name: string;
  description: string;
  targetBpmMin: number;
  targetBpmMax: number;
  energyMin: number;
  energyMax: number;
  trackCount: number;
}

export interface WorkoutPreset {
  id: WorkoutType;
  title: string;
  tagline: string;
  defaultCadence: number;
  stages: WorkoutStageConfig[];
  targetDurationMinutes: number;
  color: string;
  badge: string;
  focusBio: string;
}

export const WORKOUT_PRESETS: Record<WorkoutType, WorkoutPreset> = {
  "easy": {
    id: "easy",
    title: "Easy Recovery Run",
    tagline: "Low cardiac strain, steady conversational aerobic cadence",
    defaultCadence: 154,
    targetDurationMinutes: 45,
    color: "#06b6d4",
    badge: "Zone 2 Base",
    focusBio: "Promotes mitochondrial density without biomechanical fatigue.",
    stages: [
      { name: "Gentle Mobilization", description: "Easy stride warmup to open hip flexors", targetBpmMin: 140, targetBpmMax: 152, energyMin: 4, energyMax: 6, trackCount: 3 },
      { name: "Aerobic Cruise", description: "Locked relaxed conversational pace", targetBpmMin: 150, targetBpmMax: 160, energyMin: 5, energyMax: 7, trackCount: 9 },
      { name: "Gentle Recovery", description: "Gradual step-down to lower heart rate", targetBpmMin: 110, targetBpmMax: 140, energyMin: 3, energyMax: 5, trackCount: 3 },
    ],
  },
  "tempo": {
    id: "tempo",
    title: "Lactate Threshold Tempo",
    tagline: "Comfortably hard sustained pace at aerobic threshold",
    defaultCadence: 168,
    targetDurationMinutes: 50,
    color: "#f59e0b",
    badge: "Threshold",
    focusBio: "Elevates lactate clearance threshold and trains mental stamina.",
    stages: [
      { name: "Progressive Warmup", description: "Gradual elevation of heart rate and cadence", targetBpmMin: 148, targetBpmMax: 162, energyMin: 6, energyMax: 7, trackCount: 3 },
      { name: "Threshold Crucible", description: "Sustained lock-in at steady tempo cadence", targetBpmMin: 166, targetBpmMax: 174, energyMin: 8, energyMax: 10, trackCount: 9 },
      { name: "Flushing Cooldown", description: "Active lactic acid clearance", targetBpmMin: 110, targetBpmMax: 145, energyMin: 3, energyMax: 5, trackCount: 3 },
    ],
  },
  "intervals": {
    id: "intervals",
    title: "High-Cadence Intervals",
    tagline: "Repeated surges targeting VO2 max and rapid foot turnover",
    defaultCadence: 178,
    targetDurationMinutes: 40,
    color: "#f43f5e",
    badge: "VO2 Max",
    focusBio: "Develops neuromuscular turnover and maximum aerobic power.",
    stages: [
      { name: "Activation Drills", description: "Dynamic mobility and cadence strides", targetBpmMin: 150, targetBpmMax: 165, energyMin: 6, energyMax: 7, trackCount: 3 },
      { name: "Surge Cycle 1", description: "Maximum neuromuscular turnover (180+ SPM)", targetBpmMin: 175, targetBpmMax: 190, energyMin: 9, energyMax: 10, trackCount: 3 },
      { name: "Active Float", description: "Control recovery jog without stopping", targetBpmMin: 135, targetBpmMax: 155, energyMin: 5, energyMax: 6, trackCount: 2 },
      { name: "Surge Cycle 2", description: "Second sprint surge block", targetBpmMin: 175, targetBpmMax: 190, energyMin: 9, energyMax: 10, trackCount: 4 },
      { name: "Downshift Flush", description: "Gradual deceleration", targetBpmMin: 100, targetBpmMax: 135, energyMin: 3, energyMax: 5, trackCount: 3 },
    ],
  },
  "long-run": {
    id: "long-run",
    title: "Long Endurance Run",
    tagline: "Progressive rhythm architecture from warm-up to final push",
    defaultCadence: 165,
    targetDurationMinutes: 75,
    color: "#10e57a",
    badge: "Endurance",
    focusBio: "Simulates marathon glycogen depletion and progressive cadence fatigue.",
    stages: [
      { name: "Warm-Up", description: "Easy initial rhythm to settle into posture", targetBpmMin: 100, targetBpmMax: 130, energyMin: 4, energyMax: 6, trackCount: 3 },
      { name: "Settling In", description: "Locking into steady aerobic stride rhythm", targetBpmMin: 130, targetBpmMax: 155, energyMin: 6, energyMax: 7, trackCount: 4 },
      { name: "Sustained Effort", description: "Cruising zone: maintaining turnover through fatigue", targetBpmMin: 155, targetBpmMax: 170, energyMin: 7, energyMax: 9, trackCount: 5 },
      { name: "Final Push", description: "High-tempo crescendo over the last 3-4 km", targetBpmMin: 170, targetBpmMax: 185, energyMin: 9, energyMax: 10, trackCount: 3 },
      { name: "Cooldown", description: "Post-effort deceleration and stride restoration", targetBpmMin: 90, targetBpmMax: 120, energyMin: 3, energyMax: 5, trackCount: 2 },
    ],
  },
  "race-day": {
    id: "race-day",
    title: "Race Day Performance",
    tagline: "Locked at goal race pace with an explosive final kilometre",
    defaultCadence: 174,
    targetDurationMinutes: 60,
    color: "#8b5cf6",
    badge: "PR Effort",
    focusBio: "Calibrated for personal best attempts with adrenaline modulation.",
    stages: [
      { name: "Corral Focus", description: "Pre-gun adrenaline focus and cadence calibration", targetBpmMin: 150, targetBpmMax: 165, energyMin: 7, energyMax: 8, trackCount: 2 },
      { name: "Even-Split Lock", description: "Disciplined execution at target race pace", targetBpmMin: 170, targetBpmMax: 178, energyMin: 8, energyMax: 9, trackCount: 10 },
      { name: "Negative Split Kick", description: "Full sprint to the finish line gantry", targetBpmMin: 178, targetBpmMax: 190, energyMin: 10, energyMax: 10, trackCount: 3 },
      { name: "Medal Lap", description: "Euphoric cooldown after crossing the line", targetBpmMin: 100, targetBpmMax: 130, energyMin: 4, energyMax: 6, trackCount: 2 },
    ],
  },
};

export interface PlaylistTrackItem extends CadenceMatchResult {
  stageName: string;
  stageIndex: number;
}

export interface GeneratedPlaylist {
  id: string;
  title: string;
  workoutType: WorkoutType;
  targetCadence: number;
  totalDurationFormatted: string;
  totalSeconds: number;
  trackCount: number;
  avgCompatibilityScore: number;
  genres: string[];
  stages: {
    name: string;
    description: string;
    targetCadenceRange: string;
    trackCount: number;
  }[];
  tracks: PlaylistTrackItem[];
  createdAt: string;
}

export interface GeneratePlaylistParams {
  workoutType: WorkoutType;
  targetCadence: number;
  selectedGenres?: string[];
  trackCountTarget?: number; // default 15 - 18
  customTempoBands?: { stageIndex: number; bpmMin: number; bpmMax: number }[];
}

export function generateSmartPlaylist(params: GeneratePlaylistParams): GeneratedPlaylist {
  const preset = WORKOUT_PRESETS[params.workoutType] || WORKOUT_PRESETS["long-run"];
  const targetCadence = params.targetCadence || preset.defaultCadence;
  const genres = params.selectedGenres && params.selectedGenres.length > 0 ? params.selectedGenres : [];

  const selectedTracks: PlaylistTrackItem[] = [];
  const usedTrackIds = new Set<string>();

  // Filter pool by genre if specified, else use full seeded catalogue
  let pool = SEEDED_TRACKS;
  if (genres.length > 0) {
    const genreFiltered = SEEDED_TRACKS.filter((t) => genres.includes(t.genre));
    if (genreFiltered.length >= 8) {
      pool = genreFiltered;
    }
  }

  preset.stages.forEach((stage, stageIndex) => {
    // Stage custom tempo band override if supplied
    const customBand = params.customTempoBands?.find((b) => b.stageIndex === stageIndex);
    const minBpm = customBand ? customBand.bpmMin : stage.targetBpmMin;
    const maxBpm = customBand ? customBand.bpmMax : stage.targetBpmMax;

    // Filter available candidates for this stage
    const candidates = pool.filter((t) => !usedTrackIds.has(t.id));
    
    // Score all candidates against stage midpoint and overall runner cadence
    const stageMidBpm = (minBpm + maxBpm) / 2;
    const scoredCandidates = candidates.map((track) => {
      // Calculate match relative to runner target cadence
      const cadenceMatch = calculateCadenceMatch(targetCadence, track, {
        preferredGenres: genres,
        workoutTargetIntensity: Math.round((stage.energyMin + stage.energyMax) / 2),
      });

      // Stage BPM proximity bonus
      const effectiveTrackBpm = track.bpm < 110 ? track.bpm * 2 : track.bpm;
      const bpmFit = Math.abs(effectiveTrackBpm - stageMidBpm);
      const stageScore = cadenceMatch.score - bpmFit * 0.5;

      return {
        ...cadenceMatch,
        stageScore,
        stageName: stage.name,
        stageIndex,
      };
    });

    // Sort by stageScore descending
    scoredCandidates.sort((a, b) => b.stageScore - a.stageScore);

    // Take required number of tracks for stage
    const countNeeded = stage.trackCount;
    const picked = scoredCandidates.slice(0, countNeeded);

    picked.forEach((p) => {
      usedTrackIds.add(p.track.id);
      selectedTracks.push(p);
    });
  });

  // If pool was tight and we need more tracks to hit at least 15, backfill top remaining tracks
  if (selectedTracks.length < 15) {
    const remaining = pool.filter((t) => !usedTrackIds.has(t.id));
    const extraScored = remaining.map((t) => ({
      ...calculateCadenceMatch(targetCadence, t, { preferredGenres: genres }),
      stageName: "Cruise Progression",
      stageIndex: 1,
    }));
    extraScored.sort((a, b) => b.score - a.score);
    const needed = 15 - selectedTracks.length;
    extraScored.slice(0, needed).forEach((p) => {
      usedTrackIds.add(p.track.id);
      selectedTracks.push(p);
    });
  }

  // Calculate aggregate stats
  const totalSeconds = selectedTracks.reduce((acc, t) => acc + t.track.durationSec, 0);
  const avgScore = Math.round(
    selectedTracks.reduce((acc, t) => acc + t.score, 0) / (selectedTracks.length || 1)
  );
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const totalDurationFormatted = `${mins}m ${secs}s`;

  return {
    id: `playlist-${params.workoutType}-${targetCadence}`,
    title: `${preset.title} · ${targetCadence} SPM`,
    workoutType: params.workoutType,
    targetCadence,
    totalDurationFormatted,
    totalSeconds,
    trackCount: selectedTracks.length,
    avgCompatibilityScore: avgScore,
    genres: genres.length > 0 ? genres : ["Mixed Catalogue"],
    stages: preset.stages.map((st) => ({
      name: st.name,
      description: st.description,
      targetCadenceRange: `${st.targetBpmMin} - ${st.targetBpmMax} BPM`,
      trackCount: st.trackCount,
    })),
    tracks: selectedTracks,
    createdAt: "2026-03-29T10:00:00.000Z",
  };
}
