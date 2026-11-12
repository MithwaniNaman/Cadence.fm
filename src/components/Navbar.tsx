"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  Activity, 
  Disc3, 
  Play, 
  BarChart3, 
  User, 
  Sparkles, 
  Menu, 
  X,
  Target,
  Watch
} from "lucide-react";
import { cn } from "@/lib/utils";
import { loadUserProfile, UserProfile } from "@/lib/user-store";

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(loadUserProfile());
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Activity },
    { href: "/studio", label: "Playlist Studio", icon: Disc3 },
    { 
      href: "/run", 
      label: "Live Simulator", 
      icon: Play,
      isLive: true 
    },
    { href: "/watch", label: "Apple Watch", icon: Watch },
    { href: "/insights", label: "Insights", icon: BarChart3 },
    { href: "/pm", label: "PM Strategy", icon: Sparkles },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#262a3b]/80 bg-[#090a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#12141c] to-[#1a1d28] border border-[#262a3b] group-hover:border-[#10e57a]/60 transition-colors">
              <div className="flex items-end gap-[3px] h-4">
                <span className="w-1 bg-[#10e57a] rounded-full h-2 animate-beat-1" />
                <span className="w-1 bg-[#10e57a] rounded-full h-4 animate-beat-2" />
                <span className="w-1 bg-[#10e57a] rounded-full h-3 animate-beat-3" />
                <span className="w-1 bg-[#10e57a] rounded-full h-1.5 animate-beat-4" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
                Cadence<span className="text-[#10e57a]">.fm</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#949eb5] font-semibold -mt-1">
                Athletic Rhythm Engine
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                    isActive
                      ? "text-[#10e57a] bg-[#10e57a]/10 font-semibold"
                      : "text-[#949eb5] hover:text-white hover:bg-[#1a1d28]/60"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-[#10e57a]" : "text-[#949eb5]")} />
                  <span>{link.label}</span>
                  {link.isLive && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10e57a] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10e57a]"></span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#12141c] border border-[#262a3b] text-xs font-mono text-[#949eb5]">
              <Target className="w-3.5 h-3.5 text-[#10e57a]" />
              <span>Target: <strong className="text-white">{profile?.typicalCadence || 168} SPM</strong></span>
            </div>

            <Link
              href="/run"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10e57a] hover:bg-[#0cd06d] text-black font-semibold text-xs tracking-wide uppercase transition-all shadow-[0_0_15px_rgba(16,229,122,0.3)] hover:shadow-[0_0_20px_rgba(16,229,122,0.45)]"
            >
              <Play className="w-3.5 h-3.5 fill-black" />
              <span>Start Run</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-[#949eb5] hover:text-white hover:bg-[#1a1d28] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden border-b border-[#262a3b] bg-[#0c0e14] px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium",
                  isActive
                    ? "text-[#10e57a] bg-[#10e57a]/10"
                    : "text-[#949eb5] hover:text-white hover:bg-[#1a1d28]"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.isLive && (
                  <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-[#10e57a]/20 text-[#10e57a]">
                    Simulator
                  </span>
                )}
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/run"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#10e57a] text-black font-semibold text-sm"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Launch Live Simulator</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
