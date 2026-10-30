# Auditoría de `supabase/migrations/0001_init.sql`

## Estado de verificación (léelo antes que nada)
| Nivel | Estado |
|---|---|
| Revisión manual línea por línea | ✅ realizada (errores y correcciones abajo) |
| Validación **estática** automática (`npm run db:check`) | ✅ pasa; se probó que **detecta** migraciones defectuosas (RLS ausente, DELETE sobre el catálogo, SECURITY DEFINER sin `search_path`, funciones admin sin `is_admin()`, semillas destructivas, `RAISE` suelto, limpieza que borra histórico) |
| **Ejecución en PostgreSQL / Supabase** | ❌ **NO REALIZADA.** No había PostgreSQL ni parser SQL ni red. **La migración no está validada.** |
| Autoverificación SQL (`supabase/tests/selftest.sql`, 92 comprobaciones) | ✅ escrita y revisada; ❌ **no ejecutada** |
| Concurrencia (`supabase/tests/concurrency.sh`) | ✅ escrita; ❌ **no ejecutada** |

Que las comprobaciones estáticas pasen **no** significa que el SQL funcione. Pasos para validarla de verdad: `docs/ADMIN-SETUP.md` §4.

## Primer hallazgo de una EJECUCIÓN REAL (autotest en un proyecto de pruebas de Supabase)
| Fecha | Resultado |
|---|---|
| Migración `0001_init.sql` | ✅ aplicada sin errores en el proyecto de pruebas (confirmado con captura: «Success. No rows returned»). |
| Autotest `selftest.sql` | ❌ **FALLÓ en A4**: `anon puede ejecutar public.admin_save_product(jsonb)`. |

**Causa:** Supabase concede `EXECUTE` a `anon` y `authenticated` **por defecto y de forma directa** sobre cada función nueva de `public`. La migración solo hacía `revoke … from public`, que no quita esos permisos. Mi revisión manual y mi validador estático **no lo detectaron** (solo miraban los `grant` explícitos): únicamente apareció al ejecutar en un PostgreSQL real.
**Impacto:** `admin_save_product` y similares comprueban `is_admin()` por dentro (un anónimo recibe `FORBIDDEN`), pero la barrera no debía depender solo de eso. Más grave en teoría: `order_to_json(uuid)` no comprueba nada y era invocable por `anon`: quien conociera el UUID de un pedido (no adivinable) podría leerlo.
**Corrección:** sección 6b de la migración (revocación explícita a `public, anon, authenticated` de las 13 funciones + `alter default privileges`) y parche `supabase/patches/2026-fix-function-privileges.sql` para el proyecto ya instalado. El validador ahora exige esa revocación por función y se probó con 5 mutaciones. **Pendiente: volver a pasar el autotest tras aplicar el parche.**

## Errores encontrados en la revisión y corregidos
| # | Gravedad | Problema | Corrección |
|---|---|---|---|
| 1 | **Crítico** | `create_order` insertaba el pedido con un total provisional y luego hacía `update` del total, pero el trigger de inmutabilidad lo bloquea: **ningún pedido se habría podido crear**. | Valida y calcula todo primero; inserta cabecera y líneas una sola vez con el total real. |
| 2 | Alto | `authenticated` podía hacer `DELETE` sobre el catálogo (borrar un perfume sin pedidos y perder su `id`). | Sin política ni `GRANT` de DELETE. Se archiva (`status='archived'`). Un `selftest` y el validador lo vigilan. |
| 3 | Bajo (preventivo) | **Rectificación:** presenté esto como un bug de carrera, pero en `READ COMMITTED` (nivel por defecto de PostgREST) el segundo `INSERT` espera al primero y, tras el `unique_violation`, el `select` ya ve el pedido; el código original probablemente funcionaba. | Se añadió un reintento de lectura (20 × 50 ms) solo como defensa ante otros niveles de aislamiento. **Sin probar bajo concurrencia real** (`concurrency.sh`). |
| 4 | Alto | `admin_save_product` (edición) reemplazaba `images` y `notes` por valores vacíos si el campo se omitía: borraba fotos. | Actualización parcial: lo omitido se conserva. |
| 5 | Medio | JSON `null` (operador `->`) no es SQL NULL: `coalesce` no lo sustituía y podía guardarse en `notes`/`images`. | `jsonb_typeof` explícito en alta y edición. |
| 6 | Medio | El histórico dependía de `pg_trigger_depth() = 0` (frágil). | Bloqueo incondicional de `UPDATE`/`DELETE` en `order_items` y `order_events`. |
| 7 | Medio | Errores técnicos poco claros (slug, categoría, precio, tamaño, fotos y líneas de pedido no numéricas). | Validaciones previas con mensajes en español; precios: entero > 0 o `null`. |
| 8 | Bajo | Tabla temporal innecesaria dentro de `create_order`. | Eliminada (acumulación en memoria con `jsonb`). |
| 9 | Bajo | Slug repetido llegaba como error técnico. | Comprobación previa contra `products` y `product_slugs`. |

## Errores míos en las pruebas (corregidos antes de entregar)
El primer borrador de `selftest.sql` tenía: `RAISE` fuera de un bloque `DO` (error de sintaxis), una limpieza que borraba histórico bloqueado por los propios triggers, una prueba que esperaba «0 filas» donde `anon` recibe «permission denied», `EXECUTE` con varias sentencias, dependencia de `NOTICE` (el SQL Editor no los muestra) y UUID de usuarios reales. Se reescribió como un único bloque `DO` que **revierte todo** al terminar y crea usuarios temporales. El validador estático ahora detecta esos errores.

## Modelo de permisos (verificado estáticamente)
| Rol | Lee | Escribe |
|---|---|---|
| `anon` | Catálogo publicado (productos, presentaciones habilitadas, slugs) | Nada. `create_order()` es la única vía |
| `authenticated` no admin | Igual que `anon`; ni pedidos ni inventario | Nada (`is_admin()` = false en toda función admin) |
| `authenticated` admin | Catálogo, inventario, pedidos, historial | Catálogo vía `admin_save_product` (+ `INSERT/UPDATE` con RLS); estados y notas vía `admin_set_order_*`; inventario vía `admin_set_inventory` |
| `service_role` | Omite RLS | **Nunca en el navegador**; el cliente la rechaza |

Todas las funciones `SECURITY DEFINER` fijan `search_path = public`; las de administración comprueban `is_admin()` y solo se conceden a `authenticated`; las de trigger y `order_to_json` no tienen `EXECUTE` para roles de API. `is_admin()` es ejecutable por `anon` (devuelve `false`): es inocuo.

## Riesgos abiertos (no verificados en ejecución)
- Comportamiento real de RLS, `auth.uid()` y `GRANT` según la versión de Supabase; la inserción de usuarios temporales en `auth.users` del autotest puede requerir ajustes.
- Idempotencia bajo concurrencia real y rendimiento con RLS.
- `create_order` agrupa líneas repetidas y, ante un `client_request_id` ya usado, **devuelve el pedido original aunque el contenido enviado sea distinto** (diseño deliberado; probado en el autotest).
- Spam de solicitudes `iniciado` con la clave pública: inocuo para los datos pero consume espacio (mitigación futura: CAPTCHA/limitación).
- Los slugs aceptan cualquier longitud (sin límite).
