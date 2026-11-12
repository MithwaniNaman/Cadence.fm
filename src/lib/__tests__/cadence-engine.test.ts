import { calculateCadenceMatch, estimatePaceFromCadence } from "../cadence-engine";
import { Track } from "../music-catalogue";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log("⚡ Testing Cadence Engine Algorithm...");

// Test 1: Exact 1:1 match (170 SPM vs 170 BPM)
const track170: Track = {
  id: "test-170",
  name: "Direct Beat",
  artist: "Tester",
  album: "Test Album",
  bpm: 170,
  genre: "Electronic",
  duration: "3:30",
  durationSec: 210,
  artwork: "",
  mood: "High Energy",
  energyLevel: 8,
};

const result1 = calculateCadenceMatch(170, track170);
assert(result1.score >= 95, "Direct match score should be >= 95");
assert(result1.relationship === "direct", "Direct match relationship should be 'direct'");
assert(result1.effectiveBpmDiff === 0, "BPM diff should be 0");
assert(result1.isPhaseLocked === true, "Should be phase locked");
console.log("✓ Test 1 Passed: Exact 1:1 match:", result1.explanation);

// Test 2: Half-time match (170 SPM vs 85 BPM) - Core requirement in prompt!
const track85: Track = {
  id: "test-85",
  name: "Half Time Groove",
  artist: "HipHop Master",
  album: "Low End",
  bpm: 85,
  genre: "Hip-Hop",
  duration: "3:40",
  durationSec: 220,
  artwork: "",
  mood: "Steady State",
  energyLevel: 7,
};

const result2 = calculateCadenceMatch(170, track85);
assert(result2.relationship === "half-time", "85 BPM for 170 SPM must be half-time");
assert(result2.effectiveBpmDiff === 0, "Effective diff for 85*2 vs 170 should be 0");
assert(result2.score >= 95, "Half-time exact match should score >= 95");
console.log("✓ Test 2 Passed: Half-time match (85 BPM @ 170 SPM):", result2.explanation);

// Test 3: Realistic slight variation (168 SPM vs 85 BPM)
const result3 = calculateCadenceMatch(168, track85);
assert(result3.relationship === "half-time", "Should identify half-time");
assert(result3.effectiveBpmDiff === 2, "Difference should be 2 BPM");
assert(result3.score >= 90, "Close half-time match should score >= 90");
console.log("✓ Test 3 Passed: Close half-time match (85 BPM @ 168 SPM):", result3.explanation);

// Test 4: Running Pace calculation
const pace170 = estimatePaceFromCadence(170);
console.log(`✓ Test 4 Passed: 170 SPM -> Pace ${pace170.paceFormatted} min/km, Speed ${pace170.speedKmh} km/h`);
assert(pace170.paceSecondsPerKm > 200 && pace170.paceSecondsPerKm < 450, "Pace should be realistic recreational running range");

console.log("🎉 All Cadence Engine tests passed successfully!");
