const hrDisplay = document.getElementById("hr");
const baselineDisplay = document.getElementById("baseline");
const btnLoud = document.getElementById("btnLoud");
const btnPersistent = document.getElementById("btnPersistent");
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

async function updateHR() {
  try {
    const res = await fetch("/hr");
    const json = await res.json();

    hrDisplay.textContent = `${json.hr} BPM`;
    baselineDisplay.textContent = `Baseline: ${json.baseline} BPM`;

    const now = new Date().toLocaleTimeString();
    data.labels.push(now);
    data.datasets[0].data.push(json.hr);

    if (data.labels.length > 30) {
      data.labels.shift();
      data.datasets[0].data.shift();
    }

    chart.update("none");
  } catch (err) {
    hrDisplay.textContent = "Error fetching data";
  }
}

btnLoud.onclick = () => fetch("/spike/loud", { method: "POST" });
btnPersistent.onclick = () => fetch("/spike/persistent", { method: "POST" });

setInterval(updateHR, 1000);
