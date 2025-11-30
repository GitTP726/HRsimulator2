const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// --- Helpers ---
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function smoothStep(current, target, factor = 0.1) {
  return current + (target - current) * factor;
}

// --- Core State ---
let baseline = rand(69, 75);
let hr = baseline;
let targetHR = baseline;
let mode = "normal";
let timeInState = 0;

// --- Reset & Recovery ---
function resetToNormal() {
  mode = "normal";
  timeInState = 0;
  console.log("Returned to normal baseline...");
}

// --- Gradual manual return ---
function startManualReturn() {
  mode = "returning";
  timeInState = 0;
  console.log("Manual return initiated...");
}

// --- Main HR update loop ---
setInterval(() => {
  timeInState += 0.5;
  const now = Date.now() / 1000;

  switch (mode) {
    // -------------------------------------------------
    case "normal": {
      const breathing = Math.sin((2 * Math.PI * now) / 12) * 2;
      const jitter = (Math.random() - 0.5) * 2;
      targetHR = baseline + breathing + jitter;
      hr = smoothStep(hr, targetHR, 0.15);
      break;
    }

    // -------------------------------------------------
    case "loud": {
      if (timeInState <= 10) targetHR = baseline + 15;
      else targetHR = baseline + 12; // sustain slightly above normal
      hr = smoothStep(hr, targetHR, 0.2);
      break;
    }

    // -------------------------------------------------
    case "persistent": {
      if (timeInState <= 60) targetHR = baseline + (timeInState / 60) * 10;
      else targetHR = baseline + 10;
      hr = smoothStep(hr, targetHR, 0.1);
      break;
    }

    // -------------------------------------------------
    case "returning": {
      // Smoothly drop HR back toward baseline over ~30 s
      targetHR = baseline;
      hr = smoothStep(hr, targetHR, 0.08);

      // once within ±1 BPM of baseline, stop returning
      if (Math.abs(hr - baseline) < 1.0) {
        resetToNormal();
      }
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

app.post("/return", (req, res) => {
  startManualReturn();
  res.json({ success: true, mode: "returning" });
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HR Simulator running on port ${PORT}`));
