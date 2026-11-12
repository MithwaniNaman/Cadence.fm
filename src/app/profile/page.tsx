"use client";

import { useState } from "react";
import { 
  User, 
  Target, 
  Music, 
  Flame, 
  Save, 
  RotateCcw, 
  CheckCircle2 
} from "lucide-react";
import { 
  loadUserProfile, 
  saveUserProfile, 
  DEFAULT_USER_PROFILE, 
  UserProfile 
} from "@/lib/user-store";

const GENRE_OPTIONS: ("Alternative Rock" | "Grunge" | "Metal" | "Electronic" | "Indie" | "Hip-Hop")[] = [
  "Alternative Rock",
  "Grunge",
  "Metal",
  "Electronic",
  "Indie",
  "Hip-Hop",
];

const EXPERIENCE_OPTIONS: ("Beginner" | "Intermediate" | "Advanced")[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const DISTANCE_OPTIONS: ("5K" | "10K" | "Half Marathon" | "Marathon" | "Ultra")[] = [
  "5K",
  "10K",
  "Half Marathon",
  "Marathon",
  "Ultra",
];

const INTENSITY_OPTIONS: ("Moderate" | "Challenging" | "High Performance")[] = [
  "Moderate",
  "Challenging",
  "High Performance",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(() =>
    typeof window !== "undefined" ? loadUserProfile() : DEFAULT_USER_PROFILE
  );
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserProfile(profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setProfile(DEFAULT_USER_PROFILE);
    saveUserProfile(DEFAULT_USER_PROFILE);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const toggleGenre = (genre: (typeof GENRE_OPTIONS)[number]) => {
    const list = profile.preferredGenres;
    if (list.includes(genre)) {
      if (list.length > 1) {
        setProfile({ ...profile, preferredGenres: list.filter((g) => g !== genre) });
      }
    } else {
      setProfile({ ...profile, preferredGenres: [...list, genre] });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262a3b]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-[#10e57a]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#10e57a]">
              Athlete Configuration
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Profile & Biomechanical Preferences
          </h1>
          <p className="text-sm text-[#949eb5] mt-1">
            Manage your baseline stride targets, distance focus, and musical preferences.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#10e57a]/15 text-[#10e57a] border border-[#10e57a]/30 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences saved!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: ATHLETE IDENTITY */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-[#10e57a]" />
            Athlete Identity
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#949eb5] mb-2">
              Athlete Name
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full sm:w-80 px-4 py-2.5 rounded-xl bg-[#1a1d28] border border-[#262a3b] text-white text-sm focus:outline-none focus:border-[#10e57a]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#949eb5] mb-2">
              Running Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {EXPERIENCE_OPTIONS.map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => setProfile({ ...profile, experience: exp })}
                  className={`p-3 rounded-xl border text-xs font-medium transition-all ${
                    profile.experience === exp
                      ? "border-[#10e57a] bg-[#10e57a]/15 text-white font-bold"
                      : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#949eb5] mb-2">
              Target Running Distance
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DISTANCE_OPTIONS.map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => setProfile({ ...profile, preferredDistance: dist })}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all ${
                    profile.preferredDistance === dist
                      ? "border-[#10e57a] bg-[#10e57a]/15 text-[#10e57a] font-bold"
                      : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                  }`}
                >
                  {dist}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: BIOMECHANICAL CADENCE CALIBRATION */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-[#06b6d4]" />
              Cadence & Biomechanical Baseline
            </h3>
            <span className="text-xs font-mono font-bold text-[#10e57a]">
              {profile.typicalCadence} SPM
            </span>
          </div>

          <p className="text-xs text-[#949eb5]">
            This serves as your default stride baseline across playlist generation, harmonic interval tuning, and cadence lock calculations.
          </p>

          <input
            type="range"
            min={145}
            max={190}
            step={1}
            value={profile.typicalCadence}
            onChange={(e) => setProfile({ ...profile, typicalCadence: parseInt(e.target.value) })}
            className="w-full accent-[#10e57a] cursor-pointer"
          />

          <div className="flex justify-between text-[11px] font-mono text-[#6b7794]">
            <span>145 (Aerobic base)</span>
            <span>168 (Recreational benchmark)</span>
            <span>180 (Elite cadence)</span>
            <span>190 (Sprint turnover)</span>
          </div>
        </div>

        {/* SECTION 3: MUSIC SOUNDTRACK GENRES */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Music className="w-4 h-4 text-[#f59e0b]" />
            Preferred Music Genres
          </h3>
          <p className="text-xs text-[#949eb5]">
            Cadence.fm prioritizes tracks from your selected genres while strictly maintaining harmonic tempo lock.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GENRE_OPTIONS.map((genre) => {
              const isSelected = profile.preferredGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  onClick={() => toggleGenre(genre)}
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
                    isSelected
                      ? "border-[#10e57a] bg-[#10e57a]/15 text-white font-bold"
                      : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                  }`}
                >
                  <span>{genre}</span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#10e57a]" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: WORKOUT INTENSITY */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#f43f5e]" />
            Workout Intensity Preference
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {INTENSITY_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setProfile({ ...profile, preferredIntensity: opt })}
                className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                  profile.preferredIntensity === opt
                    ? "border-[#10e57a] bg-[#10e57a]/15 text-white font-bold"
                    : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between pt-4 border-t border-[#262a3b]">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-[#949eb5] hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Defaults</span>
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-bold text-xs uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(16,229,122,0.35)]"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
