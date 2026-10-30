#!/usr/bin/env bash
# Prueba de CONCURRENCIA de la idempotencia de create_order: N peticiones simultáneas con el MISMO client_request_id
# deben producir EXACTAMENTE un pedido y devolver todas el mismo código.
#   DATABASE_URL=... ./supabase/tests/concurrency.sh [N=12]
# ⚠ SOLO EN UN PROYECTO DE PRUEBAS: crea un producto 'zz-concurrencia' y un pedido que NO se pueden borrar
#   (el histórico es inmutable). Usa un proyecto desechable o reinícialo después.
set -u
: "${DATABASE_URL:?Define DATABASE_URL apuntando a un proyecto de PRUEBAS}"
case "$DATABASE_URL" in *prod*|*production*) echo "Rechazado: la URL parece de producción."; exit 2;; esac
command -v psql >/dev/null || { echo "Falta psql."; exit 2; }
N="${1:-12}"
psql "$DATABASE_URL" -X -q -v ON_ERROR_STOP=1 <<'SQL'
insert into public.products(slug, brand, name, category) values ('zz-concurrencia', 'Test', 'Concurrencia', 'Unisex') on conflict (slug) do nothing;
insert into public.product_presentations(product_id, kind, enabled, price_cop)
  select id, '5', true, 20000 from public.products where slug = 'zz-concurrencia' on conflict (product_id, kind) do nothing;
SQL
PID="$(psql "$DATABASE_URL" -X -At -c "select id from public.products where slug='zz-concurrencia'")"
REQ="$(psql "$DATABASE_URL" -X -At -c "select gen_random_uuid()")"
tmp="$(mktemp -d)"
for i in $(seq 1 "$N"); do
  ( psql "$DATABASE_URL" -X -At -v ON_ERROR_STOP=1 -c "set role anon; select public.create_order('$REQ'::uuid, '[{\"product_id\":$PID,\"kind\":\"5\",\"quantity\":1}]'::jsonb)->>'code'" > "$tmp/$i.out" 2> "$tmp/$i.err" ) &
done
wait
ok=0; fail=0
for i in $(seq 1 "$N"); do if [ -s "$tmp/$i.out" ]; then ok=$((ok+1)); else fail=$((fail+1)); echo "petición $i falló: $(tr '\n' ' ' < "$tmp/$i.err")"; fi; done
codes="$(cat "$tmp"/*.out 2>/dev/null | grep -v '^SET$' | sort -u | grep -c '^SP-')"
orders="$(psql "$DATABASE_URL" -X -At -c "select count(*) from public.orders where client_request_id = '$REQ'")"
echo "Peticiones: $N | con respuesta: $ok | sin respuesta: $fail | códigos distintos devueltos: $codes | pedidos creados: $orders"
rm -rf "$tmp"
if [ "$orders" = "1" ] && [ "$codes" = "1" ] && [ "$fail" = "0" ]; then echo "✔ Idempotencia correcta bajo concurrencia."; exit 0; fi
echo "✘ FALLO de idempotencia bajo concurrencia."; exit 1
