#!/usr/bin/env bash
# Ejecuta la autoverificación SQL contra una base de PRUEBAS.
#   DATABASE_URL="postgresql://postgres:<clave>@db.<ref>.supabase.co:5432/postgres" ./supabase/tests/run-selftest.sh
# (o con Supabase local:  supabase start  →  DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres)
# La autoverificación REVIERTE todos sus datos; aun así, NO la apuntes a producción.
set -u
: "${DATABASE_URL:?Define DATABASE_URL apuntando a un proyecto de PRUEBAS}"
case "$DATABASE_URL" in *prod*|*production*) echo "Rechazado: la URL parece de producción."; exit 2;; esac
command -v psql >/dev/null || { echo "Falta psql (cliente de PostgreSQL)."; exit 2; }
here="$(cd "$(dirname "$0")" && pwd)"
out="$(psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$here/selftest.sql" 2>&1)"
echo "$out"
if echo "$out" | grep -q "SELFTEST OK"; then echo; echo "✔ Autoverificación superada (datos revertidos)."; exit 0; fi
echo; echo "✘ La autoverificación FALLÓ: revisa la línea 'SELFTEST FALLO' de arriba."; exit 1
