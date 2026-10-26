import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  mensagem: string;
  ativo: boolean;
  ordem: number;
}

export const NotificationBanner = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [intervalTime, setIntervalTime] = useState(30); // Renamed to avoid conflict with global interval

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data: notificationsData } = await supabase
      .from("notifications")
      .select("*")
      .eq("ativo", true)
      .order("ordem");

    const { data: configData } = await supabase
      .from("site_config")
      .select("intervalo_notificacao")
      .limit(1)
      .single();

    if (notificationsData && notificationsData.length > 0) {
      setNotifications(notificationsData);
      setIsVisible(true);
    } else {
      setNotifications([]); // Ensure notifications is empty if no active ones
      setIsVisible(false);
    }

    if (configData && configData.intervalo_notificacao > 0) {
      setIntervalTime(configData.intervalo_notificacao);
    } else {
      setIntervalTime(30); // Default to 30 seconds if config is invalid
    }
  };

  useEffect(() => {
    if (notifications.length <= 1) {
      // No rotation needed if 0 or 1 notification
      return;
    }

    const timer = setInterval(() => {
      setIsVisible(false); // Start fade out
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % notifications.length);
        setIsVisible(true); // Start fade in
      }, 300); // Wait for fade out before changing content and fading in
    }, intervalTime * 1000);

    return () => clearInterval(timer);
  }, [notifications.length, intervalTime]);

  if (notifications.length === 0 || !isVisible) return null;

  const currentNotification = notifications[currentIndex];

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-2xl w-full mx-4 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className="bg-gradient-to-r from-primary to-secondary text-background px-6 py-4 rounded-lg shadow-lg flex items-center justify-between">
        <p className="font-semibold text-sm md:text-base flex-1">
          🔔 {currentNotification.mensagem}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="ml-4 hover:bg-background/20 text-background"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};