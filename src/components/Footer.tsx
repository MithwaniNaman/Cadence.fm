"use client";

import Link from "next/link";
import { ShieldCheck, HeartPulse, Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#262a3b]/80 bg-[#090a0f] text-[#949eb5] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#10e57a]" />
              <span className="font-bold text-white text-base tracking-tight">Cadence.fm</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1a1d28] text-[#10e57a] border border-[#262a3b]">
                MVP v1.0
              </span>
            </div>
            <p className="text-sm text-[#949eb5] max-w-md leading-relaxed">
              An intelligent music companion for endurance athletes. Synthesizing biomechanical stride frequency with harmonic tempo modulation to eliminate cadence collapse.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-[#6b7794]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10e57a]" />
                Simulated Telemetry Mode
              </span>
              <span className="flex items-center gap-1.5">
                <HeartPulse className="w-3.5 h-3.5 text-[#06b6d4]" />
                Harmonic 1:1 & 2:1 Match
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#f59e0b]" />
                Web Audio Engine
              </span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Application</h4>
            <ul className="space-y-2">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/studio" className="hover:text-white transition-colors">Playlist Studio</Link></li>
              <li><Link href="/run" className="hover:text-[#10e57a] transition-colors">Live Run Simulator</Link></li>
              <li><Link href="/watch" className="hover:text-white transition-colors">Apple Watch Ultra</Link></li>
              <li><Link href="/insights" className="hover:text-white transition-colors">Performance Insights</Link></li>
              <li><Link href="/profile" className="hover:text-white transition-colors">Athlete Profile</Link></li>
            </ul>
          </div>

          {/* Product Strategy */}
          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Product Vision</h4>
            <ul className="space-y-2">
              <li><Link href="/pm" className="hover:text-[#10e57a] transition-colors">North Star Metrics</Link></li>
              <li><Link href="/pm#persona" className="hover:text-white transition-colors">User Persona & Pain Point</Link></li>
              <li><Link href="/pm#hypothesis" className="hover:text-white transition-colors">Core Hypothesis</Link></li>
              <li><Link href="/pm#roadmap" className="hover:text-white transition-colors">Future Roadmap (Strava/BLE)</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1a1d28] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#6b7794]">
          <p>© 2026 Cadence.fm · Designed & Engineered for Endurance Athletes.</p>
          <div className="flex items-center gap-3 font-mono">
            <span>Find your rhythm.</span>
            <span className="text-[#10e57a]">Own your run.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
