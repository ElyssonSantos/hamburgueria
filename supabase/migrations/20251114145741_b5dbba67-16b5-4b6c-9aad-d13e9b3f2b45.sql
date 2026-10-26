-- Adicionar nova permissão para enviar notificações push se não existir
INSERT INTO public.permissions (role, resource, can_view, can_create, can_update, can_delete)
VALUES 
  ('gerente', 'push_notifications', false, false, false, false),
  ('midias', 'push_notifications', false, false, false, false)
ON CONFLICT (role, resource) DO NOTHING;