-- ════════════════════════════════════════════════════════════════════════════════
-- PARCHE para proyectos que ya aplicaron una versión anterior de 0001_init.sql.
-- Corrige: anon/authenticated tenían EXECUTE sobre funciones internas y de administración
-- (Supabase concede ese permiso por defecto y «revoke … from public» no lo quita).
-- Es idempotente (se puede ejecutar más de una vez). Los proyectos NUEVOS no lo necesitan: ya está dentro de 0001_init.sql.
-- Después de ejecutarlo, vuelve a pasar supabase/tests/selftest.sql.
-- ════════════════════════════════════════════════════════════════════════════════
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;   -- tablas futuras: sin acceso hasta que se conceda a propósito

revoke all on function public.is_admin()                                              from public, anon, authenticated;
revoke all on function public.touch_updated_at()                                      from public, anon, authenticated;
revoke all on function public.products_guard()                                        from public, anon, authenticated;
revoke all on function public.products_track_slug()                                   from public, anon, authenticated;
revoke all on function public.orders_immutable()                                      from public, anon, authenticated;
revoke all on function public.forbid_change()                                         from public, anon, authenticated;
revoke all on function public.order_transition_allowed(text, text)                    from public, anon, authenticated;
revoke all on function public.order_to_json(uuid)                                     from public, anon, authenticated;
revoke all on function public.create_order(uuid, jsonb)                               from public, anon, authenticated;
revoke all on function public.admin_set_order_status(uuid, text, text)                from public, anon, authenticated;
revoke all on function public.admin_set_order_notes(uuid, text)                       from public, anon, authenticated;
revoke all on function public.admin_save_product(jsonb)                               from public, anon, authenticated;
revoke all on function public.admin_set_inventory(integer, text, text, integer, boolean, text) from public, anon, authenticated;

-- Concesiones mínimas:
grant execute on function public.is_admin()                                           to anon, authenticated;  -- las políticas RLS la usan; devuelve false para anon
grant execute on function public.create_order(uuid, jsonb)                            to anon, authenticated;  -- única vía para que un visitante cree un pedido
grant execute on function public.admin_set_order_status(uuid, text, text)             to authenticated;
grant execute on function public.admin_set_order_notes(uuid, text)                    to authenticated;
grant execute on function public.admin_save_product(jsonb)                            to authenticated;
grant execute on function public.admin_set_inventory(integer, text, text, integer, boolean, text) to authenticated;
-- order_to_json y las funciones de trigger NO se conceden a nadie: solo las usan otras funciones del servidor.
