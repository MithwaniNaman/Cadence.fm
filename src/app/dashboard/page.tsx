"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Activity, 
  Play, 
  Disc3, 
  Flame, 
  TrendingUp, 
  Target, 
  Sliders, 
  Sparkles,
  ChevronRight
} from "lucide-react";
import { loadUserProfile, loadRunSessions, loadActivePlaylist, saveActivePlaylist, UserProfile, RunSessionRecord } from "@/lib/user-store";
import { WORKOUT_PRESETS, WorkoutType, generateSmartPlaylist, GeneratedPlaylist } from "@/lib/playlist-generator";
import { useAudioPlayer } from "@/lib/audio-player-context";
import { OnboardingModal } from "@/components/OnboardingModal";

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(() =>
    typeof window !== "undefined" ? loadUserProfile() : null
  );
  const [sessions] = useState<RunSessionRecord[]>(() =>
    typeof window !== "undefined" ? loadRunSessions() : []
  );
  const [activePlaylist, setActivePlaylist] = useState<GeneratedPlaylist | null>(() =>
    typeof window !== "undefined" ? loadActivePlaylist() : null
  );
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { playTrack } = useAudioPlayer();

  const handleQuickWorkoutSelect = (type: WorkoutType) => {
    if (!profile) return;
    const newPlaylist = generateSmartPlaylist({
      workoutType: type,
      targetCadence: profile.typicalCadence,
      selectedGenres: profile.preferredGenres,
    });
    saveActivePlaylist(newPlaylist);
    setActivePlaylist(newPlaylist);
  };

  if (!profile) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#262a3b]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#10e57a]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#10e57a]">
              Athlete Dashboard · Cadence.fm Engine Active
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome back, {profile.name}
          </h1>
          <p className="text-sm text-[#949eb5] mt-1">
            Targeting {profile.preferredDistance} · Baseline Stride Cadence: <strong className="text-white font-mono">{profile.typicalCadence} SPM</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1a1d28] hover:bg-[#262a3b] border border-[#262a3b] text-xs font-semibold text-[#949eb5] hover:text-white transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Recalibrate Profile</span>
          </button>

          <Link
            href="/run"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-bold text-xs uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(16,229,122,0.3)]"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Start Live Session</span>
          </Link>
        </div>
      </div>

      {/* WEEKLY RUNNING KPI STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Distance */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-1">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-medium uppercase tracking-wider">Weekly Mileage</span>
            <Activity className="w-4 h-4 text-[#10e57a]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-extrabold font-mono text-white">28.4</span>
            <span className="text-sm font-semibold text-[#949eb5]">km</span>
          </div>
          <p className="text-[11px] text-[#10e57a] flex items-center gap-1 pt-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12% vs last week</span>
          </p>
        </div>

        {/* KPI 2: Average Cadence */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-1">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Stride Frequency</span>
            <Target className="w-4 h-4 text-[#06b6d4]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-extrabold font-mono text-[#06b6d4]">169</span>
            <span className="text-sm font-semibold text-[#949eb5]">SPM</span>
          </div>
          <p className="text-[11px] text-[#949eb5] pt-1">
            Target: <strong className="text-white">{profile.typicalCadence} SPM</strong> (Optimal biomechanics)
          </p>
        </div>

        {/* KPI 3: Music Sync Efficiency */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-1">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-medium uppercase tracking-wider">Tempo Sync Lock</span>
            <Sparkles className="w-4 h-4 text-[#10e57a]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-extrabold font-mono text-[#10e57a]">94.2%</span>
          </div>
          <p className="text-[11px] text-[#949eb5] pt-1">
            Time in phase-locked cadence rhythm
          </p>
        </div>

        {/* KPI 4: Workouts Completed */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-1">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-medium uppercase tracking-wider">Assisted Workouts</span>
            <Flame className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-extrabold font-mono text-white">4</span>
            <span className="text-sm font-semibold text-[#949eb5]">sessions</span>
          </div>
          <p className="text-[11px] text-[#f59e0b] pt-1">
            North Star goal: 3+ weekly
          </p>
        </div>
      </div>

      {/* QUICK WORKOUT SELECTION GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Quick Workout Selection</h2>
            <p className="text-xs text-[#949eb5] mt-0.5">
              Select a session type to configure tempo progressions and generate a calibrated track set.
            </p>
          </div>
          <Link href="/studio" className="text-xs font-semibold text-[#10e57a] hover:underline flex items-center gap-1">
            <span>Open Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {(Object.keys(WORKOUT_PRESETS) as WorkoutType[]).map((type) => {
            const preset = WORKOUT_PRESETS[type];
            const isCurrentActive = activePlaylist?.workoutType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleQuickWorkoutSelect(type)}
                className={`text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${
                  isCurrentActive
                    ? "bg-[#161a24] border-[#10e57a] shadow-[0_0_20px_rgba(16,229,122,0.15)]"
                    : "bg-[#12141c] border-[#262a3b] hover:border-[#383e56] hover:bg-[#1a1d28]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${preset.color}20`, color: preset.color }}
                  >
                    {preset.badge}
                  </span>
                  {isCurrentActive && (
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10e57a] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10e57a]"></span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-white text-sm group-hover:text-[#10e57a] transition-colors">
                  {preset.title}
                </h3>
                <p className="text-[11px] text-[#949eb5] mt-1 line-clamp-2 leading-relaxed">
                  {preset.tagline}
                </p>

                <div className="mt-3 pt-3 border-t border-[#262a3b] flex items-center justify-between text-[11px] font-mono text-[#949eb5]">
                  <span>~{preset.targetDurationMinutes} min</span>
                  <span className="text-white font-semibold">{preset.defaultCadence} SPM</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE PLAYLIST & RECENT SESSIONS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ACTIVE LOADED PLAYLIST (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Disc3 className="w-5 h-5 text-[#10e57a]" />
              <h2 className="text-xl font-bold text-white tracking-tight">Active Workout Playlist</h2>
            </div>
            <Link
              href="/studio"
              className="text-xs font-semibold text-[#10e57a] hover:underline"
            >
              Customize in Studio →
            </Link>
          </div>

          {activePlaylist && (
            <div className="rounded-2xl bg-[#12141c] border border-[#262a3b] p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262a3b]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10e57a]/20 text-[#10e57a] border border-[#10e57a]/30 uppercase">
                      {activePlaylist.workoutType}
                    </span>
                    <span className="text-xs text-[#949eb5]">{activePlaylist.trackCount} Tracks · {activePlaylist.totalDurationFormatted}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">{activePlaylist.title}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right pr-3 border-r border-[#262a3b]">
                    <span className="text-[10px] uppercase font-mono text-[#949eb5] block">Avg Compatibility</span>
                    <span className="text-base font-bold font-mono text-[#10e57a]">{activePlaylist.avgCompatibilityScore}%</span>
                  </div>
                  <Link
                    href="/run"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-bold text-xs uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(16,229,122,0.3)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Run With This</span>
                  </Link>
                </div>
              </div>

              {/* Tracks preview list */}
              <div className="space-y-2">
                {activePlaylist.tracks.slice(0, 5).map((item, idx) => (
                  <div
                    key={item.track.id + idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#1a1d28] border border-[#262a3b] hover:border-[#383e56] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#262a3b] flex-shrink-0">
                        <img
                          src={item.track.artwork}
                          alt={item.track.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => playTrack(item.track)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center group"
                          title="Preview beat"
                        >
                          <Play className="w-3.5 h-3.5 fill-white text-white group-hover:scale-110 transition-transform" />
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white truncate">{item.track.name}</h4>
                          <span className="text-[10px] text-[#6b7794] font-mono">({item.stageName})</span>
                        </div>
                        <p className="text-[11px] text-[#949eb5] truncate">
                          {item.track.artist} · <span className="text-white font-mono">{item.track.bpm} BPM</span> · <span className="text-[#06b6d4]">{item.rhythmDetail}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-[#10e57a]">
                        {item.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/studio"
                  className="text-xs text-[#949eb5] hover:text-[#10e57a] font-medium transition-colors"
                >
                  + {activePlaylist.trackCount - 5} more tracks in progression curve · View Complete Workout Set
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* RECENT SESSIONS LOG (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight">Recent Sessions</h2>
            <Link href="/insights" className="text-xs font-semibold text-[#10e57a] hover:underline">
              View All Insights →
            </Link>
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-4 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-3 hover:border-[#383e56] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#949eb5]">{sess.date}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10e57a]/15 text-[#10e57a]">
                    {sess.avgCompatibilityScore}% Sync
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">{sess.title}</h4>
                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-[#1a1d28] text-center font-mono">
                    <div>
                      <span className="text-[9px] uppercase text-[#6b7794] block">Distance</span>
                      <span className="text-xs font-bold text-white">{sess.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-[#6b7794] block">Cadence</span>
                      <span className="text-xs font-bold text-[#10e57a]">{sess.avgCadence} SPM</span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase text-[#6b7794] block">Avg Pace</span>
                      <span className="text-xs font-bold text-white">{sess.avgPace} /km</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#1a1d28] text-[11px] text-[#949eb5] leading-relaxed">
                  <strong className="text-white">Coach Note:</strong> {sess.aiCoachSummary}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(newProfile) => {
          setProfile(newProfile);
          // Regenerate active playlist with new cadence
          const updated = generateSmartPlaylist({
            workoutType: activePlaylist?.workoutType || "tempo",
            targetCadence: newProfile.typicalCadence,
            selectedGenres: newProfile.preferredGenres,
          });
          saveActivePlaylist(updated);
          setActivePlaylist(updated);
        }}
      />
    </div>
  );
}
