// Lightweight atmosphere layer for the character story film. It gives the
// still artwork a restrained sense of air and depth without requiring video
// files or a WebGL context on a route that should remain fast and accessible.
(function installCharacterFilmFX(global, document) {
  "use strict";

  function mount(stage, options) {
    if (!stage || stage.querySelector(".character-film__atmosphere")) return null;
    const reducedMotion = Boolean(options && options.reducedMotion);
    const canvas = document.createElement("canvas");
    canvas.className = "character-film__atmosphere";
    canvas.setAttribute("aria-hidden", "true");
    stage.insertBefore(canvas, stage.firstChild);
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return { destroy() {}, transition() {} };

    const particles = Array.from({ length: 56 }, (_, index) => ({
      x: (index * 0.173) % 1,
      y: (index * 0.619) % 1,
      radius: 0.5 + ((index * 7) % 10) / 10,
      speed: 0.0007 + ((index * 13) % 9) / 10000,
      drift: ((index % 5) - 2) * 0.000035,
      alpha: 0.12 + ((index * 11) % 10) / 100
    }));
    let frame = 0;
    let width = 0;
    let height = 0;
    let destroyed = false;

    function resize() {
      const bounds = stage.getBoundingClientRect();
      const dpr = Math.min(2, global.devicePixelRatio || 1);
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function draw(now) {
      if (destroyed) return;
      context.clearRect(0, 0, width, height);
      const scene = stage.dataset.scene || "title";
      const warm = scene === "turn" || scene === "archive";
      particles.forEach(particle => {
        particle.y += particle.speed;
        particle.x += particle.drift;
        if (particle.y > 1.04) particle.y = -0.04;
        if (particle.x > 1.04) particle.x = -0.04;
        if (particle.x < -0.04) particle.x = 1.04;
        const twinkle = 0.76 + Math.sin(now * 0.0014 + particle.x * 8) * 0.24;
        context.beginPath();
        context.fillStyle = warm
          ? `rgba(224, 151, 86, ${particle.alpha * twinkle * 0.62})`
          : `rgba(206, 221, 224, ${particle.alpha * twinkle * 0.52})`;
        context.arc(particle.x * width, particle.y * height, particle.radius, 0, Math.PI * 2);
        context.fill();
      });
      frame = global.requestAnimationFrame(draw);
    }

    function onResize() { resize(); }
    resize();
    global.addEventListener("resize", onResize, { passive: true });
    if (!reducedMotion) frame = global.requestAnimationFrame(draw);

    return {
      transition() {
        canvas.dataset.transition = String(Date.now());
      },
      destroy() {
        destroyed = true;
        if (frame) global.cancelAnimationFrame(frame);
        global.removeEventListener("resize", onResize);
        canvas.remove();
      }
    };
  }

  global.CharacterFilmFX = Object.freeze({ mount });
})(window, document);
