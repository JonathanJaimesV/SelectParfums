// llms.txt y manifiesto ARD (ai-catalog.json): formato, esquema oficial y enlaces que existen de verdad.  npm test
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PRODUCTOS } from "../src/data/products.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => readFileSync(path.join(root, f), "utf8");
// src/config.js usa import.meta.env (solo existe en Vite): el dominio se lee del texto del archivo.
const SITE_URL = read("src/config.js").match(/SITE_URL\s*=\s*"([^"]+)"/)[1];
const llms = read("public/llms.txt");
const catalogRaw = read("public/.well-known/ai-catalog.json");
const schema = JSON.parse(read("tests/helpers/ai-catalog.schema.json"));
const toml = read("netlify.toml");

// Rutas públicas reales: las del enrutador (src/App.jsx) que no son privadas, más los archivos estáticos de public/.
const ROUTES = new Set(["/", "/catalogo", "/marcas", "/decants", "/como-pedir", ...PRODUCTOS.map((p) => `/perfume/${p.slug}`)]);
const app = read("src/App.jsx");
for (const r of ["catalogo", "marcas", "decants", "como-pedir"]) assert.match(app, new RegExp(`path="${r}"`), `App.jsx ya no tiene la ruta /${r}`);
const exists = (url) => {
  assert.ok(url.startsWith(SITE_URL), `no usa el dominio canónico: ${url}`);
  const p = url.slice(SITE_URL.length) || "/";
  return ROUTES.has(p) || existsSync(path.join(root, "public", p));
};

// Validador mínimo de JSON Schema (solo las palabras clave que usa el esquema oficial de ARD).
function validate(data, sch, root_, at = "$", errs = []) {
  if (sch.$ref) return validate(data, sch.$ref.slice(2).split("/").reduce((o, k) => o[k], root_), root_, at, errs);
  const types = [].concat(sch.type || []);
  const tof = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : typeof v);
  if (types.length && !types.includes(tof(data))) { errs.push(`${at}: tipo ${tof(data)}, se esperaba ${types}`); return errs; }
  if (sch.enum && !sch.enum.includes(data)) errs.push(`${at}: valor fuera de ${JSON.stringify(sch.enum)}`);
  if (sch.pattern && !new RegExp(sch.pattern).test(data)) errs.push(`${at}: no cumple ${sch.pattern}`);
  if (sch.format === "uri" && !/^https?:\/\/[^\s]+$/.test(data)) errs.push(`${at}: URI inválida`);
  if (sch.minItems != null && data.length < sch.minItems) errs.push(`${at}: menos de ${sch.minItems} elementos`);
  if (sch.maxItems != null && data.length > sch.maxItems) errs.push(`${at}: más de ${sch.maxItems} elementos`);
  if (sch.required) for (const k of sch.required) if (!(k in data)) errs.push(`${at}: falta "${k}"`);
  if (sch.not && validate(data, sch.not, root_, at, []).length === 0) errs.push(`${at}: cumple un "not"`);
  if (sch.oneOf) { const ok = sch.oneOf.filter((s) => validate(data, s, root_, at, []).length === 0).length; if (ok !== 1) errs.push(`${at}: oneOf cumple ${ok} alternativas (debe ser 1: url XOR data)`); }
  if (tof(data) === "object") {
    for (const [k, v] of Object.entries(data)) {
      if (sch.properties?.[k]) validate(v, sch.properties[k], root_, `${at}.${k}`, errs);
      else if (sch.additionalProperties === false) errs.push(`${at}: propiedad no permitida "${k}"`);
      else if (typeof sch.additionalProperties === "object") validate(v, sch.additionalProperties, root_, `${at}.${k}`, errs);
    }
  }
  if (tof(data) === "array" && sch.items) data.forEach((v, i) => validate(v, sch.items, root_, `${at}[${i}]`, errs));
  return errs;
}

test("llms.txt: H1, resumen, longitud suficiente y enlaces Markdown absolutos", () => {
  assert.match(llms, /^# \S.*/, "debe empezar con un H1");
  assert.equal([...llms.matchAll(/^# /gm)].length, 1, "un solo H1");
  assert.match(llms, /^> .{40,}/m, "resumen en cita");
  assert.ok(llms.length >= 50);
  const links = [...llms.matchAll(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g)];
  assert.ok(links.length >= 5, "al menos varios enlaces Markdown");
  assert.doesNotMatch(llms.replace(/\[[^\]]+\]\([^)]+\)/g, ""), /https?:\/\//, "no debe haber URLs sueltas fuera de enlaces Markdown");
  for (const [, , url] of links) {
    assert.ok(exists(url), `el enlace no corresponde a una ruta o archivo real: ${url}`);
    assert.doesNotMatch(url, /\/admin|\/carrito/);
  }
});
test("llms.txt: sin datos privados (teléfono, correo, claves)", () => {
  assert.doesNotMatch(llms, /wa\.me|@[\w.-]+\.\w+|\b\d{9,}\b|supabase|apikey|password/i);
});

test("ai-catalog.json: JSON válido y cumple el esquema oficial ARD (specVersion 1.0)", () => {
  const cat = JSON.parse(catalogRaw);
  const errs = validate(cat, schema, schema);
  assert.deepEqual(errs, []);
  assert.equal(cat.specVersion, "1.0");
  assert.ok(cat.entries.length > 0);
});
test("ai-catalog.json: identificadores únicos anclados al dominio y URLs reales", () => {
  const cat = JSON.parse(catalogRaw);
  const host = new URL(SITE_URL).hostname;
  const ids = cat.entries.map((e) => e.identifier);
  assert.equal(new Set(ids).size, ids.length, "identificadores repetidos");
  for (const e of cat.entries) {
    assert.ok(e.identifier.startsWith(`urn:air:${host}:`), e.identifier);
    assert.ok(exists(e.url), `url inexistente: ${e.url}`);
  }
  for (const u of [cat.host.documentationUrl, cat.host.logoUrl]) assert.ok(exists(u), u);
});
test("ai-catalog.json: la copia de la raíz es idéntica a /.well-known/", () => {
  assert.equal(read("public/ai-catalog.json"), catalogRaw);
});

test("descubrimiento: robots.txt (Agentmap) y <link rel=ai-catalog> apuntan al manifiesto", () => {
  assert.match(read("public/robots.txt"), new RegExp(`^Agentmap: ${SITE_URL}/\\.well-known/ai-catalog\\.json$`, "m"));
  assert.match(read("index.html"), /<link rel="ai-catalog"[^>]*href="\/\.well-known\/ai-catalog\.json"/);
});
test("netlify.toml: tipos MIME y CORS de los tres archivos", () => {
  for (const [f, mime] of [["/llms.txt", "text/markdown"], ["/ai-catalog.json", "application/json"], ["/.well-known/ai-catalog.json", "application/json"]]) {
    const blk = toml.split("[[headers]]").find((b) => new RegExp(`for\\s*=\\s*"${f.replace(/[./]/g, "\\$&")}"`).test(b));
    assert.ok(blk, `sin cabeceras para ${f}`);
    assert.match(blk, new RegExp(`Content-Type\\s*=\\s*"${mime.replace("/", "\\/")}`));
    assert.match(blk, /Access-Control-Allow-Origin\s*=\s*"\*"/);
  }
});

test("el validador detecta manifiestos inválidos (no es una prueba vacía)", () => {
  const ok = JSON.parse(catalogRaw);
  const bad = (mut) => { const c = structuredClone(ok); mut(c); return validate(c, schema, schema).length; };
  assert.ok(bad((c) => delete c.specVersion) > 0);
  assert.ok(bad((c) => { c.entries[0].data = {}; }) > 0, "url y data a la vez");
  assert.ok(bad((c) => { c.entries[0].representativeQueries = ["una sola"]; }) > 0);
  assert.ok(bad((c) => { c.entries[0].identifier = "selectparfums"; }) > 0);
  assert.ok(bad((c) => { c.extra = 1; }) > 0);
});
