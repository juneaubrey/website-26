// Minimal static file server for Node-based hosting. No dependencies.
const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 3000;
const dist = path.join(__dirname, "dist");
const root = fs.existsSync(path.join(dist, "index.html")) ? dist : __dirname;
const allowed = ["index.html", "imprint.html", "privacy.html", "assets"];

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2"
};

http.createServer((req, res) => {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Bad request");
    return;
  }
  if (urlPath === "/") urlPath = "/index.html";
  const file = path.normalize(path.join(root, urlPath));
  const top = path.relative(root, file).split(path.sep)[0];

  if (!file.startsWith(root + path.sep) || !allowed.includes(top)) {
    res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
    return;
  }
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(port, () => console.log(`Serving ${root} on port ${port}`));
