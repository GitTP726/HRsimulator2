const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// ---------- Helper Functions ----------
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function smoothStep(current, target, factor = 0.1) {
  return current + (target - current) * factor;
}

// ---------- State ----------
let baseline = rand(69, 75);
let hr = baseline;
let targetHR = baseline;
let mode = "normal";
let timeInState = 0;
let returning = false;

// ---------- Mode Control ----------
function resetToNormal() {
  mode = "normal";
  returning = false;
  timeInState = 0;
  console.log("✅ Returned to normal baseline");
}

function startManualReturn() {
  mode = "returning";
  returning = true;
  timeInState = 0;
  console.log("🟢 Manual return to baseline started");
}

// ---------- Main HR Loop ----------
setInterval(() => {
  timeInState += 0.5;
  const now = Date.now() / 1000;

  // base micro fluctuations for realism
  const micro = (Math.random() - 0.5) * 2;             // ±1 BPM random noise
  const breath = Math.sin((2 * Math.PI * now) / 12) * 2; // ±2 BPM slow wave

  switch (mode) {
    // -------------------------------------------------------------
    case "normal": {
      targetHR = baseline + breath + micro;
      hr = smoothStep(hr, targetHR, 0.15);
      break;
    }

    // -------------------------------------------------------------
    case "loud": {
      // +15 BPM spike in first 10s, hold until manual return
      const spike = baseline + 15;
      // add gentle jitter while elevated
      targetHR = spike + breath + micro;
      hr = smoothStep(hr, targetHR, 0.2);
      break;
    }

    // -------------------------------------------------------------
    case "persistent": {
      // gradual +10 BPM rise over 60s, hold, then return manually
      const rise =
        timeInState <= 60
          ? baseline + (timeInState / 60) * 10
          : baseline + 10;
      targetHR = rise + breath + micro;
      hr = smoothStep(hr, targetHR, 0.12);
      break;
    }

    // -------------------------------------------------------------
    case "returning": {
      // smooth recovery toward baseline with gentle fluctuation
      targetHR = baseline + micro;
      hr = smoothStep(hr, targetHR, 0.08);

      // stop once HR within ±1 BPM of baseline
      if (Math.abs(hr - baseline) < 1.0) resetToNormal();
      break;
    }
  }
}, 500);

// ---------- Endpoints ----------
app.get("/hr", (req, res) => {
  res.json({ hr: Math.round(hr), baseline, mode });
});

app.post("/spike/:type", (req, res) => {
  if (returning || mode !== "normal") return res.json({ busy: true, mode });

  const { type } = req.params;
  if (type === "loud") {
    mode = "loud";
    timeInState = 0;
    console.log("🚨 Loud noise spike triggered");
  } else if (type === "persistent") {
    mode = "persistent";
    timeInState = 0;
    console.log("🟠 Persistent noise spike triggered");
  }
  res.json({ success: true, mode });
});

app.post("/return", (req, res) => {
  if (mode !== "normal") startManualReturn();
  res.json({ success: true, mode: "returning" });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`💓 HR Simulator running on http://localhost:${PORT}`)
);
