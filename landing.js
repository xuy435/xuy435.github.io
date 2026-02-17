// ============================
// Puff Lab - Capture Game
// ============================

let totalFish = 15;



let fishes = document.querySelectorAll(".puffer");
let startTime = null;
let timerInterval = null;
let gameStarted = false;

// 创建UI显示
const ui = document.createElement("div");
ui.style.position = "fixed";
ui.style.top = "20px";
ui.style.right = "20px";
ui.style.fontFamily = "sans-serif";
ui.style.fontSize = "12px";
ui.style.letterSpacing = "0.08em";
ui.style.color = "#f7b0e5";
ui.style.opacity = "0.8";
ui.innerHTML = `
Remaining: ${fishes.length} <br>
Time: 0.00s
`;
document.body.appendChild(ui);


// ============================
// 开始游戏
// ============================

function startGame() {
  if (gameStarted) return;

  gameStarted = true;
  startTime = Date.now();

  timerInterval = setInterval(() => {
    let current = ((Date.now() - startTime) / 1000).toFixed(2);
    ui.innerHTML = `
    Remaining: ${document.querySelectorAll(".puffer").length} <br>
    Time: ${current}s
    `;
  }, 50);
}



// ============================
// 抓鱼逻辑
// ============================
document.querySelectorAll(".puffer-img").forEach(img => {

  img.addEventListener("click", (e) => {

    e.stopPropagation();

    const fish = img.closest(".puffer");

    if (!gameStarted) {
      startGame();
    }

    // 🐡 如果是 mama
    if (fish.classList.contains("mama")) {
      spawnBabyFish(15);
      showMamaMessage();
      fish.remove();
      return;
    }

    // 普通鱼
    fish.remove();
    updateDifficulty();

    if (document.querySelectorAll(".puffer").length === 0) {
      endGame();
    }

  });

});


// mama fish text
function showMamaMessage() {

  const msg = document.getElementById("mama-message");
  msg.classList.remove("hidden");

  setTimeout(() => {
    msg.classList.add("hidden");
  }, 2000);

}



//宝宝鱼出生
function spawnBabyFish(count) {

  for (let i = 0; i < count; i++) {

    let fish = document.createElement("div");
    fish.className = "puffer";

    fish.style.setProperty("--size", Math.random()*150 + 80 + "px");
    fish.style.setProperty("--y", Math.random()*80 + "%");
    fish.style.setProperty("--speed", (Math.random()*3 + 3) + "s");

    fish.innerHTML = `
      <img src="puffer-orignal.png" class="puffer-img base">
      <img src="puffer-organs.png" class="puffer-img organs">
    `;

    document.body.appendChild(fish);

    fish.querySelector(".puffer-img").addEventListener("click", (e) => {
      e.stopPropagation();
      fish.remove();
      updateDifficulty();
    });

  }

}




// ============================
// 难度递增
// ============================

function updateDifficulty() {

  let remaining = document.querySelectorAll(".puffer").length;
  let total = 9; // 你现在有9条鱼

  let caught = total - remaining;

  // 加速
document.querySelectorAll(".puffer").forEach(fish => {
  fish.style.transform = `translateY(-50%) scale(${1 + caught * 0.05})`;
});


  // 变暗
  let darkness = caught * 0.05;
document.getElementById("dark-layer").style.opacity = darkness;

let intensity = caught * 0.07;
document.getElementById("dark-layer").style.opacity = intensity;


  // 剩3条以下闪烁
  if (remaining <= 3) {
  document.getElementById("dark-layer").classList.add("flicker");
}

}


// ============================
// 结束游戏
// ============================

function endGame() {

  clearInterval(timerInterval);

  let totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  let link = `${window.location.origin}${window.location.pathname}?time=${totalTime}`;

  document.getElementById("final-time").innerText =
    `Your time: ${totalTime}s`;

  document.getElementById("share-link").value = link;

  document.getElementById("result-modal").classList.remove("hidden");

}

//复制share link 链接
document.getElementById("copy-btn").addEventListener("click", async () => {

  let link = document.getElementById("share-link").value;

  try {
    await navigator.clipboard.writeText(link);

    document.getElementById("copy-btn").style.opacity = "0.6";

    setTimeout(() => {
      document.getElementById("copy-btn").style.opacity = "1";
    }, 500);

  } catch (err) {
    console.log("Copy failed", err);
  }

});




setInterval(() => {

  let remaining = document.querySelectorAll(".puffer").length;

  if (remaining < totalFish) {
    respawnFish();
  }

}, 15000);


function respawnFish() {

  let fish = document.createElement("div");
  fish.className = "puffer";
  fish.style.setProperty("--size", "200px");
  fish.style.setProperty("--y", Math.random()*80 + "%");
  fish.style.setProperty("--speed", "8s");

  fish.innerHTML = `
    <img src="puffer-orignal.png" class="puffer-img base">
    <img src="puffer-organs.png" class="puffer-img organs">
  `;

  document.body.appendChild(fish);

  fish.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!gameStarted) return;
    fish.remove();
    updateDifficulty();
  });

}


//reset 游戏
document.getElementById("try-again").addEventListener("click", () => {
  location.reload();
});
