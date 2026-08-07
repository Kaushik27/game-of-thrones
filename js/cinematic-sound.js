// Opt-in atmospheric sound for cinematic surfaces.
// The layer is intentionally synthesized locally: it is muted until the user
// presses the control and never fetches or stores audio assets.
(function installCinematicSound(global, document) {
  "use strict";

  function mount(root, options) {
    if (!root || !root.querySelector) return { destroy() {} };
    const settings = options && typeof options === "object" ? options : {};
    const button = root.querySelector(settings.selector || "[data-cinematic-sound]");
    if (!button) return { destroy() {} };
    const reduced = global.matchMedia && global.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let context = null;
    let master = null;
    let noise = null;
    let tone = null;
    let active = false;
    let destroyed = false;

    function label() {
      button.textContent = active ? "Sound on" : "Sound off";
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", active ? "Mute atmosphere" : "Enable atmospheric sound");
    }

    function buildAudio() {
      const AudioContext = global.AudioContext || global.webkitAudioContext;
      if (!AudioContext) return false;
      context = new AudioContext();
      master = context.createGain();
      master.gain.value = 0.035;
      master.connect(context.destination);

      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const channel = buffer.getChannelData(0);
      let last = 0;
      for (let index = 0; index < channel.length; index += 1) {
        const white = Math.random() * 2 - 1;
        last = last * 0.985 + white * 0.015;
        channel[index] = last * 1.8;
      }
      noise = context.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = reduced ? 420 : 720;
      noise.connect(filter).connect(master);
      noise.start();

      tone = context.createOscillator();
      tone.type = "sine";
      tone.frequency.value = 55;
      const toneGain = context.createGain();
      toneGain.gain.value = 0.2;
      tone.connect(toneGain).connect(master);
      tone.start();
      return true;
    }

    function stopAudio() {
      if (!context) return;
      try { noise && noise.stop(); } catch (error) { /* already stopped */ }
      try { tone && tone.stop(); } catch (error) { /* already stopped */ }
      context.close();
      context = null;
      master = null;
      noise = null;
      tone = null;
    }

    function toggle() {
      if (destroyed) return;
      if (active) {
        active = false;
        stopAudio();
        label();
        return;
      }
      if (!buildAudio()) return;
      active = true;
      if (context && context.state === "suspended") context.resume();
      label();
    }

    button.addEventListener("click", toggle);
    label();
    return {
      toggle,
      destroy() {
        destroyed = true;
        button.removeEventListener("click", toggle);
        stopAudio();
      }
    };
  }

  global.CinematicSound = Object.freeze({ mount });
})(window, document);
