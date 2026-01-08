const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const input = document.getElementById("nameInput");
const beginBtn = document.getElementById("beginBtn");
const resetBtn = document.getElementById("resetBtn");
const fireSound = document.getElementById("fireSound");
const ending = document.getElementById("ending");






let burning = false;
let burnPoints = [];
let ashes = [];
let smoke = [];
let startTime = null;

const BURN_DURATION = 30000; // 15 seconds

beginBtn.onclick = () => {
  if (!input.value.trim()) return;
  startBurn();
};

resetBtn.onclick = resetAll;

/* ======================
   CORE FLOW
====================== */
function startBurn() {
  resetAll();
  burning = true;
  startTime = performance.now();

  // Multiple random ignition points
  burnPoints = Array.from({ length: 3 }).map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 4
  }));

  fireSound.currentTime = 0;
  fireSound.play();

  if (navigator.vibrate) {
    navigator.vibrate([120, 80, 120]);
  }

  requestAnimationFrame(loop);
}

function resetAll() {
  burning = false;
  burnPoints = [];
  ashes = [];
  smoke = [];
  startTime = null;
  ending.style.opacity = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/* ======================
   MAIN LOOP
====================== */
function loop(t) {
  if (!burning) return;

  const progress = Math.min((t - startTime) / BURN_DURATION, 1);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawPaper();
  drawText();

  // Burn erosion
  ctx.globalCompositeOperation = "destination-out";
  burnPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    p.r += 0.7; // slow erosion
  });
  ctx.globalCompositeOperation = "source-over";

  drawFlames();
  spawnAsh();
  updateAsh();
  spawnSmoke();
  updateSmoke();

  if (progress < 1) {
    requestAnimationFrame(loop);
  } else {
    endScene();
  }
}

/* ======================
   DRAWING
====================== */
function drawPaper() {
  ctx.fillStyle = "#f4f0e6";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawText() {
  ctx.font = "48px Caveat";
  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.fillText(input.value, canvas.width / 2, canvas.height / 2);
}

/* 🔥 Yellow flames */
function drawFlames() {
  burnPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 10, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 190, 70, 0.25)";
    ctx.fill();
  });
}

/* ======================
   ASH PARTICLES
====================== */
function spawnAsh() {
  if (Math.random() < 0.25) {
    ashes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vy: Math.random() * 1.2 + 0.4,
      a: 1
    });
  }
}

function updateAsh() {
  ashes.forEach(p => {
    p.y += p.vy;
    p.a -= 0.012;
    ctx.fillStyle = `rgba(160,160,160,${p.a})`;
    ctx.fillRect(p.x, p.y, 2, 2);
  });
  ashes = ashes.filter(p => p.a > 0);
}

/* ======================
   SMOKE PARTICLES
====================== */
function spawnSmoke() {
  if (Math.random() < 0.35) {
    smoke.push({
      x: Math.random() * canvas.width,
      y: canvas.height,
      vy: Math.random() * -0.6 - 0.2,
      r: Math.random() * 12 + 6,
      a: 0.35
    });
  }
}

function updateSmoke() {
  smoke.forEach(s => {
    s.y += s.vy;
    s.r += 0.18;
    s.a -= 0.004;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120,120,120,${s.a})`;
    ctx.fill();
  });

  smoke = smoke.filter(s => s.a > 0);
}

/* ======================
   ENDING + AUTO RESET
====================== */
function endScene() {
  burning = false;
  ending.style.opacity = 1;

  setTimeout(() => {
    resetAll();
  }, 3500);
}
