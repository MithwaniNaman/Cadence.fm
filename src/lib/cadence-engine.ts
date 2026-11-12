import { Track } from "./music-catalogue";

export type RhythmRelationship = "direct" | "half-time" | "double-time";

export interface CadenceMatchResult {
  track: Track;
  score: number; // 0 - 100
  relationship: RhythmRelationship;
  effectiveBpmDiff: number;
  cadenceSpm: number;
  trackBpm: number;
  explanation: string;
  isPhaseLocked: boolean; // within 2% delta
  rhythmDetail: string;
}

export interface MatchOptions {
  preferredGenres?: string[];
  preferredMoods?: string[];
  intensityWeight?: number; // 0 to 1
  workoutTargetIntensity?: number; // 1 to 10
}

/**
 * Cadence Engine: Core Musical-Biomechanical Tempo Matching Algorithm.
 * 
 * Musical rhythm in human locomotion maps to multiple harmonic divisions:
 * 1. Direct (1:1): Every single footstrike hits on the quarter note / beat (e.g. 170 SPM to 170 BPM).
 * 2. Half-time (2:1): Footstrikes alternate (left foot hits beat 1 & 3, right foot hits 2 & 4) (e.g. 170 SPM to 85 BPM).
 *    Crucial for genres like Hip-Hop, Metal breakdowns, and Trap, giving immense groove without frantic pacing.
 * 3. Double-time (1:2): Track beat subdivides stride (e.g., 90 SPM jog to 180 BPM drum-and-bass).
 */
export function calculateCadenceMatch(
  cadenceSpm: number,
  track: Track,
  options?: MatchOptions
): CadenceMatchResult {
  const bpm = track.bpm;
  
  // Harmonics
  const directDiff = Math.abs(cadenceSpm - bpm);
  const halfTimeDiff = Math.abs(cadenceSpm - bpm * 2);
  const doubleTimeDiff = Math.abs(cadenceSpm - bpm / 2);

  // Identify optimal harmonic relationship
  let minDiff = directDiff;
  let relationship: RhythmRelationship = "direct";

  if (halfTimeDiff < minDiff) {
    minDiff = halfTimeDiff;
    relationship = "half-time";
  }
  if (doubleTimeDiff < minDiff) {
    minDiff = doubleTimeDiff;
    relationship = "double-time";
  }

  // Calculate base mathematical score based on percentage deviation from harmonic target
  const targetHarmonicBpm = relationship === "direct" ? bpm : (relationship === "half-time" ? bpm * 2 : bpm / 2);
  const percentDeviation = (minDiff / cadenceSpm) * 100;

  // Non-linear decay curve:
  // - 0% deviation: 100 score
  // - 1% deviation (e.g. 1.7 BPM): ~97 score
  // - 3% deviation (e.g. 5 BPM): ~88 score
  // - 6% deviation (e.g. 10 BPM): ~72 score
  // - >15% deviation: falls below 45
  let baseScore = Math.max(10, Math.round(100 - (percentDeviation * 4.2)));

  // Bonus/penalty for genre and mood alignment if specified
  let genreBonus = 0;
  if (options?.preferredGenres && options.preferredGenres.length > 0) {
    if (options.preferredGenres.includes(track.genre)) {
      genreBonus += 3;
    }
  }

  let moodBonus = 0;
  if (options?.workoutTargetIntensity !== undefined) {
    const energyDelta = Math.abs(track.energyLevel - options.workoutTargetIntensity);
    if (energyDelta <= 1) moodBonus += 2;
    else if (energyDelta >= 4) moodBonus -= 4;
  }

  const finalScore = Math.min(100, Math.max(15, baseScore + genreBonus + moodBonus));
  const isPhaseLocked = minDiff <= 2;

  // Generate intelligent explanation
  let explanation = "";
  let rhythmDetail = "";

  if (relationship === "direct") {
    if (minDiff === 0) {
      explanation = `Your running cadence is ${cadenceSpm} SPM. This track has an identical tempo of ${bpm} BPM for a 1:1 stride lock.`;
      rhythmDetail = "Exact 1:1 Stride Lock";
    } else if (minDiff <= 2) {
      explanation = `Your running cadence is ${cadenceSpm} SPM. At ${bpm} BPM, this track matches your stride frequency with just a ${minDiff} BPM delta.`;
      rhythmDetail = "Tight 1:1 Stride Match";
    } else {
      explanation = `Your running cadence is ${cadenceSpm} SPM. This track's ${bpm} BPM tempo sits within direct matching range (${minDiff} BPM difference).`;
      rhythmDetail = "Direct Tempo Range";
    }
  } else if (relationship === "half-time") {
    if (minDiff === 0) {
      explanation = `Your running cadence is ${cadenceSpm} SPM. This track has a tempo of ${bpm} BPM, creating a natural half-time rhythm match (2 steps per musical beat).`;
      rhythmDetail = "Natural Half-Time Groove (2:1)";
    } else if (minDiff <= 2) {
      explanation = `Your running cadence is ${cadenceSpm} SPM. At ${bpm} BPM (effective harmonic ${bpm * 2} SPM), it maintains a smooth half-time cadence pocket.`;
      rhythmDetail = "Harmonic Half-Time Match";
    } else {
      explanation = `Your running cadence is ${cadenceSpm} SPM. This track runs at ${bpm} BPM, giving a half-time feel with a minor ${minDiff / 2} BPM variation.`;
      rhythmDetail = "Half-Time Stride Approximation";
    }
  } else {
    explanation = `Your running cadence is ${cadenceSpm} SPM. This track tempo of ${bpm} BPM provides a double-time syncopation for rapid foot turnover.`;
    rhythmDetail = "Double-Time Turnover (1:2)";
  }

  return {
    track,
    score: finalScore,
    relationship,
    effectiveBpmDiff: minDiff,
    cadenceSpm,
    trackBpm: bpm,
    explanation,
    isPhaseLocked,
    rhythmDetail,
  };
}

/**
 * Rank tracks for a given cadence
 */
export function rankTracksForCadence(
  cadenceSpm: number,
  tracks: Track[],
  options?: MatchOptions
): CadenceMatchResult[] {
  return tracks
    .map((track) => calculateCadenceMatch(cadenceSpm, track, options))
    .sort((a, b) => b.score - a.score);
}

/**
 * Calculate realistic biomechanical running pace (min/km and seconds/km)
 * Standard recreational runner stride length varies between 0.9m and 1.35m depending on cadence.
 */
export function estimatePaceFromCadence(cadenceSpm: number): {
  paceFormatted: string;
  paceSecondsPerKm: number;
  speedKmh: number;
  strideMeters: number;
} {
  // Stride length scales with cadence: at 150 SPM ~ 0.98m; at 170 SPM ~ 1.15m; at 185 SPM ~ 1.28m
  const strideMeters = 0.55 + (cadenceSpm / 180) * 0.65;
  const metersPerMin = cadenceSpm * strideMeters;
  const speedKmh = (metersPerMin * 60) / 1000;
  
  // Pace in min/km
  const paceMinutesDecimal = 60 / speedKmh;
  const totalSeconds = Math.round(paceMinutesDecimal * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    paceFormatted: `${minutes}:${seconds.toString().padStart(2, "0")}`,
    paceSecondsPerKm: totalSeconds,
    speedKmh: parseFloat(speedKmh.toFixed(1)),
    strideMeters: parseFloat(strideMeters.toFixed(2)),
  };
}
