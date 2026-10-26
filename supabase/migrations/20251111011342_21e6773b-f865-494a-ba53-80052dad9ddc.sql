-- Criar tabela de logs administrativos
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_logs
CREATE POLICY "Dono e gerente podem visualizar logs"
  ON public.admin_logs
  FOR SELECT
  USING (
    has_role(auth.uid(), 'dono'::app_role) OR 
    has_role(auth.uid(), 'gerente'::app_role)
  );

CREATE POLICY "Todos os usuários autenticados podem criar logs"
  ON public.admin_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Apenas dono pode deletar logs recentes"
  ON public.admin_logs
  FOR DELETE
  USING (
    has_role(auth.uid(), 'dono'::app_role) AND 
    created_at >= NOW() - INTERVAL '7 days'
  );

-- Adicionar campo logo_url na tabela site_config
ALTER TABLE public.site_config 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Adicionar campos de personalização na tabela categories
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS titulo_customizado TEXT,
ADD COLUMN IF NOT EXISTS subtitulo_customizado TEXT,
ADD COLUMN IF NOT EXISTS cor_fundo_1 TEXT DEFAULT '#f59e0b',
ADD COLUMN IF NOT EXISTS cor_fundo_2 TEXT DEFAULT '#f97316',
ADD COLUMN IF NOT EXISTS tipo_fundo TEXT DEFAULT 'gradient' CHECK (tipo_fundo IN ('gradient', 'solid'));

-- Criar índice para melhorar performance de consultas nos logs
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_user_id ON public.admin_logs(user_id);