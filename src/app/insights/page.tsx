"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  Flag, 
  Clock, 
  Disc3, 
  Play, 
  ArrowRight, 
  ShieldCheck, 
  Award,
  ChevronDown
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from "recharts";
import { loadRunSessions, RunSessionRecord } from "@/lib/user-store";
import { formatTime } from "@/lib/utils";

function InsightsContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("session");

  const [sessions, setSessions] = useState<RunSessionRecord[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");

  useEffect(() => {
    const list = loadRunSessions();
    setSessions(list);
    if (runId && list.some((s) => s.id === runId)) {
      setSelectedSessionId(runId);
    } else if (list.length > 0) {
      setSelectedSessionId(list[0].id);
    }
  }, [runId]);

  const activeSession: RunSessionRecord | undefined =
    sessions.find((s) => s.id === selectedSessionId) || sessions[0];

  if (!activeSession) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-[#949eb5]">
        <p>No run sessions recorded yet. Launch the Live Run Simulator to record telemetry!</p>
        <Link href="/run" className="inline-block mt-4 px-4 py-2 bg-[#10e57a] text-black font-bold rounded-lg text-xs">
          Start Simulator
        </Link>
      </div>
    );
  }

  // Prepare chart data with minutes:seconds labels
  const chartData = activeSession.timeSeries.map((pt) => ({
    timeLabel: formatTime(pt.second),
    cadence: pt.cadence,
    targetCadence: 168,
    compatibility: pt.compatibility,
    pace: Math.round(pt.pace),
    trackName: pt.trackName,
  }));

  const zoneData = activeSession.cadenceZones.map((z) => ({
    name: z.zoneName,
    percentage: z.percentage,
    seconds: z.seconds,
    color: z.color,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* HEADER SECTION & SESSION SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#262a3b]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#10e57a]" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#10e57a]">
              Post-Workout Biomechanical Telemetry
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Performance Insights
          </h1>
          <p className="text-sm text-[#949eb5] mt-1">
            Analysis of cadence stability, harmonic music lock, and stride efficiency throughout your session.
          </p>
        </div>

        {/* Session Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={activeSession.id}
              onChange={(e) => setSelectedSessionId(e.target.value)}
              className="appearance-none bg-[#12141c] border border-[#262a3b] text-white text-xs font-semibold py-2.5 pl-3 pr-8 rounded-xl cursor-pointer hover:border-[#383e56] focus:outline-none focus:border-[#10e57a]"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.date})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#949eb5] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <Link
            href="/run"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#10e57a] hover:bg-[#0cd06d] text-black font-bold text-xs uppercase tracking-wide transition-all shadow-[0_0_15px_rgba(16,229,122,0.3)]"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>New Run</span>
          </Link>
        </div>
      </div>

      {/* TOP SUMMARY METRICS DECK */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Avg Cadence */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-1">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-medium uppercase tracking-wider">Average Cadence</span>
            <Activity className="w-4 h-4 text-[#10e57a]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-extrabold font-mono text-[#10e57a]">{activeSession.avgCadence}</span>
            <span className="text-sm font-semibold text-[#949eb5]">SPM</span>
          </div>
          <p className="text-[11px] text-[#949eb5] pt-1">
            Peak Turnover: <strong className="text-white font-mono">{activeSession.peakCadence} SPM</strong>
          </p>
        </div>

        {/* Metric 2: Avg Pace */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-1">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-medium uppercase tracking-wider">Average Pace</span>
            <Clock className="w-4 h-4 text-[#06b6d4]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-extrabold font-mono text-white">{activeSession.avgPace}</span>
            <span className="text-sm font-semibold text-[#949eb5]">/km</span>
          </div>
          <p className="text-[11px] text-[#949eb5] pt-1">
            Duration: <strong className="text-white font-mono">{formatTime(activeSession.durationSeconds)}</strong>
          </p>
        </div>

        {/* Metric 3: Total Distance */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-1">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-medium uppercase tracking-wider">Session Distance</span>
            <Flag className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-extrabold font-mono text-white">{activeSession.distanceKm}</span>
            <span className="text-sm font-semibold text-[#949eb5]">KM</span>
          </div>
          <p className="text-[11px] text-[#949eb5] pt-1">
            Category: <strong className="text-white">{activeSession.workoutType}</strong>
          </p>
        </div>

        {/* Metric 4: Music Sync Efficiency */}
        <div className="p-5 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-1">
          <div className="flex items-center justify-between text-[#949eb5]">
            <span className="text-xs font-medium uppercase tracking-wider">Harmonic Lock</span>
            <Sparkles className="w-4 h-4 text-[#10e57a]" />
          </div>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-3xl font-extrabold font-mono text-[#10e57a]">
              {activeSession.avgCompatibilityScore}%
            </span>
          </div>
          <p className="text-[11px] text-[#949eb5] pt-1">
            Optimal Stride Energy Coupling
          </p>
        </div>
      </div>

      {/* AI PERFORMANCE SUMMARY & MOST COMPATIBLE TRACK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Performance Summary (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#10e57a]" />
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">
              AI Coach Biomechanical Debrief
            </h3>
          </div>
          <p className="text-sm text-[#f4f5f8] leading-relaxed bg-[#1a1d28] p-4 rounded-xl border border-[#262a3b]">
            {activeSession.aiCoachSummary}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#949eb5] pt-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10e57a]" />
              Zero cadence sag during lactate transitions
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#06b6d4]" />
              Harmonic 2:1 half-time efficiency verified
            </span>
          </div>
        </div>

        {/* Most Compatible Track Highlight (1 col) */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-3">
          <div className="flex items-center gap-2 text-[#949eb5]">
            <Award className="w-4 h-4 text-[#f59e0b]" />
            <h3 className="font-bold text-white text-xs uppercase tracking-wider">
              Most Compatible Track
            </h3>
          </div>

          <div className="p-4 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[#06b6d4]">
                {activeSession.mostCompatibleTrack.bpm} BPM
              </span>
              <span className="text-xs font-mono font-bold text-[#10e57a]">
                {activeSession.mostCompatibleTrack.score}% Match
              </span>
            </div>
            <h4 className="text-base font-bold text-white">
              {activeSession.mostCompatibleTrack.name}
            </h4>
            <p className="text-xs text-[#949eb5]">
              {activeSession.mostCompatibleTrack.artist}
            </p>
            <div className="pt-2 border-t border-[#262a3b] text-[11px] text-[#949eb5] font-mono">
              Relationship: <strong className="text-white">{activeSession.mostCompatibleTrack.relationship}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* VISUAL CHARTS SECTION */}
      <div className="space-y-6">
        {/* CHART 1: CADENCE OVER TIME (Recharts) */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Cadence Over Time (SPM)
              </h3>
              <p className="text-xs text-[#949eb5]">
                Stride frequency timeline vs target aerobic zone (green threshold)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#10e57a]">
                <span className="w-2.5 h-0.5 bg-[#10e57a]" /> Live Cadence
              </span>
              <span className="flex items-center gap-1.5 text-[#06b6d4]">
                <span className="w-2.5 h-0.5 bg-[#06b6d4] border-dashed" /> Target Base (168 SPM)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262a3b" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#6b7794" fontSize={11} tickLine={false} />
                <YAxis domain={[140, 195]} stroke="#6b7794" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#12141c", borderColor: "#262a3b", borderRadius: "12px", fontSize: "12px" }}
                  labelStyle={{ color: "#949eb5" }}
                  formatter={(val: any) => [`${val ?? 0} SPM`, "Cadence"]}
                />
                <Line
                  type="monotone"
                  dataKey="cadence"
                  stroke="#10e57a"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#10e57a" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="targetCadence"
                  stroke="#06b6d4"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: MUSIC HARMONIC COMPATIBILITY OVER TIME */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Musical Harmonic Compatibility (%)
              </h3>
              <p className="text-xs text-[#949eb5]">
                How closely playback tempo maintained acoustic lock across stride shifts
              </p>
            </div>
            <span className="text-xs font-mono text-[#10e57a] font-semibold">
              Average: {activeSession.avgCompatibilityScore}%
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="compatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10e57a" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10e57a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262a3b" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="#6b7794" fontSize={11} tickLine={false} />
                <YAxis domain={[50, 100]} stroke="#6b7794" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#12141c", borderColor: "#262a3b", borderRadius: "12px", fontSize: "12px" }}
                  labelStyle={{ color: "#949eb5" }}
                  formatter={(val: any) => [`${val ?? 0}% Sync`, "Compatibility"]}
                />
                <Area
                  type="monotone"
                  dataKey="compatibility"
                  stroke="#10e57a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#compatGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CADENCE ZONE DISTRIBUTION */}
        <div className="p-6 rounded-2xl bg-[#12141c] border border-[#262a3b] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Time in Cadence Zones
              </h3>
              <p className="text-xs text-[#949eb5]">
                Biomechanical duration spent across turnover training zones
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {activeSession.cadenceZones.map((z, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#1a1d28] border border-[#262a3b] space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{z.zoneName}</span>
                  <span className="font-mono text-xs font-bold" style={{ color: z.color }}>
                    {z.percentage}%
                  </span>
                </div>
                <div className="text-[11px] font-mono text-[#949eb5]">{z.range}</div>
                <div className="w-full bg-[#12141c] h-2 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${z.percentage}%`, backgroundColor: z.color }}
                  />
                </div>
                <div className="text-[10px] text-[#6b7794] font-mono pt-1">
                  {formatTime(z.seconds)} duration
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PerformanceInsightsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-white">Loading insights...</div>}>
      <InsightsContent />
    </Suspense>
  );
}
