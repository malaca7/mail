import fs from "node:fs";
import path from "node:path";

const publicDir = path.resolve(".output/public");
const assetsDir = path.join(publicDir, "assets");

if (!fs.existsSync(assetsDir)) {
  console.error("Assets directory not found:", assetsDir);
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));
const jsFile = files.find((f) => f.startsWith("index-") && f.endsWith(".js"));

if (!cssFile || !jsFile) {
  console.error("Could not find generated CSS or JS asset in .output/public/assets");
  console.log("Found files:", files);
  process.exit(1);
}

console.log(`[fix-gh-pages] Found CSS: assets/${cssFile}`);
console.log(`[fix-gh-pages] Found JS: assets/${jsFile}`);

const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
  <head>
    <script>
      (function() {
        try {
          var t = localStorage.getItem('malaca-mail:theme');
          if (t === 'light') {
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
          }
        } catch (e) {}
      })();
    </script>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Malaca Mail — Webmail Privado (@malaca.com.br)</title>
    <link rel="icon" type="image/svg+xml" href="logo-icon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="assets/${cssFile}" />
  </head>
  <body class="bg-background text-foreground antialiased">
    <div id="root"></div>
    <script type="module" src="assets/${jsFile}"></script>
  </body>
</html>
`;

// Write to index.html and 404.html in .output/public root
fs.writeFileSync(path.join(publicDir, "index.html"), htmlContent, "utf-8");
fs.writeFileSync(path.join(publicDir, "404.html"), htmlContent, "utf-8");

// Write to route directories if they exist with relative ../ asset paths
const subHtmlContent = htmlContent
  .replace('href="assets/', 'href="../assets/')
  .replace('src="assets/', 'src="../assets/')
  .replace('href="logo-icon.svg"', 'href="../logo-icon.svg"');

const subdirs = ["login", "criar-conta", "recuperar-senha"];
for (const sub of subdirs) {
  const dirPath = path.join(publicDir, sub);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  fs.writeFileSync(path.join(dirPath, "index.html"), subHtmlContent, "utf-8");
}

console.log("[fix-gh-pages] Successfully updated HTML files with clean asset link tags!");
