/*
 * client.js
 * 
 * This file handles the frontend logic of the HR simulator.
 * 
 * Purpose:
 * - Display live heart rate and baseline values updated every second
 * - Allow the user to call a HR trigger
 * - Update the graph using chart.js for visulization 
 */

// DOM (Document object model) element references
const hrDisplay = document.getElementById("hr"); // displays current HR value
const baselineDisplay = document.getElementById("baseline"); // Displays the HR baseline
const btnLoud = document.getElementById("btnLoud"); // Button for triggering a loud HR spike
const btnPersistent = document.getElementById("btnPersistent"); // Button for triggering a persistent HR spike
const btnReturn = document.getElementById("btnReturn"); // Button for returning HR to normal baseline
const ctx = document.getElementById("hrChart").getContext("2d"); // Canvas context for visulization

// Chart data
const data = {
  labels: [], // stores time labels
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

// chart initialization
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

    // keep chart length to the last 40 data points for smooth scrolling effect
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

// Button actions

// Loud spike
btnLoud.onclick = async () => {
  btnLoud.disabled = btnPersistent.disabled = btnReturn.disabled = true;
  await fetch("/spike/loud", { method: "POST" });
};

// persistent spike
btnPersistent.onclick = async () => {
  btnLoud.disabled = btnPersistent.disabled = btnReturn.disabled = true;
  await fetch("/spike/persistent", { method: "POST" });
};

// return to normal baseline
btnReturn.onclick = async () => {
  btnLoud.disabled = btnPersistent.disabled = btnReturn.disabled = true;
  await fetch("/return", { method: "POST" });
};

// periodic update loop
// fetches and refresh the HR data every 1 second
setInterval(updateHR, 1000);
