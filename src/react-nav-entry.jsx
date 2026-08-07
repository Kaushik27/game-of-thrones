import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const LINKS = [
  { href: "#", label: "Explore", matches: ["#/"] },
  { href: "#/characters", label: "People", matches: ["#/characters", "#/character/"] },
  { href: "#/timeline", label: "Memory Wall", matches: ["#/timeline", "#/battles", "#/episode/"] },
  { href: "#/quotes", label: "Voices", matches: ["#/quotes"] },
  { href: "#/map", label: "World", matches: ["#/map", "#/houses", "#/house/"] },
  { href: "#/lore", label: "Lore", matches: ["#/lore"] }
];

function currentPath() {
  return (window.location.hash || "#/").split("?")[0];
}

function isActive(link, path) {
  return link.matches.some((match) => match === "#/" ? path === "#/" : path === match || path.startsWith(match));
}

function ReactNav() {
  const [path, setPath] = useState(currentPath);
  const [open, setOpen] = useState(false);
  const [atmosphere, setAtmosphere] = useState(() => Boolean(window.GotAtmosphere?.isEnabled?.()));

  useEffect(() => {
    const onHashChange = () => {
      setPath(currentPath());
      setOpen(false);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!window.GotAtmosphere?.subscribe) return undefined;
    return window.GotAtmosphere.subscribe(setAtmosphere);
  }, []);

  const activeLabel = useMemo(() => LINKS.find((link) => isActive(link, path))?.label || "Explore", [path]);

  return React.createElement(
    "nav",
    { className: "react-nav-shell", "aria-label": "Primary navigation", "data-react-owned": "true" },
    React.createElement(
      "a",
      { className: "brand", href: "#/", "aria-label": "Game of Thrones home" },
      React.createElement("span", { className: "brand-title" },
        "GAME ", React.createElement("small", null, "OF"), " ", React.createElement("strong", null, "THRONES"),
        React.createElement("small", { className: "brand-note" }, "A fan archive")
      )
    ),
    React.createElement(
      "nav",
      { className: `nav-links${open ? " open" : ""}`, id: "react-nav-links", "aria-label": "Archive sections" },
      LINKS.map((link) => {
        const active = isActive(link, path);
        return React.createElement(
          "a",
          {
            href: link.href,
            className: active ? "active" : "",
            "aria-current": active ? "page" : undefined,
            onClick: () => setOpen(false),
            key: link.label
          },
          link.label
        );
      })
    ),
    React.createElement(
      "button",
      {
        type: "button",
        className: "nav-search",
        "data-raven-search-trigger": "true",
        "aria-label": "Search the realm",
        onClick: () => document.querySelector("[data-raven-search-trigger]:not(.react-nav-shell .nav-search)")?.click()
      },
      React.createElement("span", null, "Search"), React.createElement("kbd", null, "/")
    ),
    React.createElement(
      "button",
      {
        type: "button",
        className: `nav-atmosphere${atmosphere ? " is-on" : ""}`,
        "data-atmosphere-control": "true",
        "aria-pressed": atmosphere,
        "aria-label": atmosphere ? "Mute atmosphere" : "Enable atmospheric sound",
        onClick: () => window.GotAtmosphere?.toggle?.()
      },
      React.createElement("span", { className: "nav-atmosphere__dot", "aria-hidden": "true" }),
      React.createElement("span", null, atmosphere ? "Atmosphere on" : "Sound off")
    ),
    React.createElement(
      "button",
      {
        type: "button",
        className: "nav-toggle",
        "aria-label": open ? "Close navigation" : "Open navigation",
        "aria-controls": "react-nav-links",
        "aria-expanded": open,
        onClick: () => setOpen((value) => !value)
      },
      React.createElement("span", { className: "nav-toggle-label" }, open ? "Close" : "Menu")
    ),
    React.createElement("span", { className: "react-nav-status", "aria-live": "polite" }, `Current section: ${activeLabel}`)
  );
}

const mount = document.getElementById("site-nav");
if (mount) {
  // Prevent the legacy renderer in common.js from replacing the React tree.
  window.__reactShellOwned = true;
  createRoot(mount).render(React.createElement(ReactNav));
}
