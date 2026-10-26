-- Criar tabela para armazenar assinaturas de push
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Criar tabela para histórico de notificações enviadas
CREATE TABLE IF NOT EXISTS public.push_notifications_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  image_url text,
  target text NOT NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_at timestamp with time zone DEFAULT now(),
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0
);

-- Habilitar RLS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_notifications_history ENABLE ROW LEVEL SECURITY;

-- Políticas para push_subscriptions
CREATE POLICY "Qualquer um pode inserir sua própria assinatura"
ON public.push_subscriptions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Dono pode visualizar todas as assinaturas"
ON public.push_subscriptions FOR SELECT
USING (has_role(auth.uid(), 'dono'::app_role));

CREATE POLICY "Usuários podem deletar sua própria assinatura"
ON public.push_subscriptions FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Políticas para push_notifications_history
CREATE POLICY "Dono pode visualizar histórico"
ON public.push_notifications_history FOR SELECT
USING (has_role(auth.uid(), 'dono'::app_role));

CREATE POLICY "Usuários com permissão podem criar histórico"
ON public.push_notifications_history FOR INSERT
WITH CHECK (has_role(auth.uid(), 'dono'::app_role));

-- Adicionar nova permissão para enviar notificações push
INSERT INTO public.permissions (role, resource, can_view, can_create, can_update, can_delete)
VALUES 
  ('gerente', 'push_notifications', false, false, false, false),
  ('midias', 'push_notifications', false, false, false, false)
ON CONFLICT (role, resource) DO NOTHING;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_client_id ON public.push_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_push_notifications_sent_at ON public.push_notifications_history(sent_at DESC);