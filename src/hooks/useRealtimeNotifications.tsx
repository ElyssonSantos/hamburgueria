import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { criarNotificacaoInterna } from "@/utils/internalNotifications";

export const useRealtimeNotifications = () => {
  useEffect(() => {
    console.log("Iniciando listener de notificações em tempo real...");

    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "push_notifications_history",
        },
        (payload) => {
          console.log("Nova notificação recebida:", payload);
          
          const notification = payload.new as {
            title: string;
            body: string;
            image_url?: string;
            duration_ms?: number;
          };

          // Disparar notificação visual para todos os usuários conectados
          criarNotificacaoInterna({
            title: notification.title,
            message: notification.body,
            iconUrl: notification.image_url || undefined,
            durationMs: notification.duration_ms || 4000,
          });
        }
      )
      .subscribe((status) => {
        console.log("Status da subscrição:", status);
      });

    return () => {
      console.log("Removendo listener de notificações...");
      supabase.removeChannel(channel);
    };
  }, []);
};
