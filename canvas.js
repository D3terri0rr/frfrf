const canvas = document.getElementById("portal");
const ctx = canvas.getContext("2d");

let w, h;
let t = 0;
let running = true;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function drawEye(x, y, r, blink) {
  ctx.save();
  ctx.translate(x, y);

  // olho branco
  ctx.scale(1, blink);
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 1.6, r, 0, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();

  // íris
  ctx.beginPath();
  ctx.arc(Math.sin(t) * r * 0.4, 0, r * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#00eaff";
  ctx.shadowBlur = 20;
  ctx.shadowColor = "#00eaff";
  ctx.fill();

  // pupila
  ctx.beginPath();
  ctx.arc(Math.sin(t) * r * 0.4, 0, r * 0.2, 0, Math.PI * 2);
  ctx.fillStyle = "#000";
  ctx.fill();

  ctx.restore();
}

function drawSymbol(x, y, size, rot, char) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.font = `${size}px serif`;
  ctx.fillStyle = "#ff4fd8";
  ctx.shadowBlur = 15;
  ctx.shadowColor = "#ff4fd8";
  ctx.fillText(char, 0, 0);
  ctx.restore();
}

function loop() {
  if (!running) return;

  ctx.fillStyle = "rgba(5,0,16,0.25)";
  ctx.fillRect(0, 0, w, h);

  // portal
  for (let i = 0; i < 120; i++) {
    const a = i / 120 * Math.PI * 2 + t * 0.4;
    const r = 200 + Math.sin(t + i) * 40;
    ctx.beginPath();
    ctx.arc(
      w / 2 + Math.cos(a) * r,
      h / 2 + Math.sin(a) * r,
      1.5,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "#784ba0";
    ctx.fill();
  }

  // olhos
  drawEye(w / 2, h / 2, 40, Math.abs(Math.sin(t * 2)));

  // símbolos
  const symbols = ["♥", "✦", "✧", "☼", "✺"];
  for (let i = 0; i < 20; i++) {
    drawSymbol(
      w / 2 + Math.cos(t + i) * 260,
      h / 2 + Math.sin(t + i * 1.2) * 260,
      24,
      t + i,
      symbols[i % symbols.length]
    );
  }

  t += 0.01;
  requestAnimationFrame(loop);
}

loop();

window._stopPortal = () => {
  running = false;
  ctx.clearRect(0, 0, w, h);
};
