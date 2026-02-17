/* ===========================
   About.js
   - Pause button (shared)
   - Letter wave
   - Extra fishes swim (no click / no hover)
   - Title + box movement is DISABLED (easy to re-enable)
=========================== */

const title = document.getElementById("wave-text");
const box = document.getElementById("fish-box");
const toggleBtn = document.getElementById("toggle");
const fishLayer = document.getElementById("fish-layer"); // make sure this exists in HTML

/* ------------------ play/pause (shared) ------------------ */
let paused = false;

function setButtonState() {
  toggleBtn.classList.toggle("pause", !paused); // running -> ||
  toggleBtn.classList.toggle("play", paused);   // paused  -> ▶
  toggleBtn.setAttribute("aria-label", paused ? "Play" : "Pause");
}
setButtonState();

toggleBtn.addEventListener("click", () => {
  paused = !paused;
  setButtonState();
});

/* ------------------ letter wave (title) ------------------ */
const raw = title.innerText;
title.innerHTML = [...raw]
  .map(ch => `<span>${ch === " " ? "&nbsp;" : ch}</span>`)
  .join("");
const letters = title.querySelectorAll("span");

let textT = 0;
const textWaveSpeed = 0.06;
const textWaveHeight = 8;

/* ------------------ OPTIONAL: title & box movement (OFF) ------------------ */
/*
  If you want "About Puff Lab" + fish-box to swim again:
  1) set MOVE_TITLE_BOX = true
  2) (optional) uncomment the A/B/follow + updateFish block
*/
const MOVE_TITLE_BOX = false;

/*
function makeFishState(x, y, vx, vy) {
  return {
    x, y, vx, vy,
    t: Math.random() * 1000,
    waveSpeed: 0.035 + Math.random() * 0.02,
    waveHeight: 8 + Math.random() * 8
  };
}

const A = makeFishState(80, 220, 1.6, 0.9);  // title
const B = makeFishState(120, 80, 1.1, 0.7);  // box
const follow = 0.06;

function updateFish(state, el) {
  state.x += state.vx;
  state.y += state.vy;

  const w = el.offsetWidth;
  const h = el.offsetHeight;

  const maxX = window.innerWidth - w;
  const maxY = window.innerHeight - h;

  if (state.x <= 0 || state.x >= maxX) {
    state.vx *= -1;
    state.waveHeight = 8 + Math.random() * 10;
  }
  if (state.y <= 0 || state.y >= maxY) {
    state.vy *= -1;
    state.waveSpeed = 0.03 + Math.random() * 0.03;
  }

  state.t += state.waveSpeed;
  const floatY = Math.sin(state.t) * state.waveHeight;

  // NO MIRROR
  el.style.transform = `translate(${state.x}px, ${state.y + floatY}px)`;
}
*/

/* ------------------ extra swimming fishes (no click / no hover) ------------------ */
const FISH_IMAGES = [
  "orange-fish.png",
  "fishes-04.png",
  "crab-03.png",
  "green-fish-02.png"
];

const FISH_COUNT = 8;
const SIZE_MIN = 50;
const SIZE_MAX = 120;
const SPEED_MIN = 0.5;
const SPEED_MAX = 1.8;

const FISH_FLIP_BY_DIRECTION = false;

const fishes = [];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function createFish() {
  if (!fishLayer) return;

  const img = document.createElement("img");
  img.className = "fish";
  img.src = pick(FISH_IMAGES);
  img.alt = "";
  img.draggable = false;

  const size = rand(SIZE_MIN, SIZE_MAX);
  img.style.setProperty("--size", `${size}px`);

  let x = rand(0, Math.max(1, window.innerWidth - size));
  let y = rand(0, Math.max(1, window.innerHeight - size));

  let vx = rand(SPEED_MIN, SPEED_MAX) * (Math.random() < 0.5 ? -1 : 1);
  let vy = rand(SPEED_MIN, SPEED_MAX) * (Math.random() < 0.5 ? -1 : 1);

  let t = rand(0, Math.PI * 2);
  let wiggle = rand(0.6, 1.6);
  let amp = rand(2, 9);

  fishLayer.appendChild(img);
  fishes.push({ el: img, x, y, vx, vy, size, t, wiggle, amp });
}

function resetFishes() {
  if (!fishLayer) return;

  fishes.length = 0;
  fishLayer.innerHTML = "";
  for (let i = 0; i < FISH_COUNT; i++) createFish();
}

function updateFishes() {
  const W = window.innerWidth;
  const H = window.innerHeight;

  for (const f of fishes) {
    f.t += 0.03 * f.wiggle;

    f.x += f.vx;
    f.y += f.vy + Math.sin(f.t) * 0.15;

    if (f.x <= 0) { f.x = 0; f.vx *= -1; }
    if (f.x >= W - f.size) { f.x = W - f.size; f.vx *= -1; }
    if (f.y <= 0) { f.y = 0; f.vy *= -1; }
    if (f.y >= H - f.size) { f.y = H - f.size; f.vy *= -1; }

    const rot = Math.sin(f.t) * f.amp;

    if (FISH_FLIP_BY_DIRECTION) {
      const flip = f.vx < 0 ? -1 : 1;
      f.el.style.transform = `translate(${f.x}px, ${f.y}px) scaleX(${flip}) rotate(${rot}deg)`;
    } else {
      f.el.style.transform = `translate(${f.x}px, ${f.y}px) rotate(${rot}deg)`;
    }
  }
}

/* ------------------ one master loop ------------------ */
function animate() {
  if (!paused) {
    // Title + box movement is OFF by default
    // if (MOVE_TITLE_BOX) {
    //   updateFish(A, title);
    //   B.vx += (A.x - B.x) * follow * 0.001;
    //   B.vy += (A.y - B.y) * follow * 0.001;
    //   B.vx = Math.max(-2, Math.min(2, B.vx));
    //   B.vy = Math.max(-2, Math.min(2, B.vy));
    //   updateFish(B, box);
    // }

    // letter wave
    textT += textWaveSpeed;
    letters.forEach((sp, i) => {
      const yy = Math.sin(textT + i * 0.45) * textWaveHeight;
      sp.style.transform = `translateY(${yy}px)`;
    });

    // extra fishes
    updateFishes();
  }

  requestAnimationFrame(animate);
}

/* ------------------ init ------------------ */
resetFishes();
window.addEventListener("resize", resetFishes);
animate();
