-- Adicionar campos de cores personalizáveis na site_config
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS cor_primaria text DEFAULT 'hsl(40, 100%, 50%)';
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS cor_secundaria text DEFAULT 'hsl(25, 95%, 53%)';
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS cor_fundo_claro text DEFAULT 'hsl(0, 0%, 100%)';
ALTER TABLE public.site_config ADD COLUMN IF NOT EXISTS cor_fundo_escuro text DEFAULT 'hsl(240, 10%, 3.9%)';

-- Criar tabela de permissões granulares
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  resource text NOT NULL,
  can_view boolean DEFAULT false,
  can_create boolean DEFAULT false,
  can_update boolean DEFAULT false,
  can_delete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, resource)
);

-- Habilitar RLS na tabela permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Policies para a tabela permissions
CREATE POLICY "Dono pode gerenciar todas as permissões"
  ON public.permissions
  FOR ALL
  USING (has_role(auth.uid(), 'dono'::app_role));

CREATE POLICY "Usuários podem ver suas próprias permissões"
  ON public.permissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = permissions.role
    )
  );

-- Inserir permissões padrão para cada cargo
INSERT INTO public.permissions (role, resource, can_view, can_create, can_update, can_delete)
VALUES
  -- Permissões do Dono (total)
  ('dono', 'products', true, true, true, true),
  ('dono', 'categories', true, true, true, true),
  ('dono', 'banners', true, true, true, true),
  ('dono', 'notifications', true, true, true, true),
  ('dono', 'users', true, true, true, true),
  ('dono', 'logs', true, false, false, true),
  ('dono', 'customization', true, false, true, false),
  ('dono', 'config', true, false, true, false),
  ('dono', 'permissions', true, false, true, false),
  ('dono', 'theme', true, false, true, false),
  
  -- Permissões do Gerente
  ('gerente', 'products', true, true, true, true),
  ('gerente', 'categories', true, true, true, true),
  ('gerente', 'banners', true, true, true, true),
  ('gerente', 'notifications', true, true, true, true),
  ('gerente', 'users', true, true, true, false),
  ('gerente', 'logs', true, false, false, false),
  ('gerente', 'customization', true, false, true, false),
  ('gerente', 'config', true, false, true, false),
  ('gerente', 'permissions', false, false, false, false),
  ('gerente', 'theme', true, false, true, false),
  
  -- Permissões do Midias
  ('midias', 'products', true, false, true, false),
  ('midias', 'categories', true, false, false, false),
  ('midias', 'banners', true, true, true, true),
  ('midias', 'notifications', true, true, true, true),
  ('midias', 'users', false, false, false, false),
  ('midias', 'logs', false, false, false, false),
  ('midias', 'customization', false, false, false, false),
  ('midias', 'config', false, false, false, false),
  ('midias', 'permissions', false, false, false, false),
  ('midias', 'theme', false, false, false, false)
ON CONFLICT (role, resource) DO NOTHING;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_permissions_updated_at
  BEFORE UPDATE ON public.permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();