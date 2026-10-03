// Copies the static site into dist/ so hosts expecting a build output folder can publish it.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "dist");
const entries = ["index.html", "imprint.html", "privacy.html", "assets"];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
for (const entry of entries) {
  fs.cpSync(path.join(root, entry), path.join(out, entry), { recursive: true });
}
console.log("Built site to dist/");
