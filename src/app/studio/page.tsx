"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Disc3, 
  Play, 
  RotateCcw, 
  Sliders, 
  SlidersHorizontal, 
  Clock, 
  Sparkles, 
  Check, 
  Volume2, 
  Zap, 
  ArrowRight,
  Info,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  WORKOUT_PRESETS, 
  WorkoutType, 
  generateSmartPlaylist, 
  GeneratedPlaylist, 
  PlaylistTrackItem 
} from "@/lib/playlist-generator";
import { loadUserProfile, saveActivePlaylist, UserProfile } from "@/lib/user-store";
import { useAudioPlayer } from "@/lib/audio-player-context";
import { estimatePaceFromCadence } from "@/lib/cadence-engine";

const GENRES: ("Alternative Rock" | "Grunge" | "Metal" | "Electronic" | "Indie" | "Hip-Hop")[] = [
  "Alternative Rock",
  "Grunge",
  "Metal",
  "Electronic",
  "Indie",
  "Hip-Hop",
];

export default function PlaylistStudioPage() {
  const router = useRouter();
  const { playTrack } = useAudioPlayer();

  const [workoutType, setWorkoutType] = useState<WorkoutType>("long-run");
  const [targetCadence, setTargetCadence] = useState<number>(168);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([
    "Electronic",
    "Alternative Rock",
    "Hip-Hop",
  ]);
  const [playlist, setPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [showConfigBands, setShowConfigBands] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeStageFilter, setActiveStageFilter] = useState<string | null>(null);

  // Load initial settings
  useEffect(() => {
    const prof = loadUserProfile();
    setTargetCadence(prof.typicalCadence || 168);
    setSelectedGenres(prof.preferredGenres || ["Electronic", "Alternative Rock"]);

    // Generate initial playlist
    const initial = generateSmartPlaylist({
      workoutType: "long-run",
      targetCadence: prof.typicalCadence || 168,
      selectedGenres: prof.preferredGenres,
    });
    setPlaylist(initial);
  }, []);

  const handleGenerate = (newType = workoutType, newCadence = targetCadence, newGenres = selectedGenres) => {
    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateSmartPlaylist({
        workoutType: newType,
        targetCadence: newCadence,
        selectedGenres: newGenres,
      });
      setPlaylist(generated);
      saveActivePlaylist(generated);
      setIsGenerating(false);
    }, 250);
  };

  const toggleGenre = (genre: string) => {
    const updated = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    
    // Always keep at least 1 genre
    if (updated.length > 0) {
      setSelectedGenres(updated);
      handleGenerate(workoutType, targetCadence, updated);
    }
  };

  const handleWorkoutChange = (type: WorkoutType) => {
    setWorkoutType(type);
    const preset = WORKOUT_PRESETS[type];
    const newCad = preset.defaultCadence;
    setTargetCadence(newCad);
    handleGenerate(type, newCad, selectedGenres);
  };

  const handleLaunchRun = () => {
    if (!playlist) return;
    saveActivePlaylist(playlist);
    router.push("/run");
  };

  const currentPreset = WORKOUT_PRESETS[workoutType];
  const pace = estimatePaceFromCadence(targetCadence);

  const displayedTracks = playlist?.tracks.filter((t) => {
    if (!activeStageFilter) return true;
    return t.stageName === activeStageFilter;
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#262a3b]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Disc3 className="w-4 h-4 text-[#10e57a]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#10e57a]">
              Smart Playlist Studio · Workout Progression Generator
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Curate your athletic soundtrack
          </h1>
          <p className="text-sm text-[#949eb5] mt-1 max-w-2xl">
            Design musical progressions where song BPM and harmonic rhythms dynamically support every phase of your training session.
          </p>
        </div>

        {playlist && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a1d28] hover:bg-[#262a3b] border border-[#262a3b] text-xs font-semibold text-white transition-all disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
              <span>Regenerate Tracks</span>
            </button>

            <button
              onClick={handleLaunchRun}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-bold text-xs uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(16,229,122,0.35)]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Run With This Set</span>
            </button>
          </div>
        )}
      </div>

      {/* STUDIO CONTROLS DECK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: PARAMETER DIALS (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* 1. Workout Type Selector */}
          <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#949eb5]">
                1. Select Workout Type
              </label>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                style={{ backgroundColor: `${currentPreset.color}20`, color: currentPreset.color }}
              >
                {currentPreset.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(WORKOUT_PRESETS) as WorkoutType[]).map((type) => {
                const p = WORKOUT_PRESETS[type];
                const isSelected = workoutType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleWorkoutChange(type)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-[#10e57a] bg-[#1a221f] text-white shadow-sm"
                        : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:border-[#383e56] hover:text-white"
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{p.title}</h4>
                      <p className="text-[11px] text-[#949eb5] line-clamp-1">{p.tagline}</p>
                    </div>
                    <span className="text-[11px] font-mono text-[#10e57a] font-semibold flex-shrink-0">
                      {p.defaultCadence} SPM
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Target Cadence Slider */}
          <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#949eb5]">
                2. Target Cadence (SPM)
              </label>
              <span className="text-xs font-mono text-[#06b6d4]">
                Est. Pace: {pace.paceFormatted} /km
              </span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-xs text-[#949eb5]">Stride Frequency</span>
              <div className="flex items-baseline gap-1.5 font-mono">
                <span className="text-4xl font-extrabold text-[#10e57a]">{targetCadence}</span>
                <span className="text-sm font-bold text-[#949eb5]">SPM</span>
              </div>
            </div>

            <input
              type="range"
              min={145}
              max={190}
              step={1}
              value={targetCadence}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setTargetCadence(val);
                handleGenerate(workoutType, val, selectedGenres);
              }}
              className="w-full accent-[#10e57a] cursor-pointer"
            />

            <div className="flex justify-between text-[11px] font-mono text-[#6b7794]">
              <span>145 (Cruising)</span>
              <span>168 (Endurance)</span>
              <span>180 (Threshold)</span>
              <span>190 (Sprint)</span>
            </div>
          </div>

          {/* 3. Musical Genres Filter */}
          <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#949eb5] block">
              3. Filter Music Genres
            </label>

            <div className="grid grid-cols-2 gap-2">
              {GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-[#10e57a] bg-[#10e57a]/10 text-white font-semibold"
                        : "border-[#262a3b] bg-[#1a1d28] text-[#949eb5] hover:text-white"
                    }`}
                  >
                    <span>{genre}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#10e57a]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configurable Progression Bands Drawer */}
          <div className="p-4 rounded-2xl bg-[#12141c] border border-[#262a3b]">
            <button
              type="button"
              onClick={() => setShowConfigBands(!showConfigBands)}
              className="w-full flex items-center justify-between text-xs font-semibold text-[#949eb5] hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#10e57a]" />
                Inspect Configurable Tempo Progression Bands
              </span>
              {showConfigBands ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showConfigBands && (
              <div className="pt-3 space-y-2.5 border-t border-[#262a3b] mt-3">
                <p className="text-[11px] text-[#949eb5] leading-relaxed">
                  Tempo bands define the BPM target windows for each workout phase:
                </p>
                {currentPreset.stages.map((st, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-[#1a1d28] border border-[#262a3b] text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-white block">{st.name}</strong>
                      <span className="text-[10px] text-[#949eb5]">{st.description}</span>
                    </div>
                    <span className="font-mono text-[#10e57a] font-bold text-xs">
                      {st.targetBpmMin}–{st.targetBpmMax} BPM
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: GENERATED PLAYLIST TRACKS (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {playlist && (
            <>
              {/* PLAYLIST SUMMARY CARD */}
              <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#10e57a]/15 text-[#10e57a] border border-[#10e57a]/20">
                      Progression Curve Generated
                    </span>
                    <span className="text-xs text-[#949eb5]">{playlist.totalDurationFormatted}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-white mt-1">{playlist.title}</h3>
                  <p className="text-xs text-[#949eb5] mt-0.5">
                    {playlist.trackCount} Tracks across {playlist.stages.length} calibrated workout phases
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-[#262a3b] pt-3 sm:pt-0 sm:pl-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-mono text-[#949eb5] block">
                      Sync Score
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-[#10e57a]">
                      {playlist.avgCompatibilityScore}%
                    </span>
                  </div>

                  <button
                    onClick={handleLaunchRun}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-bold text-xs uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(16,229,122,0.3)]"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Run</span>
                  </button>
                </div>
              </div>

              {/* PROGRESSION PHASE FILTER TABS */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveStageFilter(null)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    activeStageFilter === null
                      ? "bg-[#10e57a] text-black font-bold"
                      : "bg-[#1a1d28] text-[#949eb5] hover:text-white"
                  }`}
                >
                  All Stages ({playlist.trackCount})
                </button>
                {playlist.stages.map((st) => (
                  <button
                    key={st.name}
                    type="button"
                    onClick={() => setActiveStageFilter(st.name)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                      activeStageFilter === st.name
                        ? "bg-[#10e57a] text-black font-bold"
                        : "bg-[#1a1d28] text-[#949eb5] hover:text-white"
                    }`}
                  >
                    {st.name} ({st.trackCount})
                  </button>
                ))}
              </div>

              {/* TRACKS LIST */}
              <div className="space-y-2.5">
                {displayedTracks.map((item, idx) => (
                  <div
                    key={item.track.id + idx}
                    className="p-3.5 sm:p-4 rounded-2xl bg-[#12141c] border border-[#262a3b] hover:border-[#383e56] transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Number & Artwork */}
                        <span className="text-xs font-mono text-[#6b7794] w-4 text-right flex-shrink-0">
                          {idx + 1}
                        </span>

                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#1a1d28] border border-[#262a3b] flex-shrink-0 group">
                          <img
                            src={item.track.artwork}
                            alt={item.track.name}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => playTrack(item.track)}
                            className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition-colors"
                            title="Play Beat Preview"
                          >
                            <Play className="w-4 h-4 fill-white text-white group-hover:scale-110 transition-transform" />
                          </button>
                        </div>

                        {/* Title and details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white truncate">{item.track.name}</h4>
                            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-[#1a1d28] text-[#949eb5] border border-[#262a3b] hidden sm:inline">
                              {item.stageName}
                            </span>
                          </div>
                          <p className="text-xs text-[#949eb5] truncate mt-0.5">
                            {item.track.artist} · <span className="text-white font-mono">{item.track.bpm} BPM</span> · <span className="text-[#06b6d4]">{item.rhythmDetail}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right side compatibility badge and preview trigger */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                          onClick={() => playTrack(item.track)}
                          className="p-2 rounded-lg bg-[#1a1d28] hover:bg-[#262a3b] text-[#949eb5] hover:text-[#10e57a] transition-colors"
                          title="Preview synthesized rhythm beat"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>

                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-[#10e57a] block">
                            {item.score}%
                          </span>
                          <span className="text-[10px] uppercase font-mono text-[#6b7794]">
                            Sync Lock
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cadence Engine Explanation string */}
                    <div className="p-2.5 rounded-xl bg-[#0c0e14] border border-[#1a1d28] text-[11px] text-[#949eb5] flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#10e57a] mt-0.5 flex-shrink-0" />
                      <span>{item.explanation}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
