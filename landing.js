// ============================
// Puff Lab - Final Clean Version (Cinematic)
// ============================


// ----------------------------
// White Fade on Load
// ----------------------------
window.addEventListener("DOMContentLoaded", () => {
  const white = document.getElementById("white-transition");
  if (white) {
    setTimeout(() => {
      white.style.opacity = "0";
    }, 100);
  }
});


// ----------------------------
// Game State
// ----------------------------
let gameStarted = false;
let startTime = null;
let timerInterval = null;


// ----------------------------
// Fish Counter
// ----------------------------
function getNormalFishCount() {
  return document.querySelectorAll(".puffer:not(.mama):not(.learning)").length;
}

let totalNormalFish = getNormalFishCount();


// ----------------------------
// UI
// ----------------------------
const ui = document.createElement("div");
ui.style.position = "fixed";
ui.style.top = "20px";
ui.style.right = "20px";
ui.style.fontFamily = "sans-serif";
ui.style.fontSize = "12px";
ui.style.letterSpacing = "0.08em";
ui.style.color = "#3f9cfa";
ui.style.opacity = "0.8";
ui.style.zIndex = "999999";

ui.style.background = "rgba(255,255,255,0.9)";
ui.style.padding = "10px 14px";
ui.style.borderRadius = "16px";
ui.style.backdropFilter = "blur(6px)";

ui.innerHTML = `
Remaining: ${totalNormalFish} <br>
Time: 0.00s
`;

document.body.appendChild(ui);


// ----------------------------
// Start Game
// ----------------------------
function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  startTime = Date.now();

  timerInterval = setInterval(() => {
    let current = ((Date.now() - startTime) / 1000).toFixed(2);
    let remaining = getNormalFishCount();

    ui.innerHTML = `
Remaining: ${remaining} <br>
Time: ${current}s
`;
  }, 50);
}


// ----------------------------
// Global Click
// ----------------------------
document.addEventListener("click", function (e) {

  const fish = e.target.closest(".puffer");
  if (!fish) return;

  // ----------------------------
  // Learning Fish Logic
  // ----------------------------
  if (fish.classList.contains("learning")) {

    const dark = document.getElementById("dark-layer");

    // 停止动画
    fish.style.animation = "none";

    // 锁定当前位置
    const rect = fish.getBoundingClientRect();
    fish.style.position = "fixed";
    fish.style.left = rect.left + "px";
    fish.style.top = rect.top + "px";
    fish.style.transform = "translateY(0)";
    fish.style.transition = "all 0.8s ease";

    // 背景变暗
    dark.style.opacity = "0.8";

    // 放大
    fish.style.transform = "scale(2)";

    // 飞到右侧
    setTimeout(() => {
      fish.style.transition = "all 1s cubic-bezier(.65,.05,.36,1)";
      fish.style.left = window.innerWidth + "px";
    }, 800);

    // 横扫屏幕
    setTimeout(() => {
      fish.style.transition = "all 1.2s linear";
      fish.style.left = "-600px";
    }, 1800);

    // 跳转
    setTimeout(() => {
      window.location.href = "learn.html";
    }, 3000);

    return;
  }

  startGame();

  // ----------------------------
  // Mama Logic
  // ----------------------------
  if (fish.classList.contains("mama")) {
    showMamaMessage();
    spawnBabyFish(5);

    fish.remove();
    spawnMamaFish();
    return;
  }

  // ----------------------------
  // Normal Fish
  // ----------------------------
  fish.remove();
  updateDifficulty();

  if (getNormalFishCount() === 0) {
    endGame();
  }

});


// ----------------------------
// Mama Message
// ----------------------------
function showMamaMessage() {
  const msg = document.getElementById("mama-message");
  msg.classList.remove("hidden");

  setTimeout(() => {
    msg.classList.add("hidden");
  }, 2000);
}


// ----------------------------
// Spawn Baby Fish
// ----------------------------
function spawnBabyFish(count) {
  for (let i = 0; i < count; i++) {

    let fish = document.createElement("div");
    fish.className = "puffer baby";

    fish.style.setProperty("--size", Math.random()*120 + 80 + "px");
    fish.style.setProperty("--y", Math.random()*80 + "%");
    fish.style.setProperty("--speed", (Math.random()*3 + 4) + "s");

    fish.innerHTML = `
      <img src="puffer-orignal.png" class="puffer-img base">
      <img src="puffer-puffed.png" class="puffer-img organs">
    `;

    document.body.appendChild(fish);
  }
}


// ----------------------------
// Spawn Mama
// ----------------------------
function spawnMamaFish() {

  let mama = document.createElement("div");
  mama.className = "puffer mama";

  mama.style.setProperty("--size", "220px");
  mama.style.setProperty("--y", Math.random()*70 + "%");
  mama.style.setProperty("--speed", "6s");

  mama.innerHTML = `
    <img src="puffer-mama.png" class="puffer-img base">
    <img src="puffer-mama.png" class="puffer-img organs">
  `;

  document.body.appendChild(mama);
}


// ----------------------------
// Difficulty
// ----------------------------
function updateDifficulty() {

  let remaining = getNormalFishCount();
  let caught = totalNormalFish - remaining;

  document.querySelectorAll(".puffer").forEach(fish => {
    fish.style.transform =
      `translateY(-50%) scale(${1 + caught * 0.05})`;
  });

  let intensity = caught * 0.05;
  document.getElementById("dark-layer").style.opacity = intensity;

  
}


// ----------------------------
// End Game
// ----------------------------
function endGame() {

  clearInterval(timerInterval);

  let totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  document.getElementById("final-time").innerText =
    `Your time: ${totalTime}s`;

  document.getElementById("result-modal").classList.remove("hidden");

  document.getElementById("share-link").value =
    "https://yuexu.space/landing.html";
}


// ----------------------------
// Copy Link 
// ----------------------------
const copyBtn = document.getElementById("copy-btn");

if (copyBtn) {
  copyBtn.addEventListener("click", async () => {

    try {
      await navigator.clipboard.writeText(window.location.href);
      copyBtn.style.opacity = "0.6";

      setTimeout(() => {
        copyBtn.style.opacity = "1";
      }, 500);

    } catch (err) {
      console.log("Copy failed", err);
    }

  });
}




// ----------------------------
// Word Hint Bubbles 
// ----------------------------

const lines = [
  "the one with",
  "glasses👓",
  "knows things",

  "mama fish",
  "will bring",
  "more and more！",

  "something",
  "is about",
  "to happen",

  "hurry",
  "its getting",
  "dark...."
];

const container = document.querySelector(".hint-bubbles");

if (container) {

  let index = 0;

  function spawnBubble() {
    if (index >= lines.length) return;

    const bubble = document.createElement("div");
    bubble.className = "word-bubble";
    bubble.textContent = lines[index];

    bubble.style.left = Math.random() * 80 + 10 + "vw";

    container.appendChild(bubble);

    setTimeout(() => {
      bubble.remove();
    }, 6000);

    index++;
    setTimeout(spawnBubble, 900);
  }

  // 延迟 1 秒开始
  setTimeout(spawnBubble, 1000);
}






// ----------------------------
// Try Again
// ----------------------------
const tryBtn = document.querySelector(".try-btn");
if (tryBtn) {
  tryBtn.addEventListener("click", () => {
    window.location.href = "https://yuexu.space/landing.html";
  });
}

