// Validación ESTÁTICA de supabase/migrations/*.sql (no sustituye la ejecución real en PostgreSQL).
// Uso: node scripts/sql/check-migration.mjs   →  código 1 si hay errores.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const dir = path.join(root, "supabase", "migrations");
const errors = [], notes = [];
const err = (m) => errors.push(m), note = (m) => notes.push(m);

for (const f of readdirSync(dir).filter((x) => x.endsWith(".sql")).sort()) {
  const src = readFileSync(path.join(dir, f), "utf8");
  const code = src.replace(/--[^\n]*/g, "");               // sin comentarios de línea
  note(`${f}: ${src.split("\n").length} líneas`);

  // 1. Bloques dollar-quoted pareados
  if (code.split("$$").length % 2 === 0) err(`${f}: bloques $$ desequilibrados`);
  // 2. Paréntesis y comillas simples equilibrados (fuera de cadenas)
  const noStr = code.replace(/'(?:[^']|'')*'/g, "''");
  if ((noStr.match(/\(/g) || []).length !== (noStr.match(/\)/g) || []).length) err(`${f}: paréntesis desequilibrados`);
  if ((code.replace(/''/g, "").match(/'/g) || []).length % 2) err(`${f}: comillas simples desequilibradas`);

  // 3. Toda función declara LANGUAGE y, si es SECURITY DEFINER, fija search_path
  for (const m of code.matchAll(/create or replace function public\.(\w+)\(([\s\S]*?)\)\s*returns[\s\S]*?\$\$/g)) {
    const head = m[0];
    if (!/language\s+\w+/.test(head) && !/\$\$\s*language\s+\w+/.test(code.slice(m.index, m.index + 2000))) err(`${f}: función ${m[1]} sin LANGUAGE`);
    if (/security definer/.test(head) && !/set search_path\s*=/.test(head)) err(`${f}: ${m[1]} es SECURITY DEFINER sin search_path fijado`);
  }

  // 4. RLS habilitado en TODAS las tablas de negocio (todas salvo ninguna excepción documentada)
  const tables = [...code.matchAll(/create table if not exists public\.(\w+)/g)].map((m) => m[1]);
  const rls = new Set([...code.matchAll(/alter table public\.(\w+)\s+enable row level security/g)].map((m) => m[1]));
  for (const t of tables) if (!rls.has(t)) err(`${f}: la tabla ${t} NO tiene RLS`);

  // 5. Ninguna política de escritura para anon; ningún GRANT de escritura a anon
  if (/to anon[^;]*(insert|update|delete)/i.test(code)) err(`${f}: hay una política de escritura para anon`);
  if (/grant[^;]*(insert|update|delete)[^;]*to\s+anon/i.test(code)) err(`${f}: GRANT de escritura a anon`);

  // 6. Sin DELETE para administradores sobre el catálogo (un perfume nunca se borra)
  if (/create policy \w+ on public\.(products|product_presentations) for (all|delete)/i.test(code)) err(`${f}: política DELETE/ALL sobre el catálogo`);
  if (/grant[^;]*delete[^;]*on public\.(products|product_presentations)/i.test(code)) err(`${f}: GRANT DELETE sobre el catálogo`);

  // 7. Funciones de administración: exigen is_admin() dentro del cuerpo y solo se conceden a authenticated
  for (const fn of ["admin_save_product", "admin_set_order_status", "admin_set_order_notes", "admin_set_inventory"]) {
    const m = code.match(new RegExp(`create or replace function public\\.${fn}[\\s\\S]*?\\$\\$;`));
    if (!m) { err(`${f}: falta ${fn}`); continue; }
    if (!/public\.is_admin\(\)/.test(m[0])) err(`${f}: ${fn} no comprueba is_admin()`);
    if (new RegExp(`grant execute on function public\\.${fn}[^;]*to[^;]*anon`).test(code)) err(`${f}: ${fn} concedida a anon`);
  }

  // 7b. Supabase concede EXECUTE a anon/authenticated por defecto sobre cada función nueva y «revoke … from public» NO lo quita.
  //     Toda función de public debe revocarse EXPLÍCITAMENTE a anon y authenticated (hallazgo del primer autotest real).
  if (!/alter default privileges in schema public revoke[^;]*on functions from[^;]*\banon\b/i.test(code)) err(`${f}: falta «alter default privileges … revoke … on functions from … anon»`);
  for (const m of code.matchAll(/create or replace function public\.(\w+)\(/g)) {
    const fn = m[1];
    // Se juntan TODAS las revocaciones de esta función (puede haber una antigua «from public» y una completa más abajo).
    const rev = new RegExp(`revoke\\s+(?:all|execute)\\s+on function public\\.${fn}\\([^)]*\\)\\s+from\\s+([^;]*)`, "gi");
    const targets = [...code.matchAll(rev)].map((r) => r[1]).join(" ");
    if (!targets) { err(`${f}: la función ${fn} no se revoca explícitamente (anon/authenticated la heredarían de Supabase)`); continue; }
    if (!/\banon\b/i.test(targets) || !/\bauthenticated\b/i.test(targets)) err(`${f}: la revocación de ${fn} debe incluir anon y authenticated`);
  }
  // 7c. Solo estas funciones pueden concederse a anon (todo lo demás, jamás)
  const anonOk = new Set(["is_admin", "create_order"]);
  for (const m of code.matchAll(/grant\s+execute\s+on\s+function\s+public\.(\w+)\([^)]*\)\s+to\s+([^;]*)/gi)) {
    if (/\banon\b/i.test(m[2]) && !anonOk.has(m[1])) err(`${f}: ${m[1]} se concede a anon (solo is_admin y create_order pueden)`);
  }

  // 8. Llamadas a tablas/funciones que no existen
  const defined = new Set([...code.matchAll(/create (?:table if not exists|or replace function) public\.(\w+)/g)].map((m) => m[1]));
  const used = new Set([...code.matchAll(/(?:from|into|update|join|references)\s+public\.(\w+)/g)].map((m) => m[1]));
  for (const u of used) if (!defined.has(u)) err(`${f}: referencia a public.${u} que no está definido`);
  // 9. El bloqueo del histórico no depende de pg_trigger_depth
  if (/pg_trigger_depth/.test(code)) err(`${f}: uso de pg_trigger_depth (bloqueo del histórico frágil)`);
}

/* ───────── Revisión de los scripts de prueba (supabase/tests/*.sql) ───────── */
// Dollar-quoting: dentro de $tag$ … $tag$ solo cierra el MISMO tag; los demás son texto.
function dollarBalanced(src) {
  let i = 0, open = null;
  const re = /\$([A-Za-z_]*)\$/g; let m;
  while ((m = re.exec(src))) {
    if (open === null) open = m[0];
    else if (m[0] === open) open = null;
  }
  return open === null;
}
const testsDir = path.join(root, "supabase", "tests");
try {
  for (const f of readdirSync(testsDir).filter((x) => x.endsWith(".sql")).sort()) {
    const src = readFileSync(path.join(testsDir, f), "utf8");
    const code = src.replace(/--[^\n]*/g, "");
    note(`tests/${f}: ${src.split("\n").length} líneas`);
    if (!dollarBalanced(code)) err(`tests/${f}: bloques dollar-quoted desequilibrados`);
    // `raise` solo es válido dentro de funciones/DO: no puede aparecer suelto al final del archivo
    const outside = code.replace(/\$([A-Za-z_]*)\$[\s\S]*?\$\1\$/g, "");
    if (/\braise\s+(notice|exception)/i.test(outside)) err(`tests/${f}: RAISE fuera de un bloque DO/función`);
    // la limpieza no puede intentar borrar histórico (lo bloquean los triggers): todo debe revertirse con la excepción final
    if (/delete\s+from\s+public\.(order_items|order_events)/i.test(outside)) err(`tests/${f}: intenta borrar histórico fuera de la prueba de rechazo`);
    if (f === "selftest.sql" && !/SELFTEST OK/.test(code)) err(`tests/${f}: falta el mensaje final SELFTEST OK`);
    if (f === "selftest.sql" && !/pg_temp\.expect_fail/.test(code)) err(`tests/${f}: sin pruebas negativas`);
  }
} catch (e) { err(`no se pudo leer supabase/tests: ${e.message}`); }

/* ───────── Semillas (supabase/seed/*.sql): solo inserciones idempotentes, nada destructivo ───────── */
try {
  const seedDir = path.join(root, "supabase", "seed");
  for (const f of readdirSync(seedDir).filter((x) => x.endsWith(".sql")).sort()) {
    const src = readFileSync(path.join(seedDir, f), "utf8");
    const code = src.replace(/--[^\n]*/g, "");
    note(`seed/${f}: ${src.split("\n").length} líneas`);
    const bare = code.replace(/'(?:[^']|'')*'/g, "''");               // sin el contenido de las cadenas
    if (/\b(delete|drop|truncate|alter|update|grant|revoke)\b/i.test(bare)) err(`seed/${f}: contiene una sentencia destructiva o de permisos`);
    if ((code.replace(/''/g, "").match(/'/g) || []).length % 2) err(`seed/${f}: comillas simples desequilibradas`);
    if (/insert into/i.test(bare) && !/on conflict/i.test(bare)) err(`seed/${f}: INSERT sin ON CONFLICT (no es idempotente)`);
    if (/service_role|password|secret/i.test(bare)) err(`seed/${f}: menciona credenciales`);
  }
} catch (e) { err(`no se pudo leer supabase/seed: ${e.message}`); }

for (const n of notes) console.log("  ·", n);
if (errors.length) { console.error("\nERRORES:"); errors.forEach((e) => console.error("  ✗", e)); process.exit(1); }
console.log("\nValidación estática: OK (esto NO prueba que el SQL se ejecute en PostgreSQL)");
