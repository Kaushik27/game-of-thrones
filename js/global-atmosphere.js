// Shared, opt-in atmosphere controller. It creates a very quiet low-frequency
// bed only after an explicit user gesture; no audio is fetched or persisted.
(function installGlobalAtmosphere(global, document) {
  "use strict";
  let context = null;
  let master = null;
  let noise = null;
  let tone = null;
  let enabled = false;
  const listeners = new Set();

  function announce() {
    document.documentElement.toggleAttribute("data-atmosphere-on", enabled);
    global.dispatchEvent(new CustomEvent("got:atmosphere", { detail: { enabled } }));
    listeners.forEach(listener => listener(enabled));
  }

  function start() {
    const AudioContext = global.AudioContext || global.webkitAudioContext;
    if (!AudioContext) return false;
    context = new AudioContext();
    master = context.createGain();
    master.gain.value = 0.028;
    master.connect(context.destination);
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const channel = buffer.getChannelData(0);
    let last = 0;
    for (let index = 0; index < channel.length; index += 1) {
      last = last * 0.987 + (Math.random() * 2 - 1) * 0.013;
      channel[index] = last * 1.8;
    }
    noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 560;
    noise.connect(filter).connect(master);
    noise.start();
    tone = context.createOscillator();
    tone.type = "sine";
    tone.frequency.value = 49;
    const toneGain = context.createGain();
    toneGain.gain.value = 0.16;
    tone.connect(toneGain).connect(master);
    tone.start();
    return true;
  }

  function stop() {
    if (!context) return;
    try { noise && noise.stop(); } catch (_) { /* already stopped */ }
    try { tone && tone.stop(); } catch (_) { /* already stopped */ }
    context.close();
    context = null;
    master = null;
    noise = null;
    tone = null;
  }

  function setEnabled(next) {
    const desired = Boolean(next);
    if (desired === enabled) return enabled;
    if (desired && !start()) return enabled;
    if (!desired) stop();
    enabled = desired;
    if (context && context.state === "suspended") context.resume();
    announce();
    return enabled;
  }

  global.GotAtmosphere = Object.freeze({
    isEnabled: () => enabled,
    toggle: () => setEnabled(!enabled),
    subscribe(listener) {
      if (typeof listener !== "function") return () => {};
      listeners.add(listener);
      listener(enabled);
      return () => listeners.delete(listener);
    }
  });
})(window, document);
