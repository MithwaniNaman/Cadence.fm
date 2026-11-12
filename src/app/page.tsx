"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Play, 
  Disc3, 
  ArrowRight, 
  Activity, 
  Flame, 
  Layers, 
  CheckCircle2, 
  Volume2,
  ChevronRight,
  Cpu
} from "lucide-react";
import { SEEDED_TRACKS } from "@/lib/music-catalogue";
import { calculateCadenceMatch, estimatePaceFromCadence } from "@/lib/cadence-engine";
import { useAudioPlayer } from "@/lib/audio-player-context";
import { OnboardingModal } from "@/components/OnboardingModal";

export default function LandingPage() {
  const [demoCadence, setDemoCadence] = useState<number>(135);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const { playTrack } = useAudioPlayer();

  // Pick top matching track for interactive demo knob
  const scoredTracks = SEEDED_TRACKS.map((t) => calculateCadenceMatch(demoCadence, t))
    .sort((a, b) => b.score - a.score);
  const bestMatch = scoredTracks[0];
  const pace = estimatePaceFromCadence(demoCadence);

  return (
    <div className="relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-[#10e57a]/15 via-[#06b6d4]/5 to-transparent blur-[120px] pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12141c] border border-[#262a3b] text-xs font-mono text-[#949eb5] shadow-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10e57a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10e57a]"></span>
            </span>
            <span className="text-white font-medium">Harmonic Cadence Engine v1.0</span>
            <span className="text-[#6b7794]">|</span>
            <span className="text-[#10e57a]">Biomechanical Sound Architecture</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Find your rhythm. <br />
            <span className="text-gradient-lime">Own your run.</span>
          </h1>

          {/* Supporting Text */}
          <p className="text-lg sm:text-xl text-[#949eb5] max-w-2xl mx-auto font-normal leading-relaxed">
            Music that moves with you. A smarter soundtrack for every kilometre, matching musical tempo to your running cadence, pace, and workout intensity.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/studio"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-bold text-sm tracking-wide uppercase transition-all shadow-[0_0_25px_rgba(16,229,122,0.35)] hover:shadow-[0_0_35px_rgba(16,229,122,0.5)] transform hover:-translate-y-0.5"
            >
              <Disc3 className="w-4 h-4" />
              <span>Build My Playlist</span>
            </Link>

            <Link
              href="/run"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#12141c] hover:bg-[#1a1d28] border border-[#262a3b] hover:border-[#10e57a]/50 text-white font-semibold text-sm transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Explore Live Simulator</span>
              <ArrowRight className="w-4 h-4 text-[#10e57a]" />
            </Link>

            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="text-xs text-[#949eb5] hover:text-white underline underline-offset-4 mt-2 sm:mt-0 font-medium sm:hidden"
            >
              Calibrate Profile
            </button>
          </div>
        </div>

        {/* INTERACTIVE CADENCE ENGINE DEMO WIDGET */}
        <div className="mt-14 max-w-3xl mx-auto rounded-2xl bg-[#12141c]/90 border border-[#262a3b] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#262a3b] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10e57a] animate-ping" />
                <h3 className="text-white font-bold text-base sm:text-lg">
                  Interactive Cadence Matcher
                </h3>
              </div>
              <p className="text-xs text-[#949eb5] mt-0.5">
                Drag the cadence slider to experience dynamic harmonic tempo adaptation in real-time.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#1a1d28] px-3 py-1.5 rounded-xl border border-[#262a3b]">
              <span className="text-[11px] font-mono text-[#949eb5]">Estimated Pace:</span>
              <span className="text-xs font-mono font-bold text-[#10e57a]">
                {pace.paceFormatted} /km ({pace.speedKmh} km/h)
              </span>
            </div>
          </div>

          {/* Slider and Cadence Readout */}
          <div className="py-6 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono uppercase text-[#949eb5]">Runner Cadence</span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-mono font-extrabold text-[#10e57a] tracking-tight">
                  {demoCadence}
                </span>
                <span className="text-sm font-bold text-[#949eb5]">SPM</span>
              </div>
            </div>

            <input
              type="range"
              min={110}
              max={180}
              step={1}
              value={demoCadence}
              onChange={(e) => setDemoCadence(parseInt(e.target.value))}
              className="w-full h-2.5 bg-[#1a1d28] rounded-lg appearance-none cursor-pointer accent-[#10e57a]"
            />

            <div className="flex justify-between text-[11px] font-mono text-[#6b7794]">
              <span>110 SPM (Walk)</span>
              <span>125 SPM (Jog)</span>
              <span>135 SPM (Cruise)</span>
              <span>150+ SPM (Tempo)</span>
            </div>
          </div>

          {/* Recommended Track Card (Result) */}
          <div className="p-4 sm:p-5 rounded-xl bg-[#1a1d28] border border-[#262a3b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#262a3b] border border-[#383e56] flex-shrink-0">
                <img
                  src={bestMatch.track.artwork}
                  alt={bestMatch.track.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => playTrack(bestMatch.track)}
                  className="absolute inset-0 bg-black/40 hover:bg-black/20 flex items-center justify-center transition-colors group"
                >
                  <Play className="w-5 h-5 fill-white text-white group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-white font-bold text-sm sm:text-base">{bestMatch.track.name}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-[#10e57a]/20 text-[#10e57a] border border-[#10e57a]/30">
                    {bestMatch.score}% Sync
                  </span>
                </div>
                <p className="text-xs text-[#949eb5] mt-0.5">
                  {bestMatch.track.artist} · <span className="text-white font-mono">{bestMatch.track.bpm} BPM</span> · <span className="text-[#06b6d4]">{bestMatch.rhythmDetail}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={() => playTrack(bestMatch.track)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#10e57a]/15 hover:bg-[#10e57a]/25 text-[#10e57a] border border-[#10e57a]/30 text-xs font-semibold transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Beat Lock</span>
              </button>
            </div>
          </div>

          {/* Engine Explanation Box */}
          <div className="mt-4 p-3.5 rounded-xl bg-[#090a0f] border border-[#262a3b] flex items-start gap-3">
            <Cpu className="w-4 h-4 text-[#10e57a] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#949eb5] leading-relaxed">
              <strong className="text-white">Harmonic Analysis:</strong> {bestMatch.explanation}
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE: CORE PRODUCT PILLARS */}
      <section className="py-20 border-t border-[#1a1d28] bg-[#0c0e14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-mono uppercase tracking-widest text-[#10e57a] font-bold mb-2">
              Engineered for Stride Efficiency
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Why static playlists fail runners
            </h3>
            <p className="text-sm text-[#949eb5] mt-3">
              When musical tempo mismatches stride frequency, neurological braking cues disrupt oxygen efficiency. Cadence.fm delivers phase-locked acoustic resonance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-7 rounded-2xl bg-[#12141c] border border-[#262a3b] hover:border-[#10e57a]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#10e57a]/10 border border-[#10e57a]/20 flex items-center justify-center text-[#10e57a] mb-5 group-hover:scale-105 transition-transform">
                <Activity className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Harmonic Cadence Engine
              </h4>
              <p className="text-xs text-[#949eb5] leading-relaxed mb-4">
                Beyond naive BPM matching: our algorithm identifies 1:1 direct tempo matches, 2:1 half-time syncopation, and double-time surges to create musical resonance across genres.
              </p>
              <ul className="space-y-2 text-xs text-[#949eb5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10e57a]" />
                  <span>Sub-2% cadence error tolerance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10e57a]" />
                  <span>Half-time bass groove recognition</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="p-7 rounded-2xl bg-[#12141c] border border-[#262a3b] hover:border-[#06b6d4]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4] mb-5 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                5 Workout Progressions
              </h4>
              <p className="text-xs text-[#949eb5] leading-relaxed mb-4">
                Structured musical curves tailored to workout physics: Easy Runs, Threshold Tempos, VO2 Max Intervals, Long Progression Runs, and Race Day Pacing.
              </p>
              <ul className="space-y-2 text-xs text-[#949eb5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#06b6d4]" />
                  <span>Warm-up to cooldown modulation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#06b6d4]" />
                  <span>Configurable tempo bands</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="p-7 rounded-2xl bg-[#12141c] border border-[#262a3b] hover:border-[#f59e0b]/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] mb-5 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Live Simulator & Analytics
              </h4>
              <p className="text-xs text-[#949eb5] leading-relaxed mb-4">
                Interactive real-time simulator showing instantaneous cadence changes, dynamic song adaptations, lock-in gauges, and post-run biomechanical analytics.
              </p>
              <ul className="space-y-2 text-xs text-[#949eb5]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Interactive cadence shifting simulator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Cadence-zone telemetry charts</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK PRODUCT PREVIEW CTA BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-[#12141c] via-[#1a1d28] to-[#12141c] border border-[#262a3b] p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-mono uppercase tracking-wider text-[#10e57a] font-semibold">
              Live Product Demonstration
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Experience the Live Cadence Simulator
            </h3>
            <p className="text-sm text-[#949eb5] leading-relaxed">
              Step into the runner’s cockpit. Vary your cadence from 150 to 180 SPM and observe how Cadence.fm automatically adapts its music recommendations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/run"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#10e57a] text-black font-bold text-sm uppercase tracking-wide hover:bg-[#0cd06d] transition-all shadow-[0_0_20px_rgba(16,229,122,0.3)]"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Launch Simulator</span>
            </Link>

            <Link
              href="/pm"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#1a1d28] hover:bg-[#262a3b] text-white border border-[#262a3b] text-sm font-semibold transition-all"
            >
              <span>View PM Spec</span>
              <ChevronRight className="w-4 h-4 text-[#949eb5]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ONBOARDING MODAL */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onComplete={(newProfile) => {
          setDemoCadence(newProfile.typicalCadence);
        }}
      />
    </div>
  );
}
