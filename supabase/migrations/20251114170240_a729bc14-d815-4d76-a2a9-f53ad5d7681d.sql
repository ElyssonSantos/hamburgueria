-- Adicionar coluna para duração da notificação
ALTER TABLE push_notifications_history 
ADD COLUMN IF NOT EXISTS duration_ms INTEGER DEFAULT 4000;