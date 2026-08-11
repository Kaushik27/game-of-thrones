// Evidence and provenance surface for a fan archive. It makes the boundary
// between canon, editorial framing, and speculation visible to every visitor.
(function installMaestersDesk(global, document) {
  "use strict";
  const instances = new WeakMap();
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));

  function count(name, fallback) {
    try { return Array.isArray(global[name]) ? global[name].length : fallback; } catch (_) { return fallback; }
  }

  function mount(root) {
    if (!root || instances.has(root)) return instances.get(root) || null;
    const records = [
      { id: "canon", title: "TV canon", tone: "canon", copy: "Episode, battle, event, and quote records from the eight-season television story.", links: [{ label: "Open episode atlas", href: "#/timeline?atlas=1" }, { label: "Read voices", href: "#/quotes" }] },
      { id: "chronology", title: "Fan chronology", tone: "fan", copy: "Long-history entries are editorially framed and intentionally acknowledge uncertain dates and disputed accounts.", links: [{ label: "Read the chronicle", href: "#/chronicle" }, { label: "Explore lore", href: "#/lore" }] },
      { id: "theory", title: "Fan speculation", tone: "theory", copy: "Counterfactual branches are creative prompts. They never overwrite the known record.", links: [{ label: "Enter What If", href: "#/what-if" }, { label: "Visit Memory Wall", href: "#/timeline" }] },
      { id: "portraits", title: "Image provenance", tone: "book", copy: "Character portraits are either verified open-license actor photographs or original illustrated studies; licensing details remain available in Credits.", links: [{ label: "View image credits", href: "#/credits" }, { label: "Meet the people", href: "#/characters" }] }
    ];
    root.className = "maesters-desk-host";
    root.innerHTML = `<section class="maesters-desk" aria-labelledby="maesters-desk-title"><header class="maesters-desk__hero"><p class="maesters-desk__eyebrow">The source room · read before you trust</p><h1 id="maesters-desk-title">The maesters<br><em>leave notes.</em></h1><p>Every archive needs a margin for doubt. This is where the Raven Wall tells you what is recorded, what is interpreted, and what fans are still arguing about.</p><dl><div><dt>${count("characters", 196)}</dt><dd>people indexed</dd></div><div><dt>${count("EPISODES", 73)}</dt><dd>episodes mapped</dd></div><div><dt>${count("quotes", 44)}</dt><dd>voices recorded</dd></div></dl></header><div class="maesters-desk__toolbar" role="group" aria-label="Evidence filters"><button type="button" data-desk-filter="all" aria-pressed="true">All notes</button>${records.map(record => `<button type="button" data-desk-filter="${esc(record.id)}" aria-pressed="false">${esc(record.title)}</button>`).join("")}</div><div class="maesters-desk__grid" data-desk-grid>${records.map((record, index) => `<article class="maesters-card" data-desk-kind="${esc(record.id)}" style="--maester-index:${index}"><div class="maesters-card__top"><span class="maesters-card__index">0${index + 1}</span>${typeof global.archiveBadge === "function" ? global.archiveBadge(record.title, record.tone) : `<span>${esc(record.title)}</span>`}</div><h2>${esc(record.title)}</h2><p>${esc(record.copy)}</p><div class="maesters-card__links">${record.links.map(link => `<a href="${esc(link.href)}">${esc(link.label)} <span aria-hidden="true">↗</span></a>`).join("")}</div></article>`).join("")}</div><footer class="maesters-desk__footer"><span>Sources and credits are part of the experience.</span><a href="#/credits">Open the full ledger ↗</a></footer></section>`;
    const buttons = [...root.querySelectorAll("[data-desk-filter]")];
    const cards = [...root.querySelectorAll("[data-desk-kind]")];
    root.addEventListener("click", event => {
      const button = event.target.closest("[data-desk-filter]");
      if (!button) return;
      const filter = button.dataset.deskFilter;
      buttons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      cards.forEach(card => { card.hidden = filter !== "all" && card.dataset.deskKind !== filter; });
    });
    const handle = { destroy() { instances.delete(root); root.replaceChildren(); } };
    instances.set(root, handle);
    return handle;
  }
  global.MaestersDesk = Object.freeze({ mount });
})(window, document);
