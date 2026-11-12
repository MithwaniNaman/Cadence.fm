import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";
import { AudioPlayerProvider } from "@/lib/audio-player-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cadence.fm · Intelligent Running Music Companion",
  description: "Find your rhythm. Own your run. Match music tempo to athlete running cadence, pace, and workout intensity.",
  keywords: ["running music", "cadence engine", "SPM tempo match", "endurance runner", "marathon training", "strava music"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col bg-[#090a0f] text-[#f4f5f8]">
        <AudioPlayerProvider>
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
          <AudioPlayerBar />
          <Footer />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
