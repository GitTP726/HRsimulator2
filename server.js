const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

let baseline = Math.floor(Math.random() * (75 - 69 + 1)) + 69;
let hr = baseline;
let targetHR = baseline;
let mode = "normal"; // "normal", "loud", "persistent"
let timeInState = 0;

function smoothStep(current, target, factor = 0.08) {
  return current + (target - current) * factor;
}

setInterval(() => {
  timeInState += 0.5; // update every 500 ms

  switch (mode) {
    case "normal":
      if (timeInState < 120) {
        // baseline learning
        hr = smoothStep(hr, baseline + (Math.random() * 2 - 1), 0.1);
      } else {
        const drift = Math.random() * 0.2 - 0.1;
        targetHR = baseline + drift;
        hr = smoothStep(hr, targetHR, 0.1);
      }
      break;

    case "loud":
      if (timeInState <= 10) targetHR = baseline + 15;          // rise
      else if (timeInState <= 30) targetHR = baseline;          // recover
      else resetToNormal();
      hr = smoothStep(hr, targetHR, 0.2);
      break;

    case "persistent":
      if (timeInState <= 60) targetHR = baseline + (timeInState / 60) * 10; // slow climb
      else if (timeInState <= 120) targetHR = baseline + 10;                // sustain
      else if (timeInState <= 180) targetHR = baseline;                     // recover
      else resetToNormal();
      hr = smoothStep(hr, targetHR, 0.1);
      break;
  }

}, 500);

function resetToNormal() {
  mode = "normal";
  timeInState = 0;
  targetHR = baseline;
}

// API endpoints
app.get("/hr", (req, res) => {
  res.json({ hr: Math.round(hr), mode, baseline });
});

app.post("/spike/loud", (req, res) => {
  mode = "loud";
  timeInState = 0;
  res.json({ message: "Loud noise spike triggered" });
});

app.post("/spike/persistent", (req, res) => {
  mode = "persistent";
  timeInState = 0;
  res.json({ message: "Persistent noise spike triggered" });
});

app.post("/reset", (req, res) => {
  baseline = Math.floor(Math.random() * (75 - 69 + 1)) + 69;
  mode = "normal";
  timeInState = 0;
  targetHR = baseline;
  res.json({ message: "Baseline reset", newBaseline: baseline });
});

app.listen(PORT, () => console.log(`✅ HR simulator running on port ${PORT}`));
