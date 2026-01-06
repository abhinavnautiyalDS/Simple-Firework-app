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

const BURN_DURATION = 15000; // 15 seconds

/* ======================
   CANVAS RESIZE
====================== */
function resizeCanvas() {
  canvas.width = canvas.clientWidth * window.devicePixelRatio;
  canvas.height = canvas.clientHeight * window.devicePixelRatio;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

/* ======================
   BUTTONS
====================== */
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

  // Multiple ignition points
  burnPoints = Array.from({ length: 3 }).map(() => ({
    x: Math.random() * canvas.clientWidth,
    y: Math.random() * canvas.clientHeight,
    r: 6
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

  /* 🔥 Charred edge */
  burnPoints.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(60,30,10,0.8)";
    ctx.lineWidth = 4;
    ctx.stroke();
  });

  /* 🔥 Erosion with jagged edges */
  if (progress > 0.08) {
    ctx.globalCompositeOperation = "destination-out";

    burnPoints.forEach(p => {
      ctx.beginPath();
      const steps = 40;

      for (let i = 0; i <= steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const noise = Math.random() * 8;
        const r = p.r + noise;

        const x = p.x + Math.cos(angle) * r;
        const y = p.y + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.fill();

      p.r += 0.25;               // slow burn
      p.r = Math.min(p.r, 220);  // prevent giant holes
    });

    ctx.globalCompositeOperation = "source-over";
  }

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
  ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
}

function drawText() {
  ctx.font = "48px Caveat";
  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.fillText(
    input.value,
    canvas.clientWidth / 2,
    canvas.clientHeight / 2
  );
}

/* 🔥 Edge flames */
function drawFlames() {
  burnPoints.forEach(p => {
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = p.r + Math.random() * 6;

      const x = p.x + Math.cos(angle) * r;
      const y = p.y + Math.sin(angle) * r;

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,180,40,0.35)";
      ctx.fill();
    }
  });
}

/* ======================
   ASH
====================== */
function spawnAsh() {
  if (Math.random() < 0.25) {
    ashes.push({
      x: Math.random() * canvas.clientWidth,
      y: Math.random() * canvas.clientHeight,
      vy: Math.random() * 1.2 + 0.4,
      a: 1
    });
  }
}

function updateAsh() {
  ashes.forEach(p => {
    p.y += p.vy;
    p.a -= 0.012;
    ctx.fillStyle = `rgba(160,16
