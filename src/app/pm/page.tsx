import Link from "next/link";
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Compass, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Disc3, 
  Radio, 
  Layers, 
  Cpu, 
  ShieldCheck 
} from "lucide-react";

export default function PMStrategyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12">
      {/* HEADER */}
      <div className="border-b border-[#262a3b] pb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10e57a]/15 text-[#10e57a] border border-[#10e57a]/20 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Product Management Thesis & Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Product Vision & Strategy
        </h1>
        <p className="text-base text-[#949eb5] max-w-3xl leading-relaxed">
          Cadence.fm was conceived not as another generic fitness tracking dashboard or basic Spotify clone, but as a purpose-built acoustic companion solving biomechanical stride collapse in endurance runners.
        </p>
      </div>

      {/* CORE PRODUCT HYPOTHESIS */}
      <section className="p-8 rounded-3xl bg-[#12141c] border border-[#262a3b] relative overflow-hidden space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#10e57a]">
          <Target className="w-4 h-4" />
          <span>Primary Product Hypothesis</span>
        </div>
        <blockquote className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
          &ldquo;Matching music tempo to running cadence creates a more engaging, biomechanically consistent, and personalized endurance running experience.&rdquo;
        </blockquote>
        <p className="text-sm text-[#949eb5] leading-relaxed">
          When musical tempo mismatches stride frequency, the central nervous system incurs subconscious braking latency. By synthesizing 1:1 direct and 2:1 harmonic half-time acoustic resonance, athletes sustain cadence consistency through late-race glycogen depletion.
        </p>
      </section>

      {/* TARGET PERSONA & CORE PAIN POINT */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Persona Card */}
        <div className="p-7 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#06b6d4]">
            <Users className="w-4 h-4" />
            <span>Target User Persona</span>
          </div>
          <h3 className="text-xl font-bold text-white">Alex Chen · 32, Half-Marathoner</h3>
          <p className="text-xs text-[#949eb5] leading-relaxed">
            Recreational to competitive amateur runner training for a sub-1:45 half marathon. Logs 25–40 km weekly. Highly reliant on music for motivation, but frustrated by static playlists that drag stride tempo down during uphill or threshold sections.
          </p>
          <div className="p-3.5 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-2 text-xs text-[#949eb5]">
            <div className="flex justify-between">
              <span>Weekly Mileage:</span>
              <strong className="text-white">35 km</strong>
            </div>
            <div className="flex justify-between">
              <span>Target Cadence:</span>
              <strong className="text-[#10e57a] font-mono">170–174 SPM</strong>
            </div>
            <div className="flex justify-between">
              <span>Audio Equipment:</span>
              <strong className="text-white">Bone-conduction / ANC buds</strong>
            </div>
          </div>
        </div>

        {/* Core Pain Point */}
        <div className="p-7 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#f59e0b]">
            <Compass className="w-4 h-4" />
            <span>Core User Pain Point</span>
          </div>
          <h3 className="text-xl font-bold text-white">The Cadence Collapse Dilemma</h3>
          <p className="text-xs text-[#949eb5] leading-relaxed">
            Mainstream streaming platforms curate playlists by genre or vibe, completely indifferent to stride mechanics. When an 80 BPM slow acoustic ballad plays right after a 175 BPM rock anthem, the runner&apos;s stride cadence inadvertently drops by 10–15 SPM, degrading running economy by up to 8%.
          </p>
          <div className="p-3.5 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-2 text-xs text-[#949eb5]">
            <div className="flex items-center gap-2 text-[#f59e0b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span>Static playlists lack workout-phase awareness</span>
            </div>
            <div className="flex items-center gap-2 text-[#f59e0b]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
              <span>No real-time adaptation when fatigue sets in</span>
            </div>
          </div>
        </div>
      </section>

      {/* METRICS FRAMEWORK (NORTH STAR + SUPPORTING KPIS) */}
      <section className="p-8 rounded-3xl bg-[#12141c] border border-[#262a3b] space-y-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#10e57a]">
            Product Instrumentation Framework
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Success Metrics & Business Telemetry
          </h2>
        </div>

        {/* North Star Metric Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#16221c] to-[#12141c] border border-[#10e57a]/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-[#10e57a] font-bold">
              North Star Metric (NSM)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10e57a] text-black">
              PRIMARY VALUE
            </span>
          </div>
          <h3 className="text-2xl font-extrabold text-white">
            Weekly Successful Music-Assisted Workouts (WSMAW)
          </h3>
          <p className="text-xs text-[#949eb5] leading-relaxed">
            Defined as any running session ≥ 20 minutes where Cadence.fm was actively connected and maintained an average cadence-tempo compatibility score ≥ 85%.
          </p>
        </div>

        {/* Supporting Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {/* KPI 1 */}
          <div className="p-4 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#949eb5]">Conversion</span>
            <h4 className="text-sm font-bold text-white">Playlist-to-Workout Conversion</h4>
            <p className="text-[11px] text-[#949eb5]">Target: &gt; 65% of generated playlists initiated in run.</p>
          </div>

          {/* KPI 2 */}
          <div className="p-4 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#949eb5]">Engagement</span>
            <h4 className="text-sm font-bold text-white">Workout Completion Rate</h4>
            <p className="text-[11px] text-[#949eb5]">Target: &gt; 80% runs completed without manual cancellation.</p>
          </div>

          {/* KPI 3 */}
          <div className="p-4 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#949eb5]">Algorithmic Quality</span>
            <h4 className="text-sm font-bold text-white">Avg Compatibility Score</h4>
            <p className="text-[11px] text-[#949eb5]">Target: &gt; 92% across all workout phases.</p>
          </div>

          {/* KPI 4 */}
          <div className="p-4 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#949eb5]">Reach</span>
            <h4 className="text-sm font-bold text-white">Weekly Active Users (WAU)</h4>
            <p className="text-[11px] text-[#949eb5]">Core metric measuring athletic retention cohort health.</p>
          </div>

          {/* KPI 5 */}
          <div className="p-4 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#949eb5]">Retention</span>
            <h4 className="text-sm font-bold text-white">Repeat Workout Rate</h4>
            <p className="text-[11px] text-[#949eb5]">Target: &gt; 2.4 sessions per active athlete per week.</p>
          </div>

          {/* KPI 6 */}
          <div className="p-4 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-1">
            <span className="text-[10px] uppercase font-mono text-[#949eb5]">Audio Engagement</span>
            <h4 className="text-sm font-bold text-white">Harmonic Lock Retention</h4>
            <p className="text-[11px] text-[#949eb5]">Minutes spent in phase-lock status per run.</p>
          </div>
        </div>
      </section>

      {/* MVP SCOPE VS FUTURE PRODUCT ROADMAP */}
      <section className="space-y-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-[#10e57a]">
            Engineering & Product Delivery
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            MVP Scope vs Future Horizon Roadmap
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Phase 1: MVP Scope (Current) */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-[#10e57a]/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">MVP Scope (Delivered)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#10e57a]/20 text-[#10e57a] font-bold">
                PROD READY
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-[#949eb5]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10e57a] mt-0.5 flex-shrink-0" />
                <span>Personalized athlete onboarding & persistent biomechanical calibration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10e57a] mt-0.5 flex-shrink-0" />
                <span>The Cadence Engine: 1:1 direct and 2:1 harmonic half-time matching algorithms</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10e57a] mt-0.5 flex-shrink-0" />
                <span>5-stage workout progression playlist generator with 45+ seeded tracks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10e57a] mt-0.5 flex-shrink-0" />
                <span>Web Audio procedural rhythm synthesizer for auditory tempo validation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10e57a] mt-0.5 flex-shrink-0" />
                <span>Interactive Live Run Simulator with dynamic cadence shifting & lock indicator</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10e57a] mt-0.5 flex-shrink-0" />
                <span>Post-run performance insights with Recharts telemetry and AI coach debrief</span>
              </li>
            </ul>
          </div>

          {/* Phase 2: Horizon Roadmap */}
          <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">Horizon Roadmap (Post-MVP)</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1a1d28] text-[#949eb5] font-bold">
                Q1–Q3 ROADMAP
              </span>
            </div>
            <ul className="space-y-2.5 text-xs text-[#949eb5]">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] mt-1.5 flex-shrink-0" />
                <span><strong>Spotify Web Playback SDK:</strong> Direct streaming integration with runner&apos;s personal saved Spotify catalogue.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] mt-1.5 flex-shrink-0" />
                <span><strong>Bluetooth BLE Footpod / Stryd Sensor API:</strong> Live physical cadence sensor pairing via Web Bluetooth.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] mt-1.5 flex-shrink-0" />
                <span><strong>Garmin Connect IQ & Apple Watch Companion:</strong> Native watch app running independent on wrist without phone.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] mt-1.5 flex-shrink-0" />
                <span><strong>Strava Auto-Upload:</strong> Direct webhook activity sync with music sync badge on Strava activity feeds.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <div className="p-8 rounded-3xl bg-[#161a24] border border-[#262a3b] text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">Experience the Live Prototype</h3>
        <p className="text-sm text-[#949eb5] max-w-xl mx-auto">
          Test the Cadence Engine in the interactive simulator and observe how the system responds to dynamic cadence variations in real-time.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/run"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-bold text-xs uppercase tracking-wide transition-all shadow-[0_0_20px_rgba(16,229,122,0.35)]"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Launch Live Run Simulator</span>
          </Link>
          <Link
            href="/studio"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#12141c] hover:bg-[#1a1d28] border border-[#262a3b] text-white font-semibold text-xs transition-colors"
          >
            <Disc3 className="w-4 h-4 text-[#10e57a]" />
            <span>Open Playlist Studio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
