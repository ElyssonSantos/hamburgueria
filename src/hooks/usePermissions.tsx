import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Permission {
  resource: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, roles } = useAuth();

  useEffect(() => {
    if (user && roles.length > 0) {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, [user, roles]);

  const fetchPermissions = async () => {
    const roleStrings = roles.map(r => r.role);
    const { data } = await supabase
      .from("permissions")
      .select("*")
      .in("role", roleStrings);

    if (data) {
      setPermissions(data);
    }
    setLoading(false);
  };

  const hasPermission = (resource: string, action: "view" | "create" | "update" | "delete") => {
    const permission = permissions.find((p) => p.resource === resource);
    if (!permission) return false;

    switch (action) {
      case "view":
        return permission.can_view;
      case "create":
        return permission.can_create;
      case "update":
        return permission.can_update;
      case "delete":
        return permission.can_delete;
      default:
        return false;
    }
  };

  return { permissions, hasPermission, loading };
};
