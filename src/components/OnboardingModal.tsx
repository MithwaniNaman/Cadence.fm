"use client";

import { useState } from "react";
import { UserProfile, saveUserProfile } from "@/lib/user-store";
import { 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  Sliders
} from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (profile: UserProfile) => void;
}

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

export function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState<number>(1);
  const [experience, setExperience] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [distance, setDistance] = useState<"5K" | "10K" | "Half Marathon" | "Marathon" | "Ultra">("Half Marathon");
  const [selectedGenres, setSelectedGenres] = useState<("Alternative Rock" | "Grunge" | "Metal" | "Electronic" | "Indie" | "Hip-Hop")[]>([
    "Electronic",
    "Alternative Rock",
    "Hip-Hop",
  ]);
  const [cadence, setCadence] = useState<number>(168);
  const [intensity, setIntensity] = useState<"Moderate" | "Challenging" | "High Performance">("Challenging");

  if (!isOpen) return null;

  const toggleGenre = (genre: (typeof GENRE_OPTIONS)[number]) => {
    if (selectedGenres.includes(genre)) {
      if (selectedGenres.length > 1) {
        setSelectedGenres(selectedGenres.filter((g) => g !== genre));
      }
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleFinish = () => {
    const newProfile: UserProfile = {
      name: "Alex Chen",
      experience,
      preferredDistance: distance,
      preferredGenres: selectedGenres,
      typicalCadence: cadence,
      preferredIntensity: intensity,
      hasCompletedOnboarding: true,
    };
    saveUserProfile(newProfile);
    onComplete(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#12141c] border border-[#262a3b] shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Top Progress Bar */}
        <div className="h-1.5 w-full bg-[#1a1d28]">
          <div
            className="h-full bg-gradient-to-r from-[#10e57a] to-[#06b6d4] transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Close / Skip button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#949eb5] hover:text-white p-1 rounded-lg hover:bg-[#1a1d28] transition-colors"
          title="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* STEP 1: Running Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#10e57a]/15 text-[#10e57a] border border-[#10e57a]/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Step 1 of 3 · Athlete Baseline
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Calibrate your running profile
                </h2>
                <p className="text-sm text-[#949eb5] mt-1">
                  Cadence.fm personalizes music tempo and harmonic matching to your target distance and training volume.
                </p>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#949eb5] mb-2.5">
                  Running Experience
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {EXPERIENCE_OPTIONS.map((exp) => (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setExperience(exp)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all text-center ${
                        experience === exp
                          ? "border-[#10e57a] bg-[#10e57a]/10 text-white font-semibold"
                          : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:border-[#383e56] hover:text-white"
                      }`}
                    >
                      {exp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Distance */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#949eb5] mb-2.5">
                  Primary Race / Target Distance
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {DISTANCE_OPTIONS.map((dist) => (
                    <button
                      key={dist}
                      type="button"
                      onClick={() => setDistance(dist)}
                      className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all text-center ${
                        distance === dist
                          ? "border-[#10e57a] bg-[#10e57a]/10 text-[#10e57a] font-bold"
                          : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white hover:border-[#383e56]"
                      }`}
                    >
                      {dist}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#262a3b]">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs font-medium text-[#949eb5] hover:text-white underline underline-offset-4"
                >
                  Skip and explore demo
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-semibold text-sm transition-all"
                >
                  <span>Next: Cadence Dial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Biomechanical Cadence Target */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/20 mb-2">
                  <Sliders className="w-3.5 h-3.5" />
                  Step 2 of 3 · Biomechanics
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Set your typical stride cadence
                </h2>
                <p className="text-sm text-[#949eb5] mt-1">
                  Elite endurance athletes average 170–185 SPM to minimize braking force and optimize running economy.
                </p>
              </div>

              {/* Big Cadence Dial / Display */}
              <div className="p-6 rounded-2xl bg-[#1a1d28] border border-[#262a3b] text-center space-y-3">
                <span className="text-xs uppercase tracking-wider text-[#949eb5] font-mono">
                  Target Stride Frequency
                </span>
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-extrabold font-mono text-[#10e57a] tracking-tight">
                    {cadence}
                  </span>
                  <span className="text-lg font-bold text-[#949eb5]">SPM</span>
                </div>
                <p className="text-xs text-[#949eb5]">
                  Harmonic matches will target <strong className="text-white">{cadence} BPM</strong> (1:1 direct) and <strong className="text-white">{Math.round(cadence / 2)} BPM</strong> (2:1 half-time).
                </p>

                {/* Slider */}
                <div className="pt-2">
                  <input
                    type="range"
                    min={145}
                    max={190}
                    step={1}
                    value={cadence}
                    onChange={(e) => setCadence(parseInt(e.target.value))}
                    className="w-full accent-[#10e57a] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] font-mono text-[#6b7794] mt-1">
                    <span>145 (Cruising)</span>
                    <span>168 (Sweet Spot)</span>
                    <span>190 (Sprint Turnover)</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  {[155, 165, 172, 180].map((presetVal) => (
                    <button
                      key={presetVal}
                      type="button"
                      onClick={() => setCadence(presetVal)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono font-medium border transition-colors ${
                        cadence === presetVal
                          ? "bg-[#10e57a]/20 border-[#10e57a] text-[#10e57a]"
                          : "bg-[#12141c] border-[#262a3b] text-[#949eb5] hover:text-white"
                      }`}
                    >
                      {presetVal} SPM
                    </button>
                  ))}
                </div>
              </div>

              {/* Workout Intensity */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#949eb5] mb-2.5">
                  Target Training Intensity
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {INTENSITY_OPTIONS.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setIntensity(opt)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                        intensity === opt
                          ? "border-[#10e57a] bg-[#10e57a]/10 text-white font-bold"
                          : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-[#262a3b]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-[#949eb5] hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-semibold text-sm transition-all"
                >
                  <span>Next: Musical Taste</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Musical Genres */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/20 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Step 3 of 3 · Musical Profile
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Select your workout soundtrack genres
                </h2>
                <p className="text-sm text-[#949eb5] mt-1">
                  Choose the genres that drive your cadence. The engine balances harmonic BPM with energetic instrumentation.
                </p>
              </div>

              {/* Genre Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {GENRE_OPTIONS.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`relative p-3.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-[#10e57a] bg-[#10e57a]/10 text-white shadow-[0_0_15px_rgba(16,229,122,0.15)]"
                          : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white hover:border-[#383e56]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{genre}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#10e57a] text-black flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Final Complete Button */}
              <div className="flex items-center justify-between pt-4 border-t border-[#262a3b]">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs font-medium text-[#949eb5] hover:text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-bold text-sm transition-all shadow-[0_0_20px_rgba(16,229,122,0.4)]"
                >
                  <span>Build My Engine</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
