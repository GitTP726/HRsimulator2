const hrDisplay = document.getElementById("hr");
const baselineDisplay = document.getElementById("baseline");
const btnLoud = document.getElementById("btnLoud");
const btnPersistent = document.getElementById("btnPersistent");
const btnReturn = document.getElementById("btnReturn");
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
      y: {
        suggestedMin: 55,
        suggestedMax: 130,
        title: { display: true, text: "BPM" }
      }
    },
    plugins: { legend: { display: false } }
  }
});

let mode = "normal";

async function updateHR() {
  try {
    const res = await fetch("/hr");
    const json = await res.json();

    mode = json.mode;
    hrDisplay.textContent = `${json.hr} BPM`;
    baselineDisplay.textContent = `Baseline: ${json.baseline} BPM`;

    // chart update
    const now = new Date().toLocaleTimeString();
    data.labels.push(now);
    data.datasets[0].data.push(json.hr);
    if (data.labels.length > 40) {
      data.labels.shift();
      data.datasets[0].data.shift();
    }
    chart.update("none");

    // Disable buttons while busy
    const busy = mode !== "normal";
    btnLoud.disabled = busy;
    btnPersistent.disabled = busy;
    btnReturn.disabled = (mode === "normal");
  } catch (err) {
    hrDisplay.textContent = "Error fetching data";
  }
}

btnLoud.onclick = async () => {
  btnLoud.disabled = btnPersistent.disabled = btnReturn.disabled = true;
  await fetch("/spike/loud", { method: "POST" });
};
btnPersistent.onclick = async () => {
  btnLoud.disabled = btnPersistent.disabled = btnReturn.disabled = true;
  await fetch("/spike/persistent", { method: "POST" });
};
btnReturn.onclick = async () => {
  btnLoud.disabled = btnPersistent.disabled = btnReturn.disabled = true;
  await fetch("/return", { method: "POST" });
};

setInterval(updateHR, 1000);
