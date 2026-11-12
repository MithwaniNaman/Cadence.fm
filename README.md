# Cadence.fm ⚡
### Intelligent Running Music Companion for Endurance Athletes

> **"Find your rhythm. Own your run."**  
> An intelligent running music companion that matches music tempo to an athlete's running cadence, pace, and workout intensity.

---

## 🏃 Product Vision & The Problem

Runners frequently train with music, yet standard streaming playlists are static and indifferent to human locomotion biomechanics. When an 80 BPM ballad follows a 170 BPM anthem, stride frequency suffers subconscious neuromuscular braking—leading to cadence collapse, running inefficiency, and premature fatigue.

**Cadence.fm bridges this gap.** It continuously harmonizes musical tempo with biomechanical stride frequency across direct (1:1), half-time (2:1), and double-time (1:2) relationships.

---

## 🚀 Core Features

### 1. The Cadence Engine (Core Differentiator)
- **Mathematical Harmonic Matching**:
  - Direct 1:1 match (e.g., 170 SPM cadence ↔ 170 BPM track)
  - Natural Half-time 2:1 groove (e.g., 170 SPM cadence ↔ 85 BPM track in hip-hop, grunge, or metal breakdowns)
  - Double-time 1:2 stride turnover (e.g., 90 SPM ↔ 180 BPM drum-and-bass)
- **Intelligent Compatibility Scoring (0–100%)**:
  - Non-linear penalty curve for frequency delta
  - Dynamic tolerance scoring (sub-2% delta triggers phase lock)
  - Detailed musical explanations for every recommendation
- **Built-in Web Audio Procedural Synthesizer**:
  - Generates authentic, rhythmic kick/snare/hi-hat beats at the exact BPM of each track directly in the browser—allowing auditory rhythm verification without external copyright issues.

### 2. Smart Playlist Generator (Workout Progressions)
Supports 5 distinct workout structures:
1. **Easy Recovery Run** (Warmup → Aerobic Cruise → Gentle Recovery)
2. **Lactate Threshold Tempo** (Progressive Warmup → Threshold Crucible → Flushing Cooldown)
3. **High-Cadence Intervals** (Activation → VO2 Surge 1 → Active Float → VO2 Surge 2 → Flush)
4. **Long Endurance Run** (Warmup → Settling In → Sustained Effort → Final Push → Cooldown)
5. **Race Day PR Effort** (Corral Focus → Even-Split Lock → Negative Split Kick → Medal Lap)
- Generates 15–20 tracks using a seeded 45+ track catalogue across Alternative Rock, Grunge, Metal, Electronic, Indie, and Hip-Hop.
- Fully configurable tempo progression bands.

### 3. Live Run Simulator (Cockpit Experience)
- **Real-Time Dynamic Telemetry**:
  - Instantaneous Cadence (SPM), Pace (min/km), Distance (km), Elapsed Time
  - Phase Lock indicator: *Phase Locked (Green)*, *In Rhythm (Cyan)*, *Slipping (Amber)*, *Mismatch Detected (Rose)*
- **Interactive Stride Modulation**:
  - Presets: 155 SPM (Start), 165 SPM (Aerobic Rise), 150 SPM (Hill / Sag), 175 SPM (Sprint Surge)
  - Continuous stride slider (140–190 SPM)
  - "Auto-Tour" script for automatic step-by-step interview demonstration
  - 1x, 2x, 5x simulation clock speeds
- **Real-time Adaptive Recommendations**:
  - Dynamically alerts when cadence shifts and recommends immediate track switches to restore 95%+ phase lock.
- **Triumphant Completion Flow**:
  - Confetti celebration and seamless transition to Performance Insights.

### 4. Performance Insights & Biomechanical Telemetry
- Interactive Recharts visual analytics:
  - Cadence timeline (SPM) with target base threshold overlay
  - Musical Harmonic Compatibility timeline (%)
  - Time in Cadence Zones distribution bar chart
- AI Coach Debrief summarizing biomechanical cadence retention through workout transitions.

### 5. Product Management Strategy Hub (`/pm`)
- **North Star Metric (NSM)**: Weekly Successful Music-Assisted Workouts (WSMAW)
- Supporting metrics: Playlist-to-Workout Conversion, Completion Rate, Avg Compatibility Score, WAU, Repeat Workout Rate.
- User Persona (Alex Chen, 32yo half-marathoner) & Core Pain Point analysis.
- MVP scope vs Post-MVP Horizon Roadmap (Spotify Web Playback SDK, Web Bluetooth BLE Footpod / Stryd API, Apple Watch & Garmin Connect IQ).

---

## 🛠️ Technical Architecture

- **Framework**: Next.js 16 (App Router with Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Dark-first aesthetic, Electric Lime `#10E57A`, Obsidian `#090A0F`)
- **Icons**: Lucide React
- **Audio**: Web Audio API Procedural Rhythm Synthesizer
- **Charts**: Recharts
- **State & Storage**: React Context + Browser LocalStorage persistence

---

## 💻 Running the Application Locally

```bash
# 1. Install dependencies
npm install

# 2. Run unit tests
npm test

# 3. Build for production
npm run build

# 4. Start local development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧭 Interview Demonstration Flow

1. **Landing Page (`/`)**: Walk through the product vision and drag the Interactive Cadence Matcher slider (150 → 175 SPM). Click "Hear Beat Lock" to hear the procedural beat synthesizer.
2. **Dashboard (`/dashboard`)**: Show weekly athlete telemetry, quick workout selection, and active playlist status.
3. **Playlist Studio (`/studio`)**: Select "Long Endurance Run", adjust target cadence to 170 SPM, select genres (Electronic + Rock), inspect progression stages, and click "Run With This Set".
4. **Live Run Simulator (`/run`)**:
   - Click "Start Live Session" (the Web Audio engine starts pulsing at 155 SPM).
   - Click the "165 SPM" preset → observe tempo match adjusting.
   - Click the "150 SPM" preset → notice the system detects the cadence sag and surfaces an adaptive recommendation.
   - Click "175 SPM" → observe the surge and click "Switch Now" to lock into a 175 BPM track!
   - Click "Complete & Insights" (confetti fires).
5. **Insights (`/insights`)**: Inspect the Cadence Over Time chart, Harmonic Compatibility curve, zone breakdowns, and AI Coach Debrief.
6. **PM Strategy (`/pm`)**: Walk through the North Star Metric framework, user persona, and post-MVP hardware/SDK roadmap.
