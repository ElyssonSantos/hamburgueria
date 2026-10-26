-- Tornar o campo role nullable em user_roles para suportar cargos customizados
ALTER TABLE public.user_roles 
ALTER COLUMN role DROP NOT NULL;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.user_roles.role IS 'Cargo fixo (dono, gerente, midias) ou NULL se usar cargo customizado';
COMMENT ON COLUMN public.user_roles.custom_role_id IS 'Referência ao cargo customizado, se aplicável';

-- Adicionar constraint para garantir que ou role ou custom_role_id esteja preenchido
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_role_or_custom_check 
CHECK (
  (role IS NOT NULL AND custom_role_id IS NULL) OR 
  (role IS NULL AND custom_role_id IS NOT NULL)
);

-- Adicionar campo para ativar/desativar logo do banner principal
ALTER TABLE public.site_config
ADD COLUMN IF NOT EXISTS mostrar_logo_banner boolean NOT NULL DEFAULT true;