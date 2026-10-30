// Configuración de despliegue (Netlify, seguridad, repositorio).  npm test
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTOS } from "../src/data/products.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(path.join(root, f), "utf8");
const toml = read("netlify.toml");
const html = read("index.html");
const pkg = JSON.parse(read("package.json"));

test("netlify.toml: build, publicación, Node fijo y regla SPA", () => {
  assert.match(toml, /command\s*=\s*"npm run build"/);
  assert.match(toml, /publish\s*=\s*"dist"/);
  assert.match(toml, /NODE_VERSION\s*=\s*"\d+"/);
  assert.match(toml, /from\s*=\s*"\/\*"[\s\S]*to\s*=\s*"\/index\.html"[\s\S]*status\s*=\s*200/);
});
test("cabeceras de seguridad presentes (CSP, X-Frame-Options, nosniff, Referrer, Permissions)", () => {
  for (const h of ["Content-Security-Policy", "X-Frame-Options", "X-Content-Type-Options", "Referrer-Policy", "Permissions-Policy"]) assert.match(toml, new RegExp(h));
});
test("la CSP permite lo que index.html realmente carga (fuentes de Google) y prohíbe scripts en línea / terceros", () => {
  const csp = toml.match(/Content-Security-Policy\s*=\s*"([^"]+)"/)[1];
  const dir = (n) => (csp.split(";").map((s) => s.trim()).find((s) => s.startsWith(n + " ")) || "");
  if (/fonts\.googleapis\.com/.test(html)) assert.match(dir("style-src"), /https:\/\/fonts\.googleapis\.com/);
  if (/fonts\.gstatic\.com/.test(html)) assert.match(dir("font-src"), /https:\/\/fonts\.gstatic\.com/);
  assert.doesNotMatch(dir("script-src"), /unsafe-inline|unsafe-eval|\*/);
  assert.match(dir("frame-ancestors"), /'none'/);
  assert.match(dir("object-src"), /'none'/);
  const inline = [...html.matchAll(/<script\b([^>]*)>/gi)].filter((m) => !/\bsrc=/.test(m[1]) && !/ld\+json/.test(m[1]));
  assert.equal(inline.length, 0, "index.html no debe tener scripts en línea (la CSP los bloquearía)");
});
test("scripts de package.json: build encadena manifiesto → vite → sitemap; existe npm test", () => {
  assert.equal(pkg.scripts.build, "vite build && node scripts/postbuild.mjs");
  assert.match(pkg.scripts.prebuild, /gen-image-manifest/);
  assert.match(pkg.scripts.predev, /gen-image-manifest/);
  assert.ok(pkg.scripts.test);
});
test(".gitignore protege secretos y archivos locales", () => {
  const g = read(".gitignore");
  for (const x of ["node_modules", "dist", ".env", ".env.*"]) assert.ok(g.split("\n").includes(x), x);
});
test("no hay archivos .env ni secretos evidentes en el repositorio", () => {
  for (const f of [".env", ".env.local", ".env.production"]) assert.ok(!existsSync(path.join(root, f)), f);
  const files = ["index.html", "netlify.toml", "package.json", "src/config.js", "README.md"];
  for (const f of files) assert.doesNotMatch(read(f), /(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35}|ghp_[0-9A-Za-z]{30,}|sk-[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY)/, f);
});
test("robots.txt y sitemap de respaldo: coherentes con el catálogo", () => {
  const robots = read("public/robots.txt");
  assert.match(robots, /Sitemap: https:\/\/[^\s]+\/sitemap\.xml/);
  assert.match(robots, /Disallow: \/admin/);
  assert.doesNotMatch(robots, /Disallow: \/\s*$/m);
  const sm = read("public/sitemap.xml");
  for (const p of PRODUCTOS) assert.ok(sm.includes(`/perfume/${p.slug}<`), `sitemap sin ${p.slug}`);
  assert.doesNotMatch(sm, /\/carrito|\/admin/);
});
test("index.html: idioma, viewport, descripción y Open Graph con imagen absoluta que existe", () => {
  assert.match(html, /<html[^>]*lang="es/);
  assert.match(html, /name="viewport"/);
  assert.match(html, /name="description" content="[^"]{50,}/);
  const og = html.match(/property="og:image" content="(https:\/\/[^"]+)"/);
  assert.ok(og, "og:image absoluta");
  assert.ok(existsSync(path.join(root, "public", new URL(og[1]).pathname)), "el archivo og:image debe existir");
  assert.doesNotMatch(html, /rel="canonical"/, "la canonical la define cada ruta (src/seo.js)");
});

test("el validador SQL estático pasa (npm run db:check) y detecta funciones sin revocación explícita", async () => {
  const { execFileSync } = await import("node:child_process");
  const out = execFileSync(process.execPath, [path.join(root, "scripts", "sql", "check-migration.mjs")], { encoding: "utf8" });
  assert.match(out, /Validación estática: OK/);
});
test("el parche de privilegios es idéntico a la sección 6b de la migración", () => {
  const mig = read("supabase/migrations/0001_init.sql");
  const patch = read("supabase/patches/2026-fix-function-privileges.sql");
  const stmts = (t) => t.split("\n").filter((l) => /^(revoke|grant|alter default)/.test(l)).map((l) => l.replace(/\s+/g, " ").trim());
  const section = mig.slice(mig.indexOf("6b. Privilegios"), mig.indexOf("7. Fotografías"));
  assert.deepEqual(stmts(patch), stmts(section));
  assert.ok(stmts(section).length >= 20);
});
