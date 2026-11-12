# Cadence.fm ⚡
### Intelligent Running Music Companion for Endurance Athletes

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.6_Turbopack-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Dual--Engine-10E57A?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![watchOS 11](https://img.shields.io/badge/Apple_Watch-Ultra_Companion-F97316?style=for-the-badge&logo=apple)](https://www.apple.com/watch/)

> **"Find your rhythm. Own your run."**  
> An intelligent running music companion that synchronizes musical tempo with an athlete's running cadence, pace, and workout intensity to eliminate subconscious cadence collapse.

---

## 🏃 1. Product Vision & The Biomechanical Problem

### The Biomechanical Problem
Runners instinctively match their footstrike frequency (cadence in Steps Per Minute, or **SPM**) to the dominant rhythmic pulse of what they hear. However, mainstream streaming platforms (Spotify, Apple Music) curate playlists based on static genre categories or generic mood tags. When an 80 BPM downtempo ballad abruptly follows a 168 BPM anthem, a runner experiences **neuromuscular rhythm braking**:
- Unconscious deceleration and stride overstriding.
- Elevated metabolic cost ($V\text{O}_2$ inefficiency).
- Inconsistent pacing during lactate threshold and tempo efforts.

### The Cadence.fm Solution
**Cadence.fm** bridges biomechanics and music theory. It models the runner's stride frequency in real time, calculating **harmonic musical relationships** (1:1 direct stride lock, 2:1 half-time stride turnover, and 1:2 double-time sprints) with mathematical tolerance scoring. Whenever cadence shifts due to hills or fatigue, Cadence.fm's **AI Auto-DJ** seamlessly crossfades into a harmonically matched track to hold your athletic rhythm.

---

## 🧠 2. The Cadence Engine — Mathematical Stride-Tempo Matching

The core differentiator of Cadence.fm is its harmonic cadence matching algorithm (`src/lib/cadence-engine.ts`), which evaluates musical tempo against biomechanical stride frequency without naive 1:1 constraints.

### Harmonic Ratios Supported
$$\text{Delta}_{1:1} = |\text{Cadence} - \text{BPM}|$$
$$\text{Delta}_{\text{half-time}} = |\text{Cadence} - (2 \times \text{BPM})| \quad (\text{e.g. 170 SPM cadence} \leftrightarrow 85\text{ BPM hip-hop/grunge})$$
$$\text{Delta}_{\text{double-time}} = |\text{Cadence} - (\text{BPM} / 2)| \quad (\text{e.g. 90 SPM cadence} \leftrightarrow 180\text{ BPM drum & bass})$$

### Compatibility Score Calculation
$$\text{Best Delta} = \min(\text{Delta}_{1:1}, \text{Delta}_{\text{half}}, \text{Delta}_{\text{double}})$$
$$\text{Score} = \max\left(0, \text{round}\left(100 - (\text{Best Delta})^{1.35} \times 3.2\right)\right)$$

- **$\Delta \le 1.5$ BPM (Phase Locked, 95–100%)**: Optimal neuromuscular coupling; green phase lock indicator.
- **$\Delta \le 4$ BPM (In Rhythm, 80–94%)**: Natural entrainment pocket; cyan indicator.
- **$\Delta \le 8$ BPM (Slipping, 60–79%)**: Marginal synchronization; amber warning.
- **$\Delta > 8$ BPM (Cadence Mismatch, <60%)**: Rhythmic braking risk; AI Auto-DJ triggers crossfade.

---

## 🚀 3. Key Features & Modules

### 🎧 A. Dual-Engine Audio Player (Real Music + Procedural Synth)
- **HTML5 Real Music Streaming**: Integrated with high-fidelity open-source tracks across 6 genres (Alternative Rock, Metal, Electronic, Hip-Hop, Pop, Indie).
- **Procedural Web Audio API Synthesizer**: Zero-latency, browser-native multi-instrumental synthesis engine (punchy 808 kick, crisp snare, 16th-note hi-hat, saw bassline, and polyphonic arpeggiated chords in Am $\rightarrow$ F $\rightarrow$ C $\rightarrow$ G) tuned to the exact BPM of each track.
- **Instant Audio Verification**: Press Play anywhere to hear authentic audio streaming with zero configuration.

### 👟 B. 4-Click Tap-Tempo Step Cadence Detector
- **First 4 Clicks Calibration**: Tap the interactive **"Step Footstrike"** button or hit **Spacebar** 4 times in rhythm.
- **Biomechanical Calculation**:
  $$\text{Interval}_{\text{avg}} = \frac{T_4 - T_1}{3}$$
  $$\text{SPM} = \text{clamp}\left(100, 185, \text{round}\left(\frac{60000}{\text{Interval}_{\text{avg}}}\right)\right)$$
- **Instant AI Adaptation**: The AI Auto-DJ immediately computes harmonic compatibility, delivers a coaching cue, and suggests or triggers a track switch to preserve your target cadence.

### ⌚ C. Interactive Apple Watch Ultra Companion (`/watch`)
- **watchOS 11 Ultra Bezel Simulation**: High-fidelity titanium chassis with orange Action Button, Digital Crown, and sapphire display.
- **Haptic Pulse Feedback**: Real-time visual and vibrational feedback on phase lock.
- **Interactive Controls**:
  - **Rotary Digital Crown**: Drag or click to dynamically dial cadence from 110 to 180 SPM.
  - **Orange Action Button**: Instantly triggers AI Auto-Adapt to snap to the top-scoring harmonic track.
  - **Spacebar Step Detection**: Tap Spacebar 4 times on the watch page to calibrate your cadence on the fly.
  - **Screen Switcher**: Toggle between the Now Playing music controller and the Workout Metrics HUD (Heart Rate, Distance, Active Calories, Target Pace).

### 🎛️ D. Smart Playlist Generator (`/studio`)
Five calibrated workout progression curves with configurable tempo bands tailored for recreational and endurance runners:
1. **Easy Recovery Run** (Warmup 115–125 $\rightarrow$ Aerobic Cruise 125–138 $\rightarrow$ Cooldown 110–120 SPM)
2. **Lactate Threshold Tempo** (Warmup 125–135 $\rightarrow$ Threshold Crucible 145–160 $\rightarrow$ Flush 120–130 SPM)
3. **High-Cadence Intervals** (Activation 125–135 $\rightarrow$ VO2 Surge 160–175 $\rightarrow$ Active Float 130–140 SPM)
4. **Long Endurance Run** (Warmup 120–130 $\rightarrow$ Sustained Cruise 135–150 $\rightarrow$ Final Kick 150–162 SPM)
5. **Race Day PR Effort** (Corral Focus 130–140 $\rightarrow$ Even-Split Lock 148–158 $\rightarrow$ Negative Split Kick 160–172 SPM)

### 🏎️ E. Live Run Simulator Cockpit (`/run`)
- Real-time athlete telemetry HUD: Elapsed Time, Distance (km), Estimated Pace (min/km), Instantaneous Cadence (SPM), and Audio Phase Lock.
- **Interactive Controls**:
  - Quick presets: 125 SPM (Easy Warmup), 135 SPM (Aerobic Base), 145 SPM (Tempo Surge), 158 SPM (Sprint Kick).
  - Continuous Stride Slider (110–185 SPM).
  - 4-Click Step Tap button with Spacebar listener.
  - Simulation Speed multiplier (1x, 2x, 5x clock speeds).
  - "Demo Walkthrough" automated tour script for interview presentations.
- **AI Auto-DJ Crossfading**: Automatically identifies the highest-compatibility track in your queue and crossfades without dropping audio context.

### 📊 F. Performance Insights (`/insights`)
- **Biomechanical Cadence Timeline**: Real-time Recharts visualization plotting runner cadence against the target cadence line.
- **Harmonic Compatibility Timeline**: Historical tracking of music-to-stride synchronization percentage over time.
- **Cadence Zone Distribution**: Breakdown of minutes spent in Zone 1 (Recovery), Zone 2 (Aerobic Base), Zone 3 (Tempo), and Zone 4 (Threshold).
- **AI Coach Debrief**: Contextual post-run assessment of cadence stability and neuromuscular rhythm adherence.

### 💼 G. Product Manager Strategy Hub (`/pm`)
- **North Star Metric (NSM)**: Weekly Successful Music-Assisted Workouts (**WSMAW**).
- **KPI Funnel**: Onboarding Completion (84%), Playlist Generation (68%), Workout Start (52%), Cadence Retention $\ge 85\%$ (71%), 30-Day Retention (44%).
- **User Persona**: *Alex Chen* (32yo, Half-Marathoner aiming for sub-1:45, struggles with stride cadence collapse at km 16).
- **A/B Testing Framework**: Evaluating AI Dynamic Auto-Switching vs Fixed Playlist Order on user perceived exertion and cadence stability.
- **Horizon Roadmap**: Spotify Web Playback SDK, Web Bluetooth BLE Footpod (Stryd) integration, native Garmin Connect IQ / Apple Watch standalone apps.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16.4.6 (App Router + Turbopack) |
| **Runtime** | React 19 (Server & Client Components) |
| **Language** | TypeScript 5.0 (Strict mode, 100% typed) |
| **Styling** | Tailwind CSS v4 (Custom Dark-first theme `#090A0F`, Electric Lime `#10E57A`, Electric Cyan `#06B6D4`) |
| **Audio** | HTML5 Audio Streaming + Web Audio API Procedural Synthesizer |
| **Data Viz** | Recharts (Responsive Line and Bar Charts) |
| **Icons** | Lucide React |
| **Delight** | Canvas Confetti |
| **Testing** | Node.js TSX Test Runner (`npm test`) |

---

## 📁 Project Directory Structure

```text
Cadence.fm/
├── public/                     # Static assets & favicon
├── src/
│   ├── app/
│   │   ├── dashboard/          # Athlete Dashboard (weekly mileage, target cadence, recent runs)
│   │   ├── insights/           # Post-Run Analytics & Biomechanical Recharts graphs
│   │   ├── pm/                 # Product Management Strategy Hub (NSM, Funnel, Persona, Roadmap)
│   │   ├── profile/            # Athlete Profile, onboarding reset, and cadence calibrations
│   │   ├── run/                # Live Run Simulator cockpit (4-click tap, Spacebar, Auto-DJ)
│   │   ├── studio/             # Smart Playlist Generator (5 workout progression curves)
│   │   ├── watch/              # Interactive Apple Watch Ultra standalone simulator
│   │   ├── globals.css         # Tailwind CSS v4 styling & dark theme variables
│   │   ├── layout.tsx          # Root layout with AudioProvider, Navbar, and Footer
│   │   └── page.tsx            # Marketing Landing Page with live interactive preview
│   ├── components/
│   │   ├── AppleWatchSimulator.tsx  # watchOS 11 Ultra bezel, Digital Crown & Action Button
│   │   ├── AudioPlayerBar.tsx       # Global sticky audio controller with live waveform
│   │   ├── Footer.tsx               # Product footer with direct navigation links
│   │   ├── Navbar.tsx               # Navigation bar with target cadence badge & route highlighting
│   │   └── OnboardingModal.tsx      # Multi-step personalized athlete intake modal
│   └── lib/
│       ├── __tests__/
│       │   └── cadence-engine.test.ts  # Algorithmic harmonic unit tests
│       ├── audio-player-context.tsx    # React Context for synchronized audio state
│       ├── audio-synthesizer.ts        # Zero-latency Web Audio API musical rhythm engine
│       ├── cadence-engine.ts           # 1:1, 2:1, and 1:2 harmonic stride-tempo matching algorithm
│       ├── music-catalogue.ts          # Curated 45+ track catalogue across 6 athletic genres
│       ├── open-source-player.ts       # Dual-engine audio controller (HTML5 streaming + Web Audio)
│       ├── playlist-generator.ts       # Workout tempo progression generator
│       ├── user-store.ts               # LocalStorage persistence & session history
│       └── utils.ts                    # Classname merge helpers
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

## ⚡ Quick Start & Local Development

### Prerequisites
- Node.js 18+ or 20+
- npm, pnpm, or yarn

### 1. Clone the repository
```bash
git clone https://github.com/namanmithwani/Cadence.fm.git
cd Cadence.fm
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run unit tests
Verify the Cadence Engine's mathematical matching algorithm:
```bash
npm test
```
*Output: All 4 harmonic tests passing (1:1 direct lock, 2:1 half-time, tolerance window, pace calculation).*

### 4. Build for production
```bash
npm run build
```
*Output: All 11 static pages prerendered successfully with zero TypeScript or build errors.*

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 Interview Demonstration Script (2-Minute Walkthrough)

If presenting this project in a Product Management or Engineering interview:

1. **The Hook (Landing Page `/`)**:
   - Open [http://localhost:3000](http://localhost:3000). Show the value proposition: *"Find your rhythm. Own your run."*
   - Scroll through the real-time Harmonic Matching Engine explanation (1:1 lock vs 2:1 half-time groove).
2. **The 4-Click Spacebar Detection (`/run`)**:
   - Navigate to the **Live Simulator**.
   - Press the **"Step Footstrike"** button or hit the **Spacebar** 4 times at a comfortable running rhythm.
   - Watch the system dynamically calculate your cadence (e.g. 136 SPM), lock the phase indicator to green, and trigger real-time AI coach cues.
3. **The Apple Watch Ultra (`/watch` or toggle on `/run`)**:
   - Switch to the **Apple Watch Ultra** view.
   - Rotate the Digital Crown to simulate accelerating into a 160 SPM sprint.
   - Show how the sync score drops, then hit the orange **Action Button** to trigger instant AI Auto-Adapt, snapping back to a 100% matched track.
4. **Workout Playlist Studio (`/studio`)**:
   - Select the **Lactate Threshold Tempo** or **Long Run** workout.
   - Adjust the progression tempo bands and click **"Generate Adaptive Playlist"** to produce an 18-track athletic set.
5. **Product Strategy & Telemetry (`/pm`)**:
   - Open the **PM Strategy** tab to present the North Star Metric (**WSMAW**), KPI funnel metrics, and the A/B testing plan for endurance athletes.

---

## 📄 License & Attribution

Designed and engineered by **Naman Mithwani** as an intelligent athletic companion prototype.
Audio provided via Creative Commons and open-source SoundHelix test archives, paired with browser-native Web Audio procedural synthesis. Distributed under the MIT License.
