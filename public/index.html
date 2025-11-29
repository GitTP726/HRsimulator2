const hrDisplay = document.getElementById("hr");
const baselineDisplay = document.getElementById("baseline");
const btnLoud = document.getElementById("btnLoud");
const btnPersistent = document.getElementById("btnPersistent");
const btnReset = document.getElementById("btnReset");
const ctx = document.getElementById("hrChart").getContext("2d");

const data = {
  labels: [],
  datasets: [{
    label: 'Heart Rate (BPM)',
    data: [],
    borderColor: '#d92332',
    backgroundColor: 'rgba(217,35,50,0.2)',
    borderWidth: 2,
    tension: 0.3,
    pointRadius: 0
  }]
};

const chart = new Chart(ctx, {
  type: 'line',
  data,
  options: {
    scales: {
      x: { display: false },
      y: { suggestedMin: 50, suggestedMax: 130, title: { display: true, text: "BPM" } }
    },
    plugins: { legend: { display: false } }
  }
});

let spikeActive = false;

async function updateHR() {
  try {
    const res = await fetch("/hr");
    const json = await res.json();
    const hr = json.hr;
    const mode = json.mode;
    const baseline = json.baseline;

    hrDisplay.textContent = `${hr} BPM`;
    baselineDisplay.textContent = `Baseline: ${baseline} BPM`;

    const now = new Date().toLocaleTimeString();
    data.labels.push(now);
    data.datasets[0].data.push(hr);
    if (data.labels.length > 30) { data.labels.shift(); data.datasets[0].data.shift(); }
    chart.update("none");

    if (mode !== "normal") {
      spikeActive = true;
      if (mode === "loud") btnLoud.classList.add("active");
      if (mode === "persistent") btnPersistent.classList.add("active");
      btnLoud.disabled = true;
      btnPersistent.disabled = true;
      btnReset.disabled = true;
    } else if (spikeActive) {
      spikeActive = false;
      btnLoud.classList.remove("active");
      btnPersistent.classList.remove("active");
      btnLoud.disabled = false;
      btnPersistent.disabled = false;
      btnReset.disabled = false;
    }

  } catch (err) {
    hrDisplay.textContent = "Error fetching data";
  }
}

async function triggerSpike(type) {
  await fetch(`/spike/${type}`, { method: "POST" });
}

async function resetBaseline() {
  btnReset.disabled = true;
  btnLoud.disabled = true;
  btnPersistent.disabled = true;
  await fetch("/reset", { method: "POST" });
  setTimeout(() => {
    btnReset.disabled = false;
    btnLoud.disabled = false;
    btnPersistent.disabled = false;
  }, 3000);
}

setInterval(updateHR, 1000);
