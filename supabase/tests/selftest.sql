-- ════════════════════════════════════════════════════════════════════════════════
-- AUTOVERIFICACIÓN de la migración 0001 (PostgreSQL / Supabase).
-- ► USAR SOLO EN UN PROYECTO DE PRUEBAS (o `supabase start` local). NO lo ejecutes en producción.
--
-- Qué hace: corre todas las pruebas dentro de UN bloque DO y, al final, lanza una excepción a propósito
-- para REVERTIR todos los datos de prueba (productos, pedidos y usuarios temporales). Si todo va bien,
-- el «error» final dice:  SELFTEST OK — N pruebas pasaron …   Si algo falla, dice:  SELFTEST FALLO: <prueba>.
-- Nada de lo que crea queda guardado. No usa tu cuenta real ni necesita UUIDs: crea usuarios temporales.
--
-- Cómo ejecutarlo: SQL Editor → pegar todo → Run   (o:  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f selftest.sql)
-- ════════════════════════════════════════════════════════════════════════════════

create temp table if not exists selftest_log (seq serial primary key, label text not null);  -- nombres distintos de cualquier variable del bloque DO
truncate selftest_log;

create or replace function pg_temp.pass(p_name text) returns void language plpgsql as $$
begin insert into selftest_log(label) values (p_name); raise notice 'OK  %', p_name; end $$;

-- Cambia el rol de la sesión como lo haría la API de Supabase (rol de base de datos + claims del JWT).
create or replace function pg_temp.set_user(p_role text, p_uid uuid) returns void language plpgsql as $$
begin
  if p_role <> 'postgres' then execute format('set local role %I', p_role); end if;
  perform set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', p_role)::text, true);
  perform set_config('request.jwt.claim.sub', coalesce(p_uid::text, ''), true);
  perform set_config('request.jwt.claim.role', p_role, true);
end $$;

-- Ejecuta UNA sentencia que devuelve un valor (jsonb) con el rol indicado; vuelve al rol original.
create or replace function pg_temp.call_as(p_role text, p_uid uuid, p_sql text) returns jsonb language plpgsql as $$
declare v jsonb;
begin
  perform pg_temp.set_user(p_role, p_uid);
  execute p_sql into v;
  execute 'reset role';
  return v;
end $$;

-- Ejecuta UNA sentencia con el rol indicado y exige que FALLE con un mensaje que contenga p_expected.
create or replace function pg_temp.expect_fail(p_name text, p_role text, p_uid uuid, p_sql text, p_expected text) returns void language plpgsql as $$
declare v_msg text;
begin
  perform pg_temp.set_user(p_role, p_uid);
  begin
    execute p_sql;
    v_msg := null;
  exception when others then
    v_msg := sqlerrm;
  end;
  execute 'reset role';
  if v_msg is null then raise exception 'SELFTEST FALLO: % — debía fallar y no falló', p_name; end if;
  if position(p_expected in v_msg) = 0 then raise exception 'SELFTEST FALLO: % — error inesperado: %', p_name, v_msg; end if;
  insert into selftest_log(label) values (p_name || ' (rechazado: ' || left(v_msg, 70) || ')');
  raise notice 'OK  % (rechazado: %)', p_name, v_msg;
end $$;

do $st$
declare
  v_admin uuid := gen_random_uuid();
  v_visitor uuid := gen_random_uuid();
  v_pid int; v_hidden int; v_arch int; v_new int;
  v_req uuid; v_items text;
  r jsonb; r2 jsonb;
  n bigint; n2 bigint;
  v_oid uuid; v_oid2 uuid;
  t text; v_bad text; v_log text; v_total int;
  tables constant text[] := array['admins','products','product_presentations','product_slugs','inventory','orders','order_items','order_events'];
begin
  -- ═════ A. ESTRUCTURA Y PERMISOS (catálogo del sistema) ═════
  foreach t in array tables loop
    if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = t and rowsecurity) then
      raise exception 'SELFTEST FALLO: RLS desactivado en %', t; end if;
  end loop;
  perform pg_temp.pass('A1 RLS activo en las 8 tablas');

  foreach t in array tables loop
    if has_table_privilege('anon', 'public.' || t, 'INSERT') or has_table_privilege('anon', 'public.' || t, 'UPDATE')
       or has_table_privilege('anon', 'public.' || t, 'DELETE') then
      raise exception 'SELFTEST FALLO: anon tiene permisos de escritura sobre %', t; end if;
    if has_table_privilege('authenticated', 'public.' || t, 'DELETE') then
      raise exception 'SELFTEST FALLO: authenticated puede DELETE en %', t; end if;
  end loop;
  perform pg_temp.pass('A2 anon sin escritura y nadie con DELETE en ninguna tabla');

  foreach t in array array['orders','order_items','order_events','inventory','admins'] loop
    if has_table_privilege('anon', 'public.' || t, 'SELECT') then raise exception 'SELFTEST FALLO: anon puede leer %', t; end if;
  end loop;
  foreach t in array array['orders','order_items','order_events','inventory','admins','product_slugs'] loop
    if has_table_privilege('authenticated', 'public.' || t, 'INSERT') or has_table_privilege('authenticated', 'public.' || t, 'UPDATE') then
      raise exception 'SELFTEST FALLO: authenticated escribe directamente en % (debe usar funciones)', t; end if;
  end loop;
  perform pg_temp.pass('A3 anon no lee pedidos/inventario/admins; authenticated no escribe pedidos ni inventario directamente');

  -- Permisos de ejecución de TODAS las funciones del esquema: se reúnen todos los problemas antes de fallar.
  v_bad := '';
  for t in select p.oid::regprocedure::text from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace where ns.nspname = 'public' loop
    if t in ('is_admin()', 'create_order(uuid,jsonb)') then
      if not has_function_privilege('anon', t, 'EXECUTE') then v_bad := v_bad || E'\n  · anon NO puede ejecutar ' || t || ' (debería)'; end if;
    elsif has_function_privilege('anon', t, 'EXECUTE') then
      v_bad := v_bad || E'\n  · anon PUEDE ejecutar ' || t;
    end if;
    if t in ('admin_save_product(jsonb)', 'admin_set_order_status(uuid,text,text)', 'admin_set_order_notes(uuid,text)', 'admin_set_inventory(integer,text,text,integer,boolean,text)') then
      if not has_function_privilege('authenticated', t, 'EXECUTE') then v_bad := v_bad || E'\n  · authenticated NO puede ejecutar ' || t || ' (debería)'; end if;
    elsif t not in ('is_admin()', 'create_order(uuid,jsonb)') and has_function_privilege('authenticated', t, 'EXECUTE') then
      v_bad := v_bad || E'\n  · authenticated PUEDE ejecutar ' || t || ' (función interna)';
    end if;
  end loop;
  if v_bad <> '' then raise exception E'SELFTEST FALLO: permisos de funciones incorrectos:%\nSolución: ejecuta supabase/patches/2026-fix-function-privileges.sql y repite esta prueba.', v_bad; end if;
  perform pg_temp.pass('A4 anon solo ejecuta is_admin y create_order; authenticated solo esas y las admin_*; funciones internas ocultas');

  select string_agg(p.proname, ', ') into v_bad
  from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public' and p.prosecdef and coalesce(p.proconfig::text, '') not like '%search_path=%';
  if v_bad is not null then raise exception 'SELFTEST FALLO: SECURITY DEFINER sin search_path: %', v_bad; end if;
  perform pg_temp.pass('A5 todas las funciones SECURITY DEFINER fijan search_path');

  if (select count(*) from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname like 'product_images_admin_%') <> 3 then
    raise exception 'SELFTEST FALLO: faltan las 3 políticas de escritura del bucket product-images'; end if;
  if not exists (select 1 from storage.buckets where id = 'product-images' and public and file_size_limit = 5242880) then
    raise exception 'SELFTEST FALLO: bucket product-images ausente o mal configurado'; end if;
  perform pg_temp.pass('A6 bucket product-images (público, 5 MB) y políticas de escritura solo-admin');

  -- ═════ B. DATOS DE PRUEBA (se revierten al final) ═════
  begin
    insert into auth.users(id, aud, role, email) values
      (v_admin,   'authenticated', 'authenticated', 'selftest-admin@example.invalid'),
      (v_visitor, 'authenticated', 'authenticated', 'selftest-visitor@example.invalid');
  exception when others then
    raise exception 'SELFTEST FALLO: no se pudieron crear usuarios temporales en auth.users (%). Ver docs/ADMIN-SETUP.md → «Si el autotest no puede crear usuarios».', sqlerrm;
  end;
  insert into public.admins(user_id) values (v_admin);

  insert into public.products(slug, brand, name, category, bottle_size, availability, status)
    values ('zz-test-producto', 'TestMarca', 'Producto Prueba', 'Unisex', '100 ml', 'Disponible', 'published') returning id into v_pid;
  insert into public.products(slug, brand, name, category, status) values ('zz-oculto', 'TestMarca', 'Oculto', 'Unisex', 'hidden') returning id into v_hidden;
  insert into public.products(slug, brand, name, category, status) values ('zz-archivado', 'TestMarca', 'Archivado', 'Unisex', 'archived') returning id into v_arch;
  insert into public.product_presentations(product_id, kind, enabled, price_cop)
    select p, k, true, pr from (values (v_pid,'5',23000),(v_pid,'10',33000),(v_pid,'full',185000),
                                       (v_hidden,'5',10000),(v_arch,'5',10000)) as x(p, k, pr);

  -- ═════ C. VISITANTE ANÓNIMO ═════
  r := pg_temp.call_as('anon', null, $q$ select jsonb_build_object(
         'visible', (select count(*) from public.products where slug = 'zz-test-producto'),
         'ocultos', (select count(*) from public.products where slug in ('zz-oculto','zz-archivado')),
         'pres_ocultas', (select count(*) from public.product_presentations where product_id in (select id from public.products where slug in ('zz-oculto','zz-archivado'))),
         'alias_ocultos', (select count(*) from public.product_slugs where slug in ('zz-oculto','zz-archivado'))) $q$);
  if (r->>'visible')::int <> 1 or (r->>'ocultos')::int <> 0 or (r->>'pres_ocultas')::int <> 0 or (r->>'alias_ocultos')::int <> 0 then
    raise exception 'SELFTEST FALLO: anon ve datos no publicados: %', r; end if;
  perform pg_temp.pass('C1 anon ve solo el catálogo publicado (no ocultos ni archivados ni sus presentaciones)');

  perform pg_temp.expect_fail('C2 anon no puede insertar productos', 'anon', null,
    $q$ insert into public.products(slug, brand, name, category) values ('zz-hack', 'x', 'x', 'Unisex') $q$, 'permission denied');
  perform pg_temp.expect_fail('C3 anon no puede modificar precios', 'anon', null,
    $q$ update public.product_presentations set price_cop = 1 $q$, 'permission denied');
  perform pg_temp.expect_fail('C4 anon no puede borrar productos', 'anon', null, $q$ delete from public.products $q$, 'permission denied');
  perform pg_temp.expect_fail('C5 anon no puede leer pedidos', 'anon', null, $q$ select count(*) from public.orders $q$, 'permission denied');
  perform pg_temp.expect_fail('C6 anon no puede leer líneas de pedido', 'anon', null, $q$ select count(*) from public.order_items $q$, 'permission denied');
  perform pg_temp.expect_fail('C7 anon no puede leer inventario', 'anon', null, $q$ select count(*) from public.inventory $q$, 'permission denied');
  perform pg_temp.expect_fail('C8 anon no puede leer la lista de administradores', 'anon', null, $q$ select count(*) from public.admins $q$, 'permission denied');
  perform pg_temp.expect_fail('C9 anon no puede insertar administradores', 'anon', null,
    format($q$ insert into public.admins(user_id) values (%L) $q$, v_visitor), 'permission denied');
  perform pg_temp.expect_fail('C10 anon no puede guardar productos (función admin)', 'anon', null,
    $q$ select public.admin_save_product('{"slug":"zz-x","brand":"a","name":"a","category":"Unisex"}'::jsonb) $q$, 'permission denied');
  perform pg_temp.expect_fail('C11 anon no puede cambiar estados de pedidos', 'anon', null,
    $q$ select public.admin_set_order_status(gen_random_uuid(), 'confirmado', '') $q$, 'permission denied');
  perform pg_temp.expect_fail('C12 anon no puede registrar inventario', 'anon', null,
    format($q$ select public.admin_set_inventory(%s, '5', 'disponible', null, false, '') $q$, v_pid), 'permission denied');
  if pg_temp.call_as('anon', null, 'select to_jsonb(public.is_admin())') <> 'false'::jsonb then raise exception 'SELFTEST FALLO: is_admin() true para anon'; end if;
  perform pg_temp.pass('C13 is_admin() es false para anon');

  -- ═════ D. CREACIÓN DE PEDIDOS (función pública) ═════
  select count(*) into n from public.orders;
  v_req := gen_random_uuid();
  v_items := format('[{"product_id":%s,"kind":"5","quantity":2},{"product_id":%s,"kind":"full","quantity":1}]', v_pid, v_pid);
  r := pg_temp.call_as('anon', null, format('select public.create_order(%L::uuid, %L::jsonb)', v_req, v_items));
  v_oid := (r->>'order_id')::uuid;
  if (r->>'total_cop')::bigint <> 231000 then raise exception 'SELFTEST FALLO: total esperado 231000, obtuvo %', r->>'total_cop'; end if;
  perform pg_temp.pass('D1 total calculado en el servidor: 2×23.000 + 1×185.000 = 231.000');
  if r->>'status' <> 'iniciado' then raise exception 'SELFTEST FALLO: estado inicial %', r->>'status'; end if;
  perform pg_temp.pass('D2 estado inicial = iniciado (nunca confirmado ni pagado)');
  if r->>'code' !~ '^SP-[0-9]{6}-[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$' then raise exception 'SELFTEST FALLO: formato de código %', r->>'code'; end if;
  perform pg_temp.pass('D3 código legible SP-AAMMDD-XXXX: ' || (r->>'code'));
  select (e->>'subtotal_cop')::bigint into n2 from jsonb_array_elements(r->'items') e where e->>'presentation_kind' = '5';
  if n2 <> 46000 or jsonb_array_length(r->'items') <> 2 then raise exception 'SELFTEST FALLO: líneas/subtotales incorrectos %', r->'items'; end if;
  if (select count(*) from public.order_events where order_id = v_oid and to_status = 'iniciado') <> 1 then raise exception 'SELFTEST FALLO: falta el evento inicial'; end if;
  perform pg_temp.pass('D4 líneas con subtotales correctos y evento inicial registrado');

  r2 := pg_temp.call_as('anon', null, format('select public.create_order(%L::uuid, %L::jsonb)', v_req, v_items));
  if r2->>'code' <> r->>'code' or (select count(*) from public.orders where client_request_id = v_req) <> 1 then
    raise exception 'SELFTEST FALLO: idempotencia (reintento creó otro pedido o cambió el código)'; end if;
  r2 := pg_temp.call_as('anon', null, format('select public.create_order(%L::uuid, %L::jsonb)', v_req,
          format('[{"product_id":%s,"kind":"10","quantity":9}]', v_pid)));
  if r2->>'code' <> r->>'code' or (r2->>'total_cop')::bigint <> 231000 then raise exception 'SELFTEST FALLO: idempotencia con otro contenido'; end if;
  perform pg_temp.pass('D5 idempotencia: mismo client_request_id → mismo pedido (sin duplicar, aunque cambie el contenido)');

  update public.products set name = 'NOMBRE CAMBIADO', brand = 'OtraMarca' where id = v_pid;
  update public.product_presentations set price_cop = 99999 where product_id = v_pid and kind = '5';
  if exists (select 1 from public.order_items where order_id = v_oid and (product_name <> 'Producto Prueba' or product_brand <> 'TestMarca'))
     or exists (select 1 from public.order_items where order_id = v_oid and presentation_kind = '5' and unit_price_cop <> 23000) then
    raise exception 'SELFTEST FALLO: el pedido histórico cambió al editar el catálogo'; end if;
  perform pg_temp.pass('D6 el pedido conserva nombre, marca y precio originales tras editar el catálogo');
  update public.products set name = 'Producto Prueba', brand = 'TestMarca' where id = v_pid;
  update public.product_presentations set price_cop = 23000 where product_id = v_pid and kind = '5';

  r := pg_temp.call_as('anon', null, format('select public.create_order(gen_random_uuid(), %L::jsonb)',
         format('[{"product_id":%s,"kind":"5","quantity":1},{"product_id":%s,"kind":"5","quantity":2}]', v_pid, v_pid)));
  if jsonb_array_length(r->'items') <> 1 or (r->'items'->0->>'quantity')::int <> 3 or (r->>'total_cop')::bigint <> 69000 then
    raise exception 'SELFTEST FALLO: líneas repetidas no se agruparon: %', r; end if;
  perform pg_temp.pass('D7 líneas repetidas se agrupan (1 + 2 = 3 unidades, 69.000)');

  select count(*) into n from public.orders;  -- referencia para comprobar atomicidad
  perform pg_temp.expect_fail('D8 producto oculto no se puede pedir', 'anon', null,
    format($q$ select public.create_order(gen_random_uuid(), '[{"product_id":%s,"kind":"5","quantity":1}]'::jsonb) $q$, v_hidden), 'no_existe');
  perform pg_temp.expect_fail('D9 producto archivado no se puede pedir', 'anon', null,
    format($q$ select public.create_order(gen_random_uuid(), '[{"product_id":%s,"kind":"5","quantity":1}]'::jsonb) $q$, v_arch), 'no_existe');
  perform pg_temp.expect_fail('D10 producto inexistente', 'anon', null,
    $q$ select public.create_order(gen_random_uuid(), '[{"product_id":99999999,"kind":"5","quantity":1}]'::jsonb) $q$, 'no_existe');

  update public.product_presentations set enabled = false where product_id = v_pid and kind = '10';
  perform pg_temp.expect_fail('D11 presentación desactivada no se puede pedir', 'anon', null,
    format($q$ select public.create_order(gen_random_uuid(), '[{"product_id":%s,"kind":"10","quantity":1}]'::jsonb) $q$, v_pid), 'presentacion_inactiva');
  update public.product_presentations set enabled = true where product_id = v_pid and kind = '10';

  update public.products set availability = 'Agotado' where id = v_pid;
  perform pg_temp.expect_fail('D12 producto agotado no se puede pedir', 'anon', null,
    format($q$ select public.create_order(gen_random_uuid(), '[{"product_id":%s,"kind":"5","quantity":1}]'::jsonb) $q$, v_pid), 'agotado');
  update public.products set availability = 'Disponible' where id = v_pid;

  update public.product_presentations set price_cop = null where product_id = v_pid and kind = '10';
  perform pg_temp.expect_fail('D13 presentación sin precio ("Consultar") no se puede pedir', 'anon', null,
    format($q$ select public.create_order(gen_random_uuid(), '[{"product_id":%s,"kind":"10","quantity":1}]'::jsonb) $q$, v_pid), 'sin_precio');
  update public.product_presentations set price_cop = 33000 where product_id = v_pid and kind = '10';

  foreach t in array array['21', '0', '-3'] loop
    perform pg_temp.expect_fail('D14 cantidad ' || t || ' rechazada', 'anon', null,
      format($q$ select public.create_order(gen_random_uuid(), '[{"product_id":%s,"kind":"5","quantity":%s}]'::jsonb) $q$, v_pid, t), 'línea inválida');
  end loop;
  foreach t in array array['"abc"', '1.5', 'null'] loop
    perform pg_temp.expect_fail('D14b cantidad no entera (' || t || ') rechazada con mensaje claro', 'anon', null,
      format($q$ select public.create_order(gen_random_uuid(), '[{"product_id":%s,"kind":"5","quantity":%s}]'::jsonb) $q$, v_pid, t), 'línea inválida');
  end loop;
  perform pg_temp.expect_fail('D14c product_id no numérico rechazado', 'anon', null,
    $q$ select public.create_order(gen_random_uuid(), '[{"product_id":"x","kind":"5","quantity":1}]'::jsonb) $q$, 'línea inválida');
  perform pg_temp.expect_fail('D14d elemento que no es objeto rechazado', 'anon', null,
    $q$ select public.create_order(gen_random_uuid(), '[1, "a"]'::jsonb) $q$, 'línea inválida');
  perform pg_temp.expect_fail('D15 presentación inválida rechazada', 'anon', null,
    format($q$ select public.create_order(gen_random_uuid(), '[{"product_id":%s,"kind":"x","quantity":1}]'::jsonb) $q$, v_pid), 'línea inválida');
  perform pg_temp.expect_fail('D16 lista vacía rechazada', 'anon', null, $q$ select public.create_order(gen_random_uuid(), '[]'::jsonb) $q$, 'items inválidos');
  perform pg_temp.expect_fail('D17 items que no es lista rechazado', 'anon', null, $q$ select public.create_order(gen_random_uuid(), '{}'::jsonb) $q$, 'items inválidos');
  perform pg_temp.expect_fail('D18 sin client_request_id rechazado', 'anon', null,
    format($q$ select public.create_order(null, '[{"product_id":%s,"kind":"5","quantity":1}]'::jsonb) $q$, v_pid), 'client_request_id');
  select count(*) into n2 from public.orders;
  if n2 <> n then raise exception 'SELFTEST FALLO: un pedido rechazado dejó datos a medias (% → %)', n, n2; end if;
  perform pg_temp.pass('D19 ningún pedido rechazado dejó filas a medias (atomicidad)');

  -- ═════ E. USUARIO AUTENTICADO SIN PERMISOS DE ADMINISTRADOR ═════
  perform pg_temp.expect_fail('E1 no-admin no puede guardar productos', 'authenticated', v_visitor,
    $q$ select public.admin_save_product('{"slug":"zz-x","brand":"a","name":"a","category":"Unisex"}'::jsonb) $q$, 'FORBIDDEN');
  perform pg_temp.expect_fail('E2 no-admin no puede cambiar estados', 'authenticated', v_visitor,
    format($q$ select public.admin_set_order_status(%L, 'cancelado', '') $q$, v_oid), 'FORBIDDEN');
  perform pg_temp.expect_fail('E3 no-admin no puede escribir notas', 'authenticated', v_visitor,
    format($q$ select public.admin_set_order_notes(%L, 'hack') $q$, v_oid), 'FORBIDDEN');
  perform pg_temp.expect_fail('E4 no-admin no puede registrar inventario', 'authenticated', v_visitor,
    format($q$ select public.admin_set_inventory(%s, '5', 'disponible', null, false, '') $q$, v_pid), 'FORBIDDEN');
  perform pg_temp.expect_fail('E5 no-admin no puede insertarse como administrador', 'authenticated', v_visitor,
    format($q$ insert into public.admins(user_id) values (%L) $q$, v_visitor), 'permission denied');
  perform pg_temp.expect_fail('E6 no-admin no puede insertar productos (RLS)', 'authenticated', v_visitor,
    $q$ insert into public.products(slug, brand, name, category) values ('zz-hack2', 'x', 'x', 'Unisex') $q$, 'row-level security');
  r := pg_temp.call_as('authenticated', v_visitor, $q$ with u as (update public.products set name = 'HACK' where slug = 'zz-test-producto' returning 1)
                                                      select to_jsonb((select count(*) from u)) $q$);
  if r <> '0'::jsonb or (select name from public.products where id = v_pid) <> 'Producto Prueba' then raise exception 'SELFTEST FALLO: no-admin modificó un producto'; end if;
  perform pg_temp.pass('E7 no-admin no puede modificar productos (RLS filtra 0 filas)');
  r := pg_temp.call_as('authenticated', v_visitor, $q$ select jsonb_build_object('pedidos', (select count(*) from public.orders), 'lineas', (select count(*) from public.order_items),
                                                      'inventario', (select count(*) from public.inventory), 'ocultos', (select count(*) from public.products where status <> 'published')) $q$);
  if (r->>'pedidos')::int <> 0 or (r->>'lineas')::int <> 0 or (r->>'ocultos')::int <> 0 then raise exception 'SELFTEST FALLO: no-admin ve datos privados: %', r; end if;
  perform pg_temp.pass('E8 no-admin no ve pedidos, líneas ni productos no publicados');
  if pg_temp.call_as('authenticated', v_visitor, 'select to_jsonb(public.is_admin())') <> 'false'::jsonb then raise exception 'SELFTEST FALLO: is_admin() true para no-admin'; end if;
  if pg_temp.call_as('authenticated', v_admin, 'select to_jsonb(public.is_admin())') <> 'true'::jsonb then raise exception 'SELFTEST FALLO: is_admin() false para el admin'; end if;
  perform pg_temp.pass('E9 is_admin(): false para no-admin, true para el administrador');

  -- ═════ F. ADMINISTRADOR: PRODUCTOS ═════
  r := pg_temp.call_as('authenticated', v_admin, format('select public.admin_save_product(%L::jsonb)',
    '{"slug":"zz-creado","brand":"M","name":"Creado","category":"Mujer","images":["/assets/images/x.jpg"],"notes":{"salida":["bergamota"]},
      "presentations":{"5":{"enabled":true,"price_cop":20000},"10":{"enabled":false,"price_cop":null},"full":{"enabled":true,"price_cop":150000}}}'));
  v_new := (r->>'id')::int;
  if (select count(*) from public.product_presentations where product_id = v_new) <> 3
     or (select enabled from public.product_presentations where product_id = v_new and kind = '10') then raise exception 'SELFTEST FALLO: presentaciones mal guardadas'; end if;
  if (select price_cop from public.product_presentations where product_id = v_new and kind = '5') <> 20000
     or (select price_cop from public.product_presentations where product_id = v_new and kind = 'full') <> 150000
     or (select price_cop from public.product_presentations where product_id = v_new and kind = '10') is not null then raise exception 'SELFTEST FALLO: precios independientes'; end if;
  perform pg_temp.pass('F1 el admin crea un perfume con 3 presentaciones, precios independientes y una desactivada');
  if (pg_temp.call_as('anon', null, format('select to_jsonb((select count(*) from public.product_presentations where product_id = %s))', v_new)))::text <> '2' then
    raise exception 'SELFTEST FALLO: anon debe ver solo las 2 presentaciones activas'; end if;
  perform pg_temp.pass('F2 la presentación desactivada no es visible para el público');

  r := pg_temp.call_as('authenticated', v_admin, format('select public.admin_save_product(%L::jsonb)',
    format('{"id":%s,"slug":"zz-creado","brand":"M","name":"Creado v2","category":"Mujer"}', v_new)));
  if (select name from public.products where id = v_new) <> 'Creado v2' or (select images->>0 from public.products where id = v_new) <> '/assets/images/x.jpg'
     or (select notes->'salida'->>0 from public.products where id = v_new) <> 'bergamota' then raise exception 'SELFTEST FALLO: la actualización parcial borró fotos o notas'; end if;
  perform pg_temp.pass('F3 actualización parcial: los campos omitidos (fotos, notas) se conservan');

  perform pg_temp.expect_fail('F4 precio negativo rechazado', 'authenticated', v_admin,
    format($q$ select public.admin_save_product(%L::jsonb) $q$, format('{"id":%s,"slug":"zz-creado","brand":"M","name":"x","category":"Mujer","presentations":{"5":{"price_cop":-5}}}', v_new)), 'número entero');
  perform pg_temp.expect_fail('F5 precio decimal rechazado', 'authenticated', v_admin,
    format($q$ select public.admin_save_product(%L::jsonb) $q$, format('{"id":%s,"slug":"zz-creado","brand":"M","name":"x","category":"Mujer","presentations":{"5":{"price_cop":"12.5"}}}', v_new)), 'número entero');
  perform pg_temp.expect_fail('F6 precio cero rechazado', 'authenticated', v_admin,
    format($q$ select public.admin_save_product(%L::jsonb) $q$, format('{"id":%s,"slug":"zz-creado","brand":"M","name":"x","category":"Mujer","presentations":{"5":{"price_cop":0}}}', v_new)), 'mayor que cero');
  perform pg_temp.expect_fail('F7 slug duplicado en alta rechazado', 'authenticated', v_admin,
    $q$ select public.admin_save_product('{"slug":"zz-test-producto","brand":"M","name":"x","category":"Mujer"}'::jsonb) $q$, 'slug ya existe');
  perform pg_temp.expect_fail('F8 slug de otro perfume en edición rechazado', 'authenticated', v_admin,
    format($q$ select public.admin_save_product(%L::jsonb) $q$, format('{"id":%s,"slug":"zz-test-producto","brand":"M","name":"x","category":"Mujer"}', v_new)), 'otro perfume');
  perform pg_temp.expect_fail('F9 categoría inválida', 'authenticated', v_admin,
    $q$ select public.admin_save_product('{"slug":"zz-y","brand":"M","name":"x","category":"Otro"}'::jsonb) $q$, 'Categoría');
  perform pg_temp.expect_fail('F10 slug inválido (mayúsculas/espacios)', 'authenticated', v_admin,
    $q$ select public.admin_save_product('{"slug":"Zz Malo","brand":"M","name":"x","category":"Mujer"}'::jsonb) $q$, 'slug');
  perform pg_temp.expect_fail('F11 más de 3 fotos', 'authenticated', v_admin,
    $q$ select public.admin_save_product('{"slug":"zz-z","brand":"M","name":"x","category":"Mujer","images":["a","b","c","d"]}'::jsonb) $q$, 'Máximo 3');
  perform pg_temp.expect_fail('F12 un precio inválido no deja el producto a medias (todo o nada)', 'authenticated', v_admin,
    $q$ select public.admin_save_product('{"slug":"zz-atomico","brand":"M","name":"x","category":"Mujer","presentations":{"5":{"price_cop":-1}}}'::jsonb) $q$, 'número entero');
  if exists (select 1 from public.products where slug = 'zz-atomico') then raise exception 'SELFTEST FALLO: se guardó un producto a medias'; end if;

  perform pg_temp.call_as('authenticated', v_admin, format('select public.admin_save_product(%L::jsonb)',
    format('{"id":%s,"slug":"zz-creado-nuevo","brand":"M","name":"Creado v2","category":"Mujer"}', v_new)));
  if (select count(*) from public.product_slugs where product_id = v_new and slug in ('zz-creado','zz-creado-nuevo')) <> 2 then
    raise exception 'SELFTEST FALLO: el slug anterior no quedó registrado'; end if;
  if (pg_temp.call_as('anon', null, format('select to_jsonb((select count(*) from public.product_slugs where product_id = %s))', v_new)))::text <> '2' then
    raise exception 'SELFTEST FALLO: anon debe poder resolver el slug anterior'; end if;
  perform pg_temp.expect_fail('F13 otro perfume no puede tomar un slug anterior', 'authenticated', v_admin,
    $q$ select public.admin_save_product('{"slug":"zz-creado","brand":"M","name":"x","category":"Mujer"}'::jsonb) $q$, 'slug ya existe');
  perform pg_temp.pass('F14 cambiar el slug conserva el anterior (URL antigua resoluble) y nadie más puede tomarlo');

  perform pg_temp.call_as('authenticated', v_admin, format('select public.admin_save_product(%L::jsonb)',
    format('{"id":%s,"slug":"zz-creado-nuevo","brand":"M","name":"Creado v2","category":"Mujer","status":"archived"}', v_new)));
  if (pg_temp.call_as('anon', null, format('select to_jsonb((select count(*) from public.products where id = %s))', v_new)))::text <> '0' then
    raise exception 'SELFTEST FALLO: un perfume archivado sigue visible'; end if;
  perform pg_temp.expect_fail('F15 un perfume archivado no se puede pedir', 'anon', null,
    format($q$ select public.create_order(gen_random_uuid(), '[{"product_id":%s,"kind":"5","quantity":1}]'::jsonb) $q$, v_new), 'no_existe');
  perform pg_temp.pass('F16 archivar oculta el perfume sin borrarlo');

  perform pg_temp.expect_fail('F17 un administrador no puede borrar perfumes', 'authenticated', v_admin,
    $q$ delete from public.products where slug = 'zz-test-producto' $q$, 'permission denied');
  perform pg_temp.expect_fail('F18 el id de un perfume es inmutable', 'postgres', null,
    $q$ update public.products set id = id + 100000 where slug = 'zz-test-producto' $q$, 'inmutable');

  -- ═════ G. ADMINISTRADOR: PEDIDOS ═════
  if (pg_temp.call_as('authenticated', v_admin, 'select to_jsonb((select count(*) from public.orders))'))::text::int < 2 then raise exception 'SELFTEST FALLO: el admin no ve los pedidos'; end if;
  perform pg_temp.pass('G1 el administrador ve los pedidos');
  perform pg_temp.expect_fail('G2 el admin no puede cambiar el estado con UPDATE directo', 'authenticated', v_admin,
    $q$ update public.orders set status = 'pagado' $q$, 'permission denied');
  perform pg_temp.expect_fail('G3 el admin no puede modificar totales', 'authenticated', v_admin,
    $q$ update public.orders set total_cop = 1 $q$, 'permission denied');

  foreach t in array array['pendiente_confirmacion','confirmado','pendiente_pago','pagado','en_preparacion','enviado','entregado'] loop
    r := pg_temp.call_as('authenticated', v_admin, format('select public.admin_set_order_status(%L, %L, %L)', v_oid, t, 'selftest'));
    if r->>'status' <> t then raise exception 'SELFTEST FALLO: transición a % no aplicada', t; end if;
  end loop;
  if (select count(*) from public.order_events where order_id = v_oid) <> 8 then raise exception 'SELFTEST FALLO: historial incompleto'; end if;
  perform pg_temp.pass('G4 recorrido completo iniciado → … → entregado con historial de 8 eventos');
  perform pg_temp.expect_fail('G5 un pedido entregado es final', 'authenticated', v_admin,
    format($q$ select public.admin_set_order_status(%L, 'cancelado', '') $q$, v_oid), 'TRANSITION_NOT_ALLOWED');

  r := pg_temp.call_as('anon', null, format('select public.create_order(gen_random_uuid(), %L::jsonb)', format('[{"product_id":%s,"kind":"full","quantity":1}]', v_pid)));
  v_oid2 := (r->>'order_id')::uuid;
  perform pg_temp.expect_fail('G6 no se puede saltar de iniciado a pagado', 'authenticated', v_admin,
    format($q$ select public.admin_set_order_status(%L, 'pagado', '') $q$, v_oid2), 'TRANSITION_NOT_ALLOWED');
  perform pg_temp.call_as('authenticated', v_admin, format('select public.admin_set_order_status(%L, ''cancelado'', ''cliente no respondió'')', v_oid2));
  perform pg_temp.expect_fail('G7 un pedido cancelado es final', 'authenticated', v_admin,
    format($q$ select public.admin_set_order_status(%L, 'confirmado', '') $q$, v_oid2), 'TRANSITION_NOT_ALLOWED');
  perform pg_temp.expect_fail('G8 estado inexistente rechazado', 'authenticated', v_admin,
    format($q$ select public.admin_set_order_status(%L, 'inventado', '') $q$, v_oid2), 'TRANSITION_NOT_ALLOWED');
  perform pg_temp.call_as('authenticated', v_admin, format('select public.admin_set_order_notes(%L, %L)', v_oid2, 'Nota de prueba'));
  if (select admin_notes from public.orders where id = v_oid2) <> 'Nota de prueba' then raise exception 'SELFTEST FALLO: nota no guardada'; end if;
  perform pg_temp.pass('G9 notas administrativas guardadas; transiciones inválidas rechazadas');

  perform pg_temp.expect_fail('G10 el total de un pedido es inmutable (aun con permisos totales)', 'postgres', null,
    format($q$ update public.orders set total_cop = 1 where id = %L $q$, v_oid), 'inmutables');
  perform pg_temp.expect_fail('G11 las líneas del pedido son inmutables', 'postgres', null, $q$ update public.order_items set quantity = 99 $q$, 'Registro histórico');
  perform pg_temp.expect_fail('G12 el historial de eventos no se puede borrar', 'postgres', null, $q$ delete from public.order_events $q$, 'Registro histórico');
  perform pg_temp.expect_fail('G13 un pedido no se puede borrar (la cascada tropieza con el histórico)', 'postgres', null,
    format($q$ delete from public.orders where id = %L $q$, v_oid), 'Registro histórico');

  -- ═════ H. INVENTARIO (sin configurar por defecto; no bloquea ventas) ═════
  if (select count(*) from public.inventory where product_id = v_pid) <> 0 then raise exception 'SELFTEST FALLO: se crearon existencias sin que nadie las configurara'; end if;
  perform pg_temp.pass('H1 inventario sin configurar: no se inventan existencias');
  perform pg_temp.call_as('authenticated', v_admin, format('select public.admin_set_inventory(%s, ''5'', ''disponible'', null, false, ''solo estado'')', v_pid));
  if (select quantity from public.inventory where product_id = v_pid and kind = '5') is not null
     or (select quantity_verified_at from public.inventory where product_id = v_pid and kind = '5') is not null then raise exception 'SELFTEST FALLO: se guardó una cantidad sin pedirla'; end if;
  perform pg_temp.pass('H2 se puede registrar solo el estado, sin cantidad');
  perform pg_temp.expect_fail('H3 cantidad sin verificar rechazada', 'authenticated', v_admin,
    format($q$ select public.admin_set_inventory(%s, '10', 'disponible', 12, false, '') $q$, v_pid), 'verificada');
  perform pg_temp.call_as('authenticated', v_admin, format('select public.admin_set_inventory(%s, ''10'', ''disponible'', 12, true, ''conteo físico'')', v_pid));
  if (select quantity from public.inventory where product_id = v_pid and kind = '10') <> 12
     or (select quantity_verified_at from public.inventory where product_id = v_pid and kind = '10') is null then raise exception 'SELFTEST FALLO: cantidad verificada no guardada'; end if;
  perform pg_temp.pass('H4 cantidad verificada guardada con fecha de verificación');
  perform pg_temp.expect_fail('H5 cantidad negativa rechazada', 'authenticated', v_admin,
    format($q$ select public.admin_set_inventory(%s, '10', 'disponible', -1, true, '') $q$, v_pid), 'check');
  perform pg_temp.expect_fail('H6 estado de inventario inválido rechazado', 'authenticated', v_admin,
    format($q$ select public.admin_set_inventory(%s, '10', 'inventado', null, false, '') $q$, v_pid), 'check');
  perform pg_temp.call_as('authenticated', v_admin, format('select public.admin_set_inventory(%s, ''5'', ''agotado'', null, false, '''')', v_pid));
  r := pg_temp.call_as('anon', null, format('select public.create_order(gen_random_uuid(), %L::jsonb)', format('[{"product_id":%s,"kind":"5","quantity":1}]', v_pid)));
  if r->>'status' <> 'iniciado' then raise exception 'SELFTEST FALLO: el inventario bloqueó una venta'; end if;
  perform pg_temp.pass('H7 el inventario (v1) NO bloquea ventas: la disponibilidad la decide el vendedor');
  r := pg_temp.call_as('authenticated', v_visitor, $q$ select to_jsonb((select count(*) from public.inventory)) $q$);
  if r <> '0'::jsonb then raise exception 'SELFTEST FALLO: un no-admin ve inventario (% filas)', r; end if;
  perform pg_temp.pass('H8 el no-admin ve 0 filas de inventario (RLS)');
  perform pg_temp.expect_fail('H9 anon no puede leer inventario', 'anon', null, $q$ select count(*) from public.inventory $q$, 'permission denied');

  -- ═════ Resultado: se revierte TODO a propósito ═════
  select string_agg(format('  %s. %s', l.seq, l.label), E'\n' order by l.seq) into v_log from selftest_log l;
  raise exception E'SELFTEST OK — % pruebas pasaron. (Este "error" es a propósito: revierte todos los datos de prueba.)\n%', (select count(*) from selftest_log), v_log;
end
$st$;
