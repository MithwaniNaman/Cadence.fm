import { GeneratedPlaylist, generateSmartPlaylist } from "./playlist-generator";

export interface UserProfile {
  name: string;
  experience: "Beginner" | "Intermediate" | "Advanced";
  preferredDistance: "5K" | "10K" | "Half Marathon" | "Marathon" | "Ultra";
  preferredGenres: ("Alternative Rock" | "Grunge" | "Metal" | "Electronic" | "Indie" | "Hip-Hop")[];
  typicalCadence: number; // e.g. 168
  preferredIntensity: "Moderate" | "Challenging" | "High Performance";
  hasCompletedOnboarding: boolean;
}

export interface RunSessionRecord {
  id: string;
  title: string;
  workoutType: string;
  date: string;
  durationSeconds: number;
  distanceKm: number;
  avgCadence: number;
  peakCadence: number;
  avgPace: string;
  avgCompatibilityScore: number;
  mostCompatibleTrack: {
    name: string;
    artist: string;
    bpm: number;
    score: number;
    relationship: string;
  };
  timeSeries: {
    second: number;
    cadence: number;
    pace: number; // sec/km
    compatibility: number; // 0-100
    trackName: string;
  }[];
  cadenceZones: {
    zoneName: string;
    range: string;
    seconds: number;
    percentage: number;
    color: string;
  }[];
  aiCoachSummary: string;
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  name: "Alex Chen",
  experience: "Intermediate",
  preferredDistance: "Half Marathon",
  preferredGenres: ["Electronic", "Alternative Rock", "Hip-Hop"],
  typicalCadence: 136,
  preferredIntensity: "Challenging",
  hasCompletedOnboarding: true,
};

export const SEEDED_RUN_SESSIONS: RunSessionRecord[] = [
  {
    id: "run-demo-01",
    title: "Morning Progressive Tempo",
    workoutType: "Tempo Run",
    date: "Yesterday at 07:15 AM",
    durationSeconds: 1560, // 26 mins
    distanceKm: 5.24,
    avgCadence: 169,
    peakCadence: 181,
    avgPace: "4:57",
    avgCompatibilityScore: 94,
    mostCompatibleTrack: {
      name: "Resonance Engine",
      artist: "Aura Pulse",
      bpm: 170,
      score: 99,
      relationship: "Direct 1:1 Match",
    },
    cadenceZones: [
      { zoneName: "Warmup / Base", range: "< 155 SPM", seconds: 240, percentage: 15, color: "#06b6d4" },
      { zoneName: "Aerobic Cruise", range: "155 - 167 SPM", seconds: 380, percentage: 24, color: "#10e57a" },
      { zoneName: "Threshold Lock", range: "168 - 176 SPM", seconds: 780, percentage: 50, color: "#f59e0b" },
      { zoneName: "Anaerobic Kick", range: "> 176 SPM", seconds: 160, percentage: 11, color: "#f43f5e" },
    ],
    timeSeries: [
      { second: 0, cadence: 150, pace: 340, compatibility: 91, trackName: "Neon Horizon" },
      { second: 180, cadence: 156, pace: 325, compatibility: 93, trackName: "Broken Tides" },
      { second: 360, cadence: 164, pace: 310, compatibility: 96, trackName: "Glitch Cascade" },
      { second: 600, cadence: 169, pace: 298, compatibility: 98, trackName: "Midnight Sprint" },
      { second: 900, cadence: 171, pace: 292, compatibility: 99, trackName: "Resonance Engine" },
      { second: 1200, cadence: 170, pace: 294, compatibility: 97, trackName: "Metronome Grustle" },
      { second: 1400, cadence: 178, pace: 280, compatibility: 95, trackName: "Apex Predator" },
      { second: 1560, cadence: 152, pace: 335, compatibility: 90, trackName: "Cooling Towers" },
    ],
    aiCoachSummary:
      "Superb cadence discipline during the 13-minute threshold block. The shift into 'Resonance Engine' at 170 BPM stabilized your stride frequency within 0.8% of target, preventing the usual kilometre-4 cadence sag.",
  },
  {
    id: "run-demo-02",
    title: "Weekend Long Aerobic Builder",
    workoutType: "Long Run",
    date: "3 days ago",
    durationSeconds: 3240, // 54 mins
    distanceKm: 10.4,
    avgCadence: 164,
    peakCadence: 175,
    avgPace: "5:11",
    avgCompatibilityScore: 92,
    mostCompatibleTrack: {
      name: "Sub-Zero Stride",
      artist: "Overdrive Frequency",
      bpm: 86,
      score: 97,
      relationship: "Half-Time Groove",
    },
    cadenceZones: [
      { zoneName: "Warmup / Base", range: "< 155 SPM", seconds: 480, percentage: 15, color: "#06b6d4" },
      { zoneName: "Aerobic Cruise", range: "155 - 167 SPM", seconds: 2100, percentage: 65, color: "#10e57a" },
      { zoneName: "Threshold Lock", range: "168 - 176 SPM", seconds: 540, percentage: 17, color: "#f59e0b" },
      { zoneName: "Anaerobic Kick", range: "> 176 SPM", seconds: 120, percentage: 3, color: "#f43f5e" },
    ],
    timeSeries: [
      { second: 0, cadence: 148, pace: 350, compatibility: 88, trackName: "Low Earth Orbit" },
      { second: 600, cadence: 162, pace: 315, compatibility: 94, trackName: "Infinite Loop" },
      { second: 1500, cadence: 164, pace: 310, compatibility: 96, trackName: "Sub-Zero Stride" },
      { second: 2400, cadence: 166, pace: 308, compatibility: 95, trackName: "Sunlit Pavement" },
      { second: 3000, cadence: 172, pace: 295, compatibility: 93, trackName: "Propulsion Vector" },
      { second: 3240, cadence: 145, pace: 360, compatibility: 89, trackName: "Recovery Walk" },
    ],
    aiCoachSummary:
      "Clean aerobic progression. Half-time tracks in hip-hop and electronic genres provided deep rhythm anchoring while keeping heart rate in Zone 2 for over 35 uninterrupted minutes.",
  },
];

const STORAGE_KEYS = {
  PROFILE: "cadence_user_profile",
  SESSIONS: "cadence_run_sessions",
  ACTIVE_PLAYLIST: "cadence_active_playlist",
};

export function loadUserProfile(): UserProfile {
  if (typeof window === "undefined") return DEFAULT_USER_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_USER_PROFILE;
    return { ...DEFAULT_USER_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_USER_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // ignore
  }
}

export function loadRunSessions(): RunSessionRecord[] {
  if (typeof window === "undefined") return SEEDED_RUN_SESSIONS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return SEEDED_RUN_SESSIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEEDED_RUN_SESSIONS;
  } catch {
    return SEEDED_RUN_SESSIONS;
  }
}

export function saveRunSession(session: RunSessionRecord): void {
  if (typeof window === "undefined") return;
  try {
    const current = loadRunSessions();
    const updated = [session, ...current];
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function loadActivePlaylist(): GeneratedPlaylist {
  if (typeof window === "undefined") {
    return generateSmartPlaylist({ workoutType: "tempo", targetCadence: 168 });
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PLAYLIST);
    if (!raw) {
      const initial = generateSmartPlaylist({ workoutType: "tempo", targetCadence: 168 });
      saveActivePlaylist(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return generateSmartPlaylist({ workoutType: "tempo", targetCadence: 168 });
  }
}

export function saveActivePlaylist(playlist: GeneratedPlaylist): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PLAYLIST, JSON.stringify(playlist));
  } catch {
    // ignore
  }
}
