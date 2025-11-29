const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

let baseline = Math.floor(Math.random() * (75 - 69 + 1)) + 69;
let hr = baseline;
let spike = false;
let spikeProgress = 0;

// Update HR continuously every 500 ms
setInterval(() => {
  if (spike) {
    // Simulate a rising spike
    if (spikeProgress < 20) {
      hr += Math.random() * 2;         // climb gradually
      spikeProgress++;
    } else {
      spike = false;
      spikeProgress = 0;
    }
  } else {
    // Normal baseline with slight jitter
    hr = baseline + (Math.random() * 10 - 5);
  }
}, 500);

// Endpoint the watch will call
app.get("/hr", (req, res) => {
  res.json({ hr: Math.round(hr) });
});

// Trigger the spike
app.post("/spike", (req, res) => {
  spike = true;
  res.json({ message: "Spike triggered" });
});

app.listen(PORT, () =>
  console.log(`✅ HR Simulator running on port ${PORT}`)
);
