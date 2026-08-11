import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";

const LINKS = [
  { href: "#", label: "Explore", matches: ["#/"] },
  { href: "#/characters", label: "People", matches: ["#/characters", "#/character/"] },
  { href: "#/timeline", label: "Memory Wall", section: "memory" },
  { href: "#/timeline?atlas=1", label: "Atlas", section: "atlas" },
  { href: "#/chronicle", label: "Chronicle", matches: ["#/chronicle"] },
  { href: "#/quotes", label: "Voices", matches: ["#/quotes"] },
  { href: "#/map", label: "World", matches: ["#/map", "#/houses", "#/house/"] },
  { href: "#/lore", label: "Lore", matches: ["#/lore"] }
  , { href: "#/what-if", label: "What If", matches: ["#/what-if"] }
  , { href: "#/desk", label: "Desk", matches: ["#/desk"] }
];

function currentRoute() {
  const [path, queryString = ""] = (window.location.hash || "#/").split("?");
  return { path: path.trim() || "#/", query: new URLSearchParams(queryString) };
}

function isActive(link, route) {
  if (link.section === "memory") {
    return route.path === "#/timeline" && !["atlas", "season", "mode", "event", "episode"].some((key) => route.query.has(key));
  }
  if (link.section === "atlas") {
    return (route.path === "#/timeline" && ["atlas", "season", "mode", "event", "episode"].some((key) => route.query.has(key))) || route.path === "#/battles" || route.path.startsWith("#/episode/");
  }
  return link.matches.some((match) => match === "#/" ? route.path === "#/" : route.path === match || route.path.startsWith(match));
}

function ReactNav() {
  const [route, setRoute] = useState(currentRoute);
  const [open, setOpen] = useState(false);
  const [atmosphere, setAtmosphere] = useState(() => Boolean(window.GotAtmosphere?.isEnabled?.()));
  const [spoilerLens, setSpoilerLens] = useState(() => window.RealmCompass?.current?.() || "all");

  useEffect(() => {
    const onHashChange = () => {
      setRoute(currentRoute());
      setOpen(false);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    if (!window.GotAtmosphere?.subscribe) return undefined;
    return window.GotAtmosphere.subscribe(setAtmosphere);
  }, []);

  useEffect(() => {
    if (!window.RealmCompass?.subscribe) return undefined;
    return window.RealmCompass.subscribe(setSpoilerLens);
  }, []);

  const activeLabel = useMemo(() => LINKS.find((link) => isActive(link, route))?.label || "Explore", [route]);

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
        const active = isActive(link, route);
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
      "label",
      { className: "realm-lens", title: "Hide spoilers beyond your current season" },
      React.createElement("img", { className: "realm-lens__glyph", src: "assets/icons/snowflake.svg", alt: "" }),
      React.createElement("span", { className: "realm-lens__label" }, "Spoiler lens"),
      React.createElement(
        "select",
        {
          "data-realm-lens": "true",
          "aria-label": "Spoiler lens",
          value: spoilerLens,
          onChange: (event) => window.RealmCompass?.set?.(event.target.value)
        },
        (window.RealmCompass?.options || [{ value: "all", label: "Full realm" }]).map((option) => React.createElement("option", { value: option.value, key: option.value }, option.label))
      )
    ),
    React.createElement(
      "button",
      {
        type: "button",
        className: "nav-raven",
        "aria-label": "Let the raven choose a fragment",
        onClick: () => { window.location.hash = window.RealmCompass?.randomDestination?.() || "#/quotes"; }
      },
      React.createElement("img", { src: "assets/icons/compass.svg", alt: "" }),
      React.createElement("span", { className: "nav-raven__label" }, "Raven")
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
