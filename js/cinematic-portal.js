// A small, source-inspired crossing effect for the Explore -> Realm handoff.
// It uses a canvas so the transition stays organic without adding a media
// dependency; the existing page is already underneath the veil when covered.
(function installCinematicPortal(global, document) {
  "use strict";

  const mountedRoots = new WeakMap();

  function mount(root, options) {
    if (!root || mountedRoots.has(root)) return mountedRoots.get(root) || null;
    const config = options && typeof options === "object" ? options : {};
    const reducedMotion = Boolean(config.reducedMotion);
    const overlay = document.createElement("div");
    overlay.className = "cinematic-portal";
    overlay.hidden = true;
    overlay.setAttribute("aria-hidden", "true");
    const canvas = document.createElement("canvas");
    canvas.className = "cinematic-portal__canvas";
    overlay.appendChild(canvas);
    root.appendChild(overlay);

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      const fallbackHandle = {
        enter(settings) {
          const details = settings && typeof settings === "object" ? settings : {};
          if (typeof details.onCovered === "function") details.onCovered();
          if (typeof details.onDone === "function") details.onDone();
          return true;
        },
        destroy() {
          overlay.remove();
          mountedRoots.delete(root);
        },
      };
      mountedRoots.set(root, fallbackHandle);
      return fallbackHandle;
    }
    let frame = 0;
    let running = false;
    let covered = false;
    let destroyed = false;
    let startedAt = 0;
    let safetyTimer = 0;
    let origin = { x: global.innerWidth * 0.5, y: global.innerHeight * 0.5 };
    let onCovered = null;
    let onDone = null;

    function finish() {
      if (!running) return;
      running = false;
      if (frame) global.cancelAnimationFrame(frame);
      if (safetyTimer) global.clearTimeout(safetyTimer);
      safetyTimer = 0;
      overlay.hidden = true;
      const done = onDone;
      onCovered = null;
      onDone = null;
      if (typeof done === "function") done();
    }

    function resize() {
      const dpr = Math.min(global.devicePixelRatio || 1, 2);
      canvas.width = Math.round(global.innerWidth * dpr);
      canvas.height = Math.round(global.innerHeight * dpr);
      canvas.style.width = `${global.innerWidth}px`;
      canvas.style.height = `${global.innerHeight}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function blobPath(ctx, centerX, centerY, radius, time, lobes) {
      ctx.beginPath();
      for (let index = 0; index <= 64; index += 1) {
        const angle = (index / 64) * Math.PI * 2;
        const wobble = 1 +
          0.09 * Math.sin(angle * lobes + time * 2.2) +
          0.045 * Math.sin(angle * (lobes * 2.4) - time * 1.4 + 1.8);
        const distance = radius * wobble;
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    }

    function draw(time, progress) {
      const width = global.innerWidth;
      const height = global.innerHeight;
      context.clearRect(0, 0, width, height);
      if (reducedMotion) {
        context.fillStyle = `rgba(3, 5, 7, ${Math.sin(progress * Math.PI) * 0.98})`;
        context.fillRect(0, 0, width, height);
        return;
      }

      const coverProgress = Math.min(progress / 0.56, 1);
      const openProgress = Math.max((progress - 0.56) / 0.44, 0);
      const farthest = Math.hypot(
        Math.max(origin.x, width - origin.x),
        Math.max(origin.y, height - origin.y),
      ) * 1.22;
      const coverRadius = Math.pow(coverProgress, 1.35) * farthest;
      const openRadius = Math.pow(openProgress, 1.2) * (Math.hypot(width, height) * 0.66 + 160);

      context.save();
      context.globalCompositeOperation = "source-over";
      if (coverRadius > 1) {
        blobPath(context, origin.x, origin.y, coverRadius, time, 6);
        const ink = context.createRadialGradient(origin.x, origin.y, coverRadius * 0.25, origin.x, origin.y, coverRadius * 1.08);
        ink.addColorStop(0, "rgba(4, 6, 9, 0.99)");
        ink.addColorStop(0.78, "rgba(9, 10, 13, 0.98)");
        ink.addColorStop(0.94, "rgba(86, 49, 25, 0.92)");
        ink.addColorStop(1, "rgba(232, 164, 77, 0)");
        context.fillStyle = ink;
        context.fill();
        context.strokeStyle = `rgba(237, 201, 126, ${0.22 + coverProgress * 0.5})`;
        context.lineWidth = 1.5 + coverProgress * 2;
        context.stroke();
      }

      if (openRadius > 1) {
        context.globalCompositeOperation = "destination-out";
        blobPath(context, width * 0.5, height * 0.5, openRadius, time + 1.3, 7);
        context.fillStyle = "rgba(0, 0, 0, 1)";
        context.fill();
      }
      context.restore();
    }

    function tick(now) {
      if (destroyed || !running) return;
      const elapsed = (now - startedAt) / (reducedMotion ? 900 : 1800);
      const progress = Math.min(elapsed, 1);
      if (!covered && progress >= 0.56) {
        covered = true;
        if (typeof onCovered === "function") onCovered();
      }
      draw(now / 1000, progress);
      if (progress >= 1) {
        finish();
        return;
      }
      frame = global.requestAnimationFrame(tick);
    }

    function enter(settings) {
      if (running || destroyed) return false;
      const details = settings && typeof settings === "object" ? settings : {};
      origin = details.origin && Number.isFinite(details.origin.x) && Number.isFinite(details.origin.y)
        ? details.origin
        : { x: global.innerWidth * 0.5, y: global.innerHeight * 0.5 };
      onCovered = details.onCovered;
      onDone = details.onDone;
      covered = false;
      running = true;
      overlay.hidden = false;
      resize();
      startedAt = performance.now();
      // A throttled/background tab can pause requestAnimationFrame midway
      // through the veil. Never leave the user behind an opaque loading screen.
      safetyTimer = global.setTimeout(finish, reducedMotion ? 1200 : 2600);
      frame = global.requestAnimationFrame(tick);
      return true;
    }

    resize();
    global.addEventListener("resize", resize, { passive: true });
    const handle = {
      enter,
      destroy() {
        destroyed = true;
        running = false;
        if (frame) global.cancelAnimationFrame(frame);
        if (safetyTimer) global.clearTimeout(safetyTimer);
        global.removeEventListener("resize", resize);
        overlay.remove();
        mountedRoots.delete(root);
      },
    };
    mountedRoots.set(root, handle);
    return handle;
  }

  global.CinematicPortal = Object.freeze({ mount });
})(window, document);
