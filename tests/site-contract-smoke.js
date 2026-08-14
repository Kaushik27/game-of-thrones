"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const frontendIndex = fs.readFileSync(path.join(root, "frontend/index.html"), "utf8");
const appSource = fs.readFileSync(path.join(root, "js/app.js"), "utf8");
const requiredRoutes = ["/", "/characters", "/houses", "/map", "/citadel", "/timeline", "/quotes", "/chronicle", "/lore"];
const requiredAssets = ["css/theme.css", "css/mother-template.css", "js/app.js", "js/data.js", "js/episodes.js", "js/quotes.js"];

requiredRoutes.forEach(route => assert.match(appSource, new RegExp(route.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `router must recognize ${route}`));
requiredAssets.forEach(asset => assert.ok(fs.existsSync(path.join(root, asset)), `required asset missing: ${asset}`));
assert.match(index, /<meta name="description" content="[^"]+"/);
assert.match(index, /<meta property="og:title" content="[^"]+"/);
assert.match(index, /<link rel="canonical" href="[^"]+"/);
assert.match(frontendIndex, /<meta name="description" content="[^"]+"/);
assert.ok(fs.existsSync(path.join(root, "robots.txt")), "robots.txt must be present");
assert.ok(fs.existsSync(path.join(root, "sitemap.xml")), "sitemap.xml must be present");
assert.ok(fs.existsSync(path.join(root, "realm-contract.json")), "realm contract must be published");
console.log(JSON.stringify({ result: "passed", routes: requiredRoutes.length, assets: requiredAssets.length }));
