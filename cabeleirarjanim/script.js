document.addEventListener("DOMContentLoaded", () => {
  const contentBox = document.querySelector(".content-box");
  const magicCircle = document.querySelector(".magic-circle-container");
  const explosionPoint = document.querySelector(".explosion-point");
  const usernameEl = document.querySelector(".username");

  // 1. Get URL Parameters
  const urlParams = new URLSearchParams(window.location.search);

  // User Param (default to "User")
  const userParam =
    urlParams.get("user") ||
    urlParams.get("username") ||
    urlParams.get("nome") ||
    urlParams.get("name");
  if (userParam) {
    usernameEl.textContent = userParam;
  }

  // Duration Param (default to 5 seconds)
  // If 0, it means permanent
  const timeParam = urlParams.get("time") || urlParams.get("tempo") || "5";
  const durationSeconds = parseFloat(timeParam);

  // Wait Param (default to 5 seconds)
  // Time the animation stays invisible before restarting
  const waitParam = urlParams.get("wait") || urlParams.get("espera") || "5";
  const waitSeconds = parseFloat(waitParam);

  const EXPLOSION_DELAY = 1200;
  const SHOW_DURATION = durationSeconds * 1000;
  const HIDE_DURATION = waitSeconds * 1000;
  const IS_PERMANENT = durationSeconds === 0;

  // Adapt text to box (Must be done after setting text)
  resizeTextToFit();

  startLoop();

  function resizeTextToFit() {
    // Reset to base size
    let fontSize = 3; // rem
    usernameEl.style.fontSize = fontSize + "rem";

    // Calculate max width (box width - padding)
    const box = document.querySelector(".content-box");
    const styles = window.getComputedStyle(box);
    const maxWidth =
      parseFloat(styles.width) -
      parseFloat(styles.paddingLeft) -
      parseFloat(styles.paddingRight);

    // Safety loop to prevent infinite shrink if something is wrong
    let iterations = 0;
    while (
      usernameEl.scrollWidth > maxWidth &&
      fontSize > 0.5 &&
      iterations < 50
    ) {
      fontSize -= 0.1;
      usernameEl.style.fontSize = fontSize + "rem";
      iterations++;
    }
  }

  function startLoop() {
    // --- PHASE 1: PREPARE AND APPEAR ---

    // Reset states
    contentBox.classList.remove("reveal", "hiding");
    magicCircle.classList.remove("active");

    // Force reflow to restart CSS animations
    void magicCircle.offsetWidth;

    // Start Magic Circle
    magicCircle.classList.add("active");

    // Schedule Explosion and Reveal
    setTimeout(() => {
      createExplosion();
      contentBox.classList.add("reveal");
      document.body.classList.add("shake");

      setTimeout(() => {
        document.body.classList.remove("shake");
      }, 500);

      // If duration is 0, we STOP here (Permanent Mode)
      if (IS_PERMANENT) {
        return;
      }

      // --- PHASE 2: WAIT AND HIDE ---
      setTimeout(() => {
        contentBox.classList.remove("reveal");
        contentBox.classList.add("hiding");

        // --- PHASE 3: WAIT INVISIBLE AND RESTART ---
        setTimeout(() => {
          startLoop(); // Recursion for loop
        }, HIDE_DURATION);
      }, SHOW_DURATION);
    }, EXPLOSION_DELAY);
  }

  function createExplosion() {
    const particleCount = 50;
    const colors = ["#bc00dd", "#e5b3fe", "#FFFFFF", "#2d0036"];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.classList.add("particle");

      const angle = Math.random() * Math.PI * 2;
      const velocity = 100 + Math.random() * 200;
      const tx = Math.cos(angle) * velocity + "px";
      const ty = Math.sin(angle) * velocity + "px";

      particle.style.setProperty("--tx", tx);
      particle.style.setProperty("--ty", ty);
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];

      const size = Math.random() * 8 + 4 + "px";
      particle.style.width = size;
      particle.style.height = size;

      const duration = 0.5 + Math.random() * 0.5 + "s";
      particle.style.animation = `particleExplosion ${duration} ease-out forwards`;

      explosionPoint.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 1000);
    }

    // Simple white flash
    const flash = document.createElement("div");
    flash.style.position = "fixed";
    flash.style.top = "0";
    flash.style.left = "0";
    flash.style.width = "100vw";
    flash.style.height = "100vh";
    flash.style.backgroundColor = "white";
    flash.style.opacity = "0.8";
    flash.style.pointerEvents = "none";
    flash.style.transition = "opacity 0.2s ease-out";
    flash.style.zIndex = "999";
    document.body.appendChild(flash);

    requestAnimationFrame(() => {
      flash.style.opacity = "0";
      setTimeout(() => flash.remove(), 200);
    });
  }
});
