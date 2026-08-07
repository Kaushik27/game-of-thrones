// Keeping the dependency local makes the 3D experience work on GitHub Pages
// without relying on a third-party CDN at runtime. Realm Journey itself is a
// classic script, so the editorial fallback remains available if WebGL or the
// module import fails.
try {
  const THREE = await import("../vendor/three.module.min.js");
  window.THREE = THREE;
  window.REALM_THREE_STATUS = "ready";
  window.dispatchEvent(new CustomEvent("realm-three-ready"));
} catch (error) {
  window.REALM_THREE_STATUS = "unavailable";
  console.error("The 3D realm renderer could not be loaded. Using the cinematic fallback.", error);
  window.dispatchEvent(new CustomEvent("realm-three-error", {
    detail: { message: error instanceof Error ? error.message : String(error) }
  }));
}
