-- Tornar save-subscription totalmente público
-- Não precisa de alterações de tabela, apenas garantir que a policy permite inserções anônimas

-- Garantir que a tabela push_logs existe com a estrutura correta
CREATE TABLE IF NOT EXISTS push_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text,
  message text,
  recipients_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  fail_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE push_logs ENABLE ROW LEVEL SECURITY;

-- Policy para dono visualizar logs
CREATE POLICY "Dono pode visualizar logs" ON push_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'dono'
  )
);

-- Policy para inserir logs (usado pela edge function)
CREATE POLICY "System can insert logs" ON push_logs
FOR INSERT
WITH CHECK (true);