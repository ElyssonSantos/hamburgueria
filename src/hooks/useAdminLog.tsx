import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useAdminLog = () => {
  const { user, roles } = useAuth();

  const logAction = async (action: string, details?: string) => {
    if (!user) return;

    const userRole = roles.length > 0 ? roles[0].role : "unknown";

    await supabase.from("admin_logs").insert({
      user_email: user.email || "unknown",
      user_role: userRole,
      action,
      details,
    });
  };

  return { logAction };
};
