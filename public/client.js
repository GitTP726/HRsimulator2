const hrDisplay = document.getElementById("hr");

async function updateHR() {
  try {
    const res = await fetch("/hr");
    const data = await res.json();
    hrDisplay.textContent = data.hr + " BPM";
  } catch (err) {
    hrDisplay.textContent = "Error";
  }
}

async function triggerSpike() {
  await fetch("/spike", { method: "POST" });
}

setInterval(updateHR, 1000);
