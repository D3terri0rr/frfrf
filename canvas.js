const canvas = document.getElementById("portal");
const ctx = canvas.getContext("2d");

let w, h;
let t = 0;
let running = true;
let mouseX = 0, mouseY = 0;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

window.addEventListener("mousemove", e => {
  mouseX = (e.clientX / w - 0.5) * 2;
  mouseY = (e.clientY / h - 0.5) * 2;
});

/* =========================
   DESENHO DO PERSONAGEM
========================= */

function drawHead(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = "#12001f";
  ctx.shadowBlur = 40;
  ctx.shadowColor = "#ff4fd8";
  ctx.fill();
}

function drawEye(cx, cy, r, blink) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, blink);

  // olho
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.5, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // íris segue o mouse
  const ix = mouseX * r * 0.4;
  const iy = mouseY * r * 0.4;

  ctx.beginPath();
  ctx.arc(ix, iy, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#00eaff";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00eaff";
  ctx.fill();

  // pupila
  ctx.beginPath();
  ctx.arc(ix, iy, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();

  ctx.restore();
}

function drawHands(x, y, r) {
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * Math.PI * 2 + t * 0.6;
    const d = r * 1.6 + Math.sin(t + i) * 20;

    ctx.beginPath();
    ctx.arc(
      x + Math.cos(a) * d,
      y + Math.sin(a) * d,
      10,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#784ba0";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#784ba0";
    ctx.fill();
  }
}

/* =========================
   LOOP
========================= */

function loop() {
  if (!running) return;

  ctx.fillStyle = "rgba(5,0,16,0.25)";
  ctx.fillRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const pulse = 90 + Math.sin(t * 2) * 6;
  const blink = Math.abs(Math.sin(t * 1.8));

  drawHands(cx, cy, pulse);
  drawHead(cx, cy, pulse);
  drawEye(cx - 28, cy - 10, 14, blink);
  drawEye(cx + 28, cy - 10, 14, blink);

  t += 0.01;
  requestAnimationFrame(loop);
}

loop();

/* =========================
   API DE CONTROLE
========================= */

window._stopPortal = () => {
  running = false;
  ctx.clearRect(0, 0, w, h);
};
