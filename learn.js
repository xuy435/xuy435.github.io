
document.addEventListener("DOMContentLoaded", () => {
  const bgm = document.getElementById("bgm");
  const hint = document.querySelector(".tap-for-music");

  const dropSfx = document.getElementById("dropSfx");
  const organs = Array.from(document.querySelectorAll(".organ"));

  const stage = document.querySelector(".stage");
  const textArea = document.getElementById("textArea");
  const clearBtn = document.getElementById("clearBtn");

  let isPlaying = false;

  // ----------------------------
  // 1) 每个 organ 对应的文字（key 用 organ 的文件名/alt/data-title）
  // ----------------------------
  const organTexts = {
  stomach: `Stomach: A pufferfish’s stomach is basically a built-in airbag. When danger shows up, it gulps water (or air) and the stomach expands fast, turning the fish into a big, hard-to-swallow ball. That one organ can instantly change its whole “don’t eat me” size.`,

  gills: `Gills: When a pufferfish puffs up, it can’t swim away quickly—so breathing has to stay steady. The gills keep oxygen flowing even while the body is tense and inflated. They also help the fish stay balanced in salty water, which matters when it’s stressed.`,

  heart: `Heart: Puffing up is a full-body emergency mode. The heart has to keep blood moving while the fish is stressed and using energy differently. A strong, steady heartbeat helps the pufferfish survive the scary moment long enough for its defense to work.`,

  spleen: `Spleen: The spleen helps with blood and immune support, which is useful for a fish that suddenly switches from calm to “panic defense.” When a pufferfish gets threatened, its body needs backup systems to stay stable. Think of the spleen as part of that behind-the-scenes support team.`,

  liver: `Liver: The liver is a major “processing center” for a pufferfish. Many pufferfish store powerful toxin (TTX) in organs like the liver, turning their body into chemical warning signs. It also helps handle a meaty diet like small crabs or shellfish.`,

  intestine: `Intestine: Pufferfish often crush hard-shelled prey, but the intestine is what actually absorbs the energy from it. That energy helps the fish recover after puffing up and keeps its body ready for defense. It’s like turning tough food into fuel for survival tricks.`,

  ovary: `Ovary: For many pufferfish, protection can extend to the next generation. Eggs can contain toxin, making them a risky snack for predators. The ovary doesn’t just make eggs—it can help guard them.`,

  "swim-bladder": `Swim-bladder: Pufferfish aren’t built for nonstop fast swimming, so saving energy matters. The swim bladder helps them hover and control depth without constant effort. After puffing up, it also helps the fish return to a stable position in the water.`,

  kidney: `Kidney: Puffing up means taking in a lot of water, which can mess with the body’s balance. The kidney helps remove extra water and manage salts, especially in seawater. It’s key for “resetting” the body after the defense is over.`,

  "urinary-bladder": `Urinary-bladder: The urinary bladder works like a small storage tank. After a pufferfish gulps water to inflate, it needs a controlled way to get rid of extra fluids. This helps the fish recover smoothly instead of staying stuck in imbalance.`,
};


  function getKeyFromOrgan(org) {
    // 优先用 data-title / data-key
    const k1 = org.dataset.key || org.dataset.title;
    if (k1) return k1.trim().toLowerCase();

    // 再用 src 文件名
    const src = org.getAttribute("src") || "";
    const file = src.split("/").pop() || "";
    const name = file.replace(/\.(png|jpg|jpeg|webp|gif)$/i, "");
    if (name) return name.trim().toLowerCase();

    // 最后用 alt
    const alt = org.getAttribute("alt") || "";
    return alt.trim().toLowerCase();
  }

  // ----------------------------
  // 2) 背景音乐开关：只允许点击“鱼外的空白区域”
  //    点 organ / text-box / clear 都不会触发
  // ----------------------------
  document.addEventListener("click", (e) => {
    // 如果点击发生在鱼的区域（stage）里 → 不切换 bgm
    if (e.target.closest(".stage")) return;

    // 如果点到 text box 或 clear → 不切换 bgm（防呆）
    if (e.target.closest(".text-box")) return;
    if (e.target.closest("#clearBtn")) return;

    if (!bgm) return;

    if (!isPlaying) {
      bgm.play().then(() => {
        isPlaying = true;
        if (hint) hint.textContent = "tap to mute 🔇";
      }).catch(err => console.log("Autoplay blocked:", err));
    } else {
      bgm.pause();
      isPlaying = false;
      if (hint) hint.textContent = "tap for music 🌊";
    }
  });

  // ----------------------------
  // 3) Clear 按钮：清空所有 text boxes（不影响 bgm）
  // ----------------------------
  if (clearBtn && textArea) {
    clearBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      textArea.innerHTML = "";
    });
  }

  // ----------------------------
  // 4) organ 点击：生成掉落 text box + water-drop
  // ----------------------------
  organs.forEach((org) => {
    org.addEventListener("click", (e) => {
      e.stopPropagation(); // ✅不影响背景音乐开关

      // water-drop 音效
      if (dropSfx) {
        const s = dropSfx.cloneNode(true);
        s.volume = 0.9;
        s.play().catch(() => {});
      }

      // 创建 box
      if (!textArea) return;

      const key = getKeyFromOrgan(org);
      const text = organTexts[key] || "No description";

      const box = document.createElement("div");
box.className = `text-box ${key}-box falling`;
      box.textContent = text;

      // ✅点击 box 也不影响 bgm
      box.addEventListener("click", (ev) => ev.stopPropagation());

      textArea.appendChild(box);

      // 初始位置：X 跟 organ 位置相关（每个 organ 会不同）
      const orgRect = org.getBoundingClientRect();

      // 等 box 有尺寸后再计算落点
      requestAnimationFrame(() => {
        const boxRect = box.getBoundingClientRect();

        // 目标落点 Y：对齐 clear 按钮所在水平线（以 clearBtn.bottom 为准）
        let targetY = window.innerHeight - 140; // fallback
        if (clearBtn) {
          const cr = clearBtn.getBoundingClientRect();
          targetY = cr.bottom - boxRect.height; // box bottom = clear bottom
          targetY = Math.max(10, Math.min(window.innerHeight - boxRect.height - 10, targetY));
        }

        // 目标落点 X：以 organ 中心为主 + 小抖动
        let x = orgRect.left + orgRect.width / 2 - boxRect.width / 2;
        x += (Math.random() * 60 - 30); // jitter

        // 限制在屏幕范围
        x = Math.max(10, Math.min(window.innerWidth - boxRect.width - 10, x));

        // 从屏幕上方开始掉
        let y = -120;

        box.style.position = "fixed";
        box.style.left = x + "px";
        box.style.top = y + "px";

        // 掉落物理 + bounce（会停在 targetY）
        let vy = 2.5;
        const g = 0.45;
        const bounce = 0.45;

        function fall() {
          y += vy;
          vy += g;

          if (y >= targetY) {
            y = targetY;
            vy = -vy * bounce;

            // 速度很小就停住
            if (Math.abs(vy) < 0.8) {
              box.style.top = targetY + "px";
              box.classList.remove("falling");
              box.classList.add("settled");
              return;
            }
          }

          box.style.top = y + "px";
          requestAnimationFrame(fall);
        }

        fall();
        enableDragging(box);
      });
    });
  });

  // ----------------------------
  // 5) 拖拽（上下左右 + 限制在屏幕范围）—— pointer events（鼠标/触摸都行）
  // ----------------------------
  function enableDragging(box) {
    let dragging = false;
    let offsetX = 0, offsetY = 0;

    box.addEventListener("pointerdown", (e) => {
      e.stopPropagation(); // ✅拖拽不影响 bgm
      e.preventDefault();

      dragging = true;
      box.classList.add("dragging");
      box.setPointerCapture(e.pointerId);

      const r = box.getBoundingClientRect();
      offsetX = e.clientX - r.left;
      offsetY = e.clientY - r.top;
    });

    box.addEventListener("pointermove", (e) => {
      if (!dragging) return;

      const r = box.getBoundingClientRect();
      const maxX = window.innerWidth - r.width - 10;
      const maxY = window.innerHeight - r.height - 10;

      let x = e.clientX - offsetX;
      let y = e.clientY - offsetY;

      x = Math.max(10, Math.min(maxX, x));
      y = Math.max(10, Math.min(maxY, y));

      box.style.left = x + "px";
      box.style.top = y + "px";
    });

    box.addEventListener("pointerup", () => {
      dragging = false;
      box.classList.remove("dragging");
    });

    box.addEventListener("pointercancel", () => {
      dragging = false;
      box.classList.remove("dragging");
    });
  }
});
