// A focused, non-canon counterfactual chamber. It gives fan theories a home
// without mixing speculation into the canon archive.
(function installWhatIf(global, document) {
  "use strict";
  const instances = new WeakMap();
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  function visible(record) {
    return Boolean(record);
  }

  function mount(root, options) {
    if (!root || instances.has(root)) return instances.get(root) || null;
    const records = Array.isArray(global.WHAT_IFS) ? global.WHAT_IFS : [];
    const config = options && typeof options === "object" ? options : {};
    let selectedId = config.initialId || records[0]?.id || "";
    let status = "";
    root.className = "what-if-host";
    root.innerHTML = `<section class="what-if" aria-labelledby="what-if-title">
      <header class="what-if__hero">
        <div class="what-if__hero-copy"><p class="what-if__eyebrow">The fan canon · clearly marked speculation</p><h1 id="what-if-title">The road not taken.</h1><p>Every decision in Westeros opens a door. Step through the impossible ones and see which alliances, losses, and legends might have followed.</p><div class="what-if__actions"><button type="button" class="what-if__button what-if__button--solid" data-what-if-random>Let the raven choose</button><a class="what-if__button" href="#/chronicle">Return to the known record</a></div></div>
        <div class="what-if__hero-art" aria-hidden="true"><img src="assets/icons/compass.svg" alt=""><span></span><span></span><span></span></div>
      </header>
      <div class="what-if__notice"><span class="what-if__notice-mark" aria-hidden="true">!</span><p><strong>Fan speculation.</strong> These branches are creative prompts and never part of the TV or book canon.</p><span class="what-if__status" role="status" aria-live="polite"></span></div>
      <div class="what-if__layout"><aside class="what-if__rail" aria-label="Counterfactual scenarios" data-what-if-list></aside><article class="what-if__detail" data-what-if-detail tabindex="-1"></article></div>
    </section>`;
    const list = root.querySelector("[data-what-if-list]");
    const detail = root.querySelector("[data-what-if-detail]");
    const statusNode = root.querySelector(".what-if__status");

    function available() { return records.filter(visible); }
    function current() { return records.find(record => record.id === selectedId && visible(record)) || available()[0] || records[0]; }
    function renderList() {
      const active = current();
      list.innerHTML = available().map(record => `<button type="button" class="what-if__choice${record.id === active?.id ? " is-active" : ""}" data-what-if-id="${esc(record.id)}" aria-pressed="${String(record.id === active?.id)}"><span class="what-if__choice-kicker">${esc(record.kicker)}</span><strong>${esc(record.title)}</strong><small>Fan branch · S${record.season}</small></button>`).join("") || `<p class="what-if__empty">This branch is beyond your spoiler lens. Widen the lens to enter it.</p>`;
    }
    function renderDetail(announce) {
      const record = current();
      if (!record) { detail.innerHTML = `<p class="what-if__empty">No counterfactuals are visible under this lens.</p>`; return; }
      selectedId = record.id;
      detail.innerHTML = `<p class="what-if__detail-kicker">${esc(record.kicker)} · Fan branch</p><h2>${esc(record.title)}</h2><p class="what-if__premise">${esc(record.premise)}</p><div class="what-if__split"><div><span class="what-if__label">The divergence</span><p>${esc(record.divergence)}</p></div><div><span class="what-if__label">What it touches</span><div class="what-if__people">${record.relatedCharacters.map(id => { const character = typeof global.getCharacter === "function" ? global.getCharacter(id) : null; return character ? `<a href="#/character/${esc(character.id)}">${typeof global.avatarHTML === "function" ? global.avatarHTML(character, 34) : ""}<span>${esc(character.name)}</span></a>` : ""; }).join("")}</div></div></div><div class="what-if__branches"><span class="what-if__label">Possible consequences</span><ol>${record.branches.map(branch => `<li>${esc(branch)}</li>`).join("")}</ol></div><div class="what-if__detail-actions"><a class="what-if__button what-if__button--solid" href="${esc(record.relatedHref)}">Follow the canon thread <span aria-hidden="true">↗</span></a><button type="button" class="what-if__button" data-what-if-share>Share this branch</button></div>`;
      renderList();
      if (announce) { status = announce; statusNode.textContent = status; }
    }
    function choose(id, announce) {
      if (records.some(record => record.id === id && visible(record))) selectedId = id;
      renderDetail(announce);
      detail.focus({ preventScroll: true });
    }
    root.addEventListener("click", event => {
      const choice = event.target.closest("[data-what-if-id]");
      if (choice) { choose(choice.dataset.whatIfId, "Branch opened."); return; }
      if (event.target.closest("[data-what-if-random]")) { const pool = available(); if (pool.length) choose(pool[Math.floor(Math.random() * pool.length)].id, "The raven chose a different road."); return; }
      if (event.target.closest("[data-what-if-share]")) {
        const record = current();
        const url = `${global.location.origin}${global.location.pathname}#/what-if?branch=${encodeURIComponent(record.id)}`;
        const text = `${record.title} — a fan branch from The Raven Wall`;
        if (global.navigator?.share) global.navigator.share({ title: record.title, text, url }).catch(() => {});
        else if (global.navigator?.clipboard) global.navigator.clipboard.writeText(`${text}\n${url}`).then(() => { statusNode.textContent = "Branch link copied."; });
      }
    });
    renderDetail();
    const handle = { destroy() { instances.delete(root); root.replaceChildren(); } };
    instances.set(root, handle);
    return handle;
  }
  global.WhatIfChamber = Object.freeze({ mount });
})(window, document);
