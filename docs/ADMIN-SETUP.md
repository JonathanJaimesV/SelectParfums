# Fase 2 — Backend (Supabase), pedidos y base del panel: guía de configuración

> **Lee primero la sección 1.** Esta guía distingue lo *implementado*, lo *comprobado estáticamente* y lo *ejecutado realmente*.
> Nada de esto se ha conectado ni probado contra un proyecto real de Supabase: el entorno de desarrollo no tenía
> PostgreSQL ni acceso a internet. **El proyecto, las claves y las cuentas son tuyos.**

## 1. Estado real

| Pieza | Implementado | Comprobado estáticamente | Ejecutado realmente |
|---|---|---|---|
| Migración SQL (`supabase/migrations/0001_init.sql`): tablas, RLS, funciones, permisos | ✅ | ✅ `npm run db:check` | 🟡 **Aplicada sin errores en un proyecto de pruebas; el autotest encontró un fallo de permisos de funciones (corregido en el parche `supabase/patches/2026-fix-function-privileges.sql`). Falta repetir el autotest.** |
| Autoverificación SQL (`supabase/tests/selftest.sql`, 92 comprobaciones) | ✅ | ✅ (sintaxis de bloques y reglas) | ❌ **Pendiente** (`npm run test:sql`) |
| Prueba de concurrencia (`supabase/tests/concurrency.sh`) | ✅ | ✅ `bash -n` | ❌ **Pendiente** |
| Semilla del catálogo real (`supabase/seed/0002_catalog_seed.sql`, 19 perfumes) | ✅ generada de `products.js` | ✅ coincide con el catálogo, idempotente | ❌ **Pendiente** |
| Cliente de pedidos (`src/backend/*`, `useOrderCheckout`) | ✅ | ✅ | ✅ probado contra un **servidor de referencia** (réplica en memoria de las reglas), no contra Supabase |
| Checkout: registrar pedido → abrir WhatsApp con código | ✅ | ✅ | ✅ en Chromium contra el servidor de referencia (66 comprobaciones) |
| Panel `/admin` (login, dashboard, productos, pedidos, inventario) | ❌ **No implementado todavía** (siguiente etapa) | — | — |
| Catálogo vivo (precios/disponibilidad desde la base en la web pública) | ❌ **No implementado todavía** | — | — |
| Panel local antiguo (`src/admin`, PIN + localStorage) | existe, solo desarrollo | — | — |

**Mientras no actives Supabase en producción, la tienda funciona exactamente como antes** (checkout directo por WhatsApp, precios de `products.js`).

## 2. Arquitectura

- **Netlify** sigue alojando React/Vite. **Supabase** aporta Postgres + Auth + RLS (+ Storage para fotos).
- **Sin dependencias nuevas**: el cliente habla con Supabase por `fetch` (`src/backend/http.js`).
- **Seguridad en el servidor, no en el navegador:** permisos por RLS y funciones SQL (`create_order`, `admin_*`). El navegador solo conoce la clave **pública** (anon/publishable).
- **Pedidos:** `create_order` revalida precios y disponibilidad contra la base, es **idempotente** (`client_request_id`), guarda una **copia inmutable** y devuelve un código `SP-AAMMDD-XXXX`. Estado inicial: `iniciado`. **Nunca** `confirmado` ni `pagado` automáticamente.
- **Administración:** lista `admins` (solo se llena con SQL). Todas las funciones `admin_*` comprueban `is_admin()`; los pedidos y el histórico no se pueden editar con `UPDATE` directo.

## 3. Variables de entorno (todas PÚBLICAS salvo que se indique)

| Variable | Dónde | Valor |
|---|---|---|
| `VITE_SUPABASE_URL` | Netlify (build) | `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Netlify (build) | clave **anon** (JWT) o **publishable** (`sb_publishable_…`) |
| `VITE_WHATSAPP_NUMBER` | Netlify (opcional) | `57` + 10 dígitos, sin signos (si falta, se usa `src/config.js`) |
| `PRERENDER_META` | Netlify (opcional) | `1` para páginas con metadatos por perfume (ver README) |

⛔ **NUNCA** copies al navegador ni a Netlify (`VITE_*`) la clave **`service_role`** ni la **secret**. El cliente la rechaza si se pone por error y `npm test` falla si aparece en el código. Las variables `VITE_*` se incrustan en el JavaScript que descarga cualquier visitante. Copia `.env.example` a `.env.local` solo para pruebas locales (está en `.gitignore`).

## 4. Configurar un proyecto Supabase de PRUEBAS (primero esto; producción después)

1. Crea una cuenta en supabase.com y un proyecto **nuevo y desechable** (nombre sugerido: `selectparfums-test`). Región cercana (p. ej. São Paulo).
2. **Authentication → Providers → Email:** desactiva **«Allow new users to sign up»** (solo tú crearás cuentas). Activa la confirmación de correo. En **Authentication → URL Configuration** pon como *Site URL* tu dominio y añade a *Redirect URLs* el dominio de las vistas previas de Netlify (`https://deploy-preview-*--<tu-sitio>.netlify.app`).
3. **SQL Editor → New query →** pega **todo** `supabase/migrations/0001_init.sql` → Run. Debe terminar sin errores.
   *Si da error, no sigas: copia el mensaje exacto; es justo lo que esta validación debía descubrir.*
4. **Autoverificación:** pega `supabase/tests/selftest.sql` → Run. Termina **a propósito** con un mensaje de error que dice `SELFTEST OK — N pruebas pasaron` (así revierte todos sus datos). Si dice `SELFTEST FALLO: …`, la migración tiene un problema: no la uses.
   - Alternativa por consola: `DATABASE_URL="postgresql://postgres:<clave>@db.<ref>.supabase.co:5432/postgres" npm run test:sql`
   - Si dice «no se pudieron crear usuarios temporales en auth.users»: crea dos usuarios de prueba en Authentication y avísame para adaptar la prueba (no uses tu cuenta real).
5. **Concurrencia (opcional pero recomendada):** `DATABASE_URL=… npm run test:sql:concurrency`. Deja un pedido de prueba que **no se puede borrar** (el histórico es inmutable): úsala solo en el proyecto desechable.
6. **Catálogo:** en la web actual `npm run db:seed` regenera la semilla; pega `supabase/seed/0002_catalog_seed.sql` en el SQL Editor → Run. Es idempotente y no pisa cambios hechos después.
7. **Claves:** *Project Settings → API Keys.* Copia **solo** la URL y la clave **anon/publishable**. No copies la `service_role`.

## 5. Designar al primer administrador (tu cuenta, y solo la tuya)

No hay contraseña ni correo predeterminados. El procedimiento:

1. **Crea tu usuario** (en *Authentication → Users → Add user*): usa **tu correo real**, una contraseña larga y única (gestor de contraseñas) y deja confirmado el correo. *(Tú eliges ambos; yo no conozco ni guardo ninguno.)*
2. **Autorízalo con SQL** (SQL Editor; reemplaza el texto entre `<>` por TU correo exacto):
   ```sql
   insert into public.admins (user_id)
   select id from auth.users
   where email = lower('<TU_CORREO>') and email_confirmed_at is not null
   returning user_id;
   ```
   Debe devolver **exactamente 1 fila**. Si devuelve 0, el correo no coincide o no está confirmado.
3. **Verifica quién es administrador** (debe aparecer solo tu correo):
   ```sql
   select u.email, a.created_at from public.admins a join auth.users u on u.id = a.user_id;
   ```
4. Activa **verificación en dos pasos (MFA)** en tu cuenta cuando el panel esté disponible (recomendado).
5. **Revocar un acceso:** `delete from public.admins where user_id = (select id from auth.users where email = lower('<correo>'));`

**Recuperar el acceso:** (a) *Authentication → Users → ⋯ → Send password recovery*; (b) si perdiste el correo, como propietaria del proyecto puedes cambiar el correo/contraseña del usuario desde el mismo panel; (c) si perdieras tu cuenta de Supabase, solo su soporte puede ayudarte: mantén activo un segundo método de acceso a esa cuenta. Cualquier otra persona que consiga crear un usuario **no tendrá permisos**: sin fila en `admins`, todas las funciones administrativas devuelven `FORBIDDEN`.

## 6. Vista previa en Netlify (sin tocar producción)

1. Crea una rama (`git checkout -b fase2-backend`), sube los cambios y abre un *Pull Request*: Netlify generará una **Deploy Preview**.
2. En Netlify → *Site configuration → Environment variables → Add a variable*, crea `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores del **proyecto de pruebas** y límalas al contexto **Deploy Previews** (no a *Production*). Vuelve a desplegar la vista previa (las variables `VITE_*` se leen al compilar).
3. En el log del build debe verse `[manifest] …` y `[postbuild] OK`.
4. **Comprueba en la vista previa:** agrega un perfume → *Finalizar pedido por WhatsApp* → debe abrirse WhatsApp con *Código del pedido: SP-…*; en Supabase → *Table Editor → orders* aparece 1 fila con estado `iniciado`. Pulsa dos veces seguidas: sigue habiendo 1 fila. Apaga el proyecto (o pon una URL incorrecta) y comprueba que sale el aviso y la opción «Continuar sin código».
5. **Producción no cambia** hasta que (a) fusiones el PR y (b) añadas las variables al contexto *Production*. Para volver atrás, borra las variables: la tienda vuelve al modo sin registro.

## 7. Estados del pedido (propuesta; ajústala a tu operación)

`iniciado` → `pendiente_confirmacion` → `confirmado` → `pendiente_pago` → `pagado` → `en_preparacion` → `enviado` → `entregado`; `cancelado` desde casi cualquier punto.
Las transiciones permitidas están en el SQL (`order_transition_allowed`) y en `src/backend/orderStatus.js`; un test comprueba que coinciden. **«Pagado» solo lo marca el vendedor, manualmente.** Abrir WhatsApp ≠ venta.

## 8. Inventario

**v1 (preparado en el esquema, sin interfaz todavía):** por cada perfume y presentación se guarda un estado (`sin_configurar` por defecto, `disponible`, `agotado`, `preventa`), una cantidad **solo si el vendedor declara haberla verificado** (se guarda la fecha) y notas. **No bloquea ventas**: la disponibilidad que ve el cliente la decide el vendedor (`Disponible`/`Preventa`/`Agotado` del perfume). No se inventan existencias.

| | **Modelo A — existencias por presentación** | **Modelo B — decants descontados del frasco** |
|---|---|---|
| Qué guarda | Un conteo por presentación (5 ml, 10 ml, frasco) | Volumen disponible (ml) por perfume; los decants se *preparan* y descuentan ml |
| Ventaja | Simple; coincide con lo que se vende | Refleja la realidad si los decants salen de frascos abiertos |
| Exige definir | Quién cuenta y cuándo | Merma por decant, ml por frasco, regla de redondeo |
| Riesgo | Contar dos veces el mismo perfume (frasco vs decants) | Más complejo; requiere disciplina operativa |

**Recomendación:** empieza con **estados sin cantidades** (ya soportado) y, cuando tengas conteos reales, adopta **Modelo A para los frascos completos** y decide **B para los decants** solo si de verdad los preparas a demanda desde frascos. No hay datos suficientes en el proyecto para fijar reglas de merma: es decisión tuya.
**Política propuesta de reserva/descuento (no implementada):** abrir WhatsApp o registrar `iniciado` **no descuenta ni reserva** nada; descontar al pasar a `confirmado` o a `pagado` (tú eliges), dentro de una función SQL transaccional con bloqueo de fila (`for update`) para que dos pedidos simultáneos no consuman el mismo stock; y devolver el stock si se cancela.

## 9. Costes (referencia; verifica en supabase.com/pricing y netlify.com/pricing)

Según fuentes de terceros consultadas entre mayo y septiembre de 2026 (no es la página oficial): **Supabase Free** = 0 USD, ~500 MB de base de datos, 50.000 usuarios activos/mes, 5 GB de salida, 500 MB de archivos, **proyectos pausados tras ~7 días sin actividad** y sin copias diarias; **Pro** ≈ 25 USD/mes por organización (8 GB de base, sin pausa). Para una tienda que recibe pedidos, el plan gratuito es válido para **pruebas y vista previa**; para producción se recomienda Pro por la pausa por inactividad y las copias de seguridad. Si el proyecto estuviera pausado, el checkout **no se rompe**: muestra el aviso y deja continuar por WhatsApp sin código.

## 10. Pendiente y decisiones tuyas

**Pendiente de implementar:** panel `/admin` (login, dashboard, productos, pedidos, inventario), catálogo vivo en la web pública, subida de fotografías, y la política real de stock.
**Decisiones comerciales:** (1) ¿mantienes los estados propuestos o quieres otros? (2) ¿Quién y cuándo marca «pagado»? (3) Política de stock: Modelo A/B y cuándo descontar. (4) ¿Plan Pro en producción? (5) Retención de pedidos «iniciados» abandonados (limpieza periódica). (6) Textos legales y datos del vendedor que el sitio aún no publica.
**Riesgos conocidos:** cualquiera puede crear solicitudes `iniciado` con la API pública (spam): son inocuas pero ocupan espacio; se mitiga después con un CAPTCHA o limitación por IP. Los totales mostrados en el navegador no son una validación comercial: el servidor recalcula, y el vendedor siempre confirma.

## 11. Reproducir las verificaciones

```bash
npm test                 # 78+ pruebas (precios, carrito, pedidos, seguridad, semilla, SQL estático)
npm run db:check         # validación estática de migraciones, pruebas y semillas SQL
npm run db:seed:check    # la semilla coincide con src/data/products.js
DATABASE_URL=… npm run test:sql              # autoverificación en PostgreSQL (proyecto de PRUEBAS)
DATABASE_URL=… npm run test:sql:concurrency  # idempotencia con peticiones simultáneas
```
