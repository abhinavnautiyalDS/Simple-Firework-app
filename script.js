const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const btn = document.getElementById("beginBtn");
const input = document.getElementById("nameInput");
const fireSound = document.getElementById("fireSound");
const ending = document.getElementById("ending");

let burnRadius = 0;
let burning = false;
let ashes = [];

btn.onclick = () => {
  if (!input.value.trim()) return;

  start();
};

function start() {
  burnRadius = 0;
  ashes = [];
  burning = true;

  fireSound.currentTime = 0;
  fireSound.play();

  if (navigator.vibrate) {
    navigator.vibrate([100, 50, 100]);
  }

  requestAnimationFrame(loop);
}

function loop() {
  if (!burning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Paper
  ctx.fillStyle = "#f5f1e8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text
  ctx.font = "48px Caveat";
  ctx.fillStyle = "#111";
  ctx.textAlign = "center";
  ctx.fillText(input.value, canvas.width / 2, canvas.height / 2);

  // Burn mask
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(0, canvas.height, burnRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = "source-over";

  // Fire glow
  drawFire(burnRadius);

  // Ash
  spawnAsh();
  updateAsh();

  burnRadius += 2;

  if (burnRadius < 900) {
    requestAnimationFrame(loop);
  } else {
    endScene();
  }
}

function drawFire(r) {
  ctx.beginPath();
  ctx.arc(0, canvas.height, r + 15, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,120,0,0.25)";
  ctx.fill();
}

function spawnAsh() {
  if (Math.random() < 0.3) {
    ashes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vy: Math.random() * 1 + 0.5,
      a: 1
    });
  }
}

function updateAsh() {
  ashes.forEach(p => {
    p.y += p.vy;
    p.a -= 0.01;

    ctx.fillStyle = `rgba(180,180,180,${p.a})`;
    ctx.fillRect(p.x, p.y, 2, 2);
  });

  ashes = ashes.filter(p => p.a > 0);
}

function endScene() {
  burning = false;
  ending.style.opacity = 1;
}
