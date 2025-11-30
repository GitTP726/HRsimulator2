const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// --- Helper functions ---
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function smoothStep(current, target, factor = 0.1) {
  return current + (target - current) * factor;
}

// --- Core state ---
let baseline = rand(69, 75);
let hr = baseline;
let targetHR = baseline;
let mode = "normal";
let timeInState = 0;

// --- Reset spike mode ---
function resetToNormal() {
  mode = "normal";
  timeInState = 0;
  console.log("Returning to normal baseline...");
}

// --- Main HR update loop ---
setInterval(() => {
  timeInState += 0.5;
  const now = Date.now() / 1000;

  switch (mode) {
    // NORMAL — gentle natural fluctuation
    case "normal": {
      const breathing = Math.sin((2 * Math.PI * now) / 12) * 2; // ±2 BPM breathing
      const jitter = (Math.random() - 0.5) * 2; // ±1 BPM noise
      targetHR = baseline + breathing + jitter;
      hr = smoothStep(hr, targetHR, 0.15);
      break;
    }

    // LOUD NOISE — sudden +15 BPM spike
    case "loud": {
      if (timeInState <= 10) targetHR = baseline + 15;     // rise ≤10s
      else if (timeInState <= 30) targetHR = baseline;     // recover by 30s
      else resetToNormal();
      hr = smoothStep(hr, targetHR, 0.2);
      break;
    }

    // PERSISTENT NOISE — slow +10 BPM over 60s, hold, then recover
    case "persistent": {
      if (timeInState <= 60) targetHR = baseline + (timeInState / 60) * 10; // ramp up 60s
      else if (timeInState <= 120) targetHR = baseline + 10;                // hold 60s
      else if (timeInState <= 180) targetHR = baseline;                     // recover 60s
      else resetToNormal();
      hr = smoothStep(hr, targetHR, 0.1);
      break;
    }
  }
}, 500);

// --- API endpoints ---
app.get("/hr", (req, res) => {
  res.json({ hr: Math.round(hr), baseline, mode });
});

app.post("/spike/:type", (req, res) => {
  const { type } = req.params;
  if (type === "loud") {
    mode = "loud";
    timeInState = 0;
    console.log("LOUD spike triggered");
  } else if (type === "persistent") {
    mode = "persistent";
    timeInState = 0;
    console.log("PERSISTENT spike triggered");
  }
  res.json({ success: true, mode });
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HR Simulator running on port ${PORT}`));
