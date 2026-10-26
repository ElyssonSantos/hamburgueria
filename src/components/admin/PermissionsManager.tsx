import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw } from "lucide-react";

interface Permission {
  id: string;
  role: string;
  resource: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface CustomRolePermission {
  id: string;
  custom_role_id: string;
  resource: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface CustomRole {
  id: string;
  name: string;
}

const resourceLabels: { [key: string]: string } = {
  products: "Produtos",
  categories: "Categorias",
  banners: "Banners",
  notifications: "Notificações",
  users: "Usuários",
  logs: "Logs",
  customization: "Personalização Visual",
  config: "Configurações do Site",
  permissions: "Gerenciar Permissões",
  theme: "Personalização de Cores",
  coupons: "Cupons",
  gallery: "Galeria",
  footer: "Rodapé",
};

const fixedRoleLabels: { [key: string]: string } = {
  gerente: "Gerente",
  midias: "Mídias",
};

export const PermissionsManager = () => {
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [customRolePermissions, setCustomRolePermissions] = useState<{ [roleId: string]: CustomRolePermission[] }>({});
  const [selectedRoleType, setSelectedRoleType] = useState<"fixed" | "custom">("fixed");
  const [selectedRole, setSelectedRole] = useState<string>("gerente");
  const [selectedCustomRole, setSelectedCustomRole] = useState<string>("");
  const { toast } = useToast();
  const { logAction } = useAdminLog();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    
    const { data: fixedPerms } = await supabase.from("permissions").select("*").order("role, resource");
    if (fixedPerms) setPermissions(fixedPerms);

    const { data: customRolesData } = await supabase.from("custom_roles").select("*").order("name");
    if (customRolesData) {
      setCustomRoles(customRolesData);
      if (customRolesData.length > 0 && !selectedCustomRole) {
        setSelectedCustomRole(customRolesData[0].id);
      }
    }

    const { data: customPerms } = await supabase.from("custom_role_permissions").select("*");
    if (customPerms) {
      const permsByRole: { [key: string]: CustomRolePermission[] } = {};
      customPerms.forEach((perm) => {
        if (!permsByRole[perm.custom_role_id]) permsByRole[perm.custom_role_id] = [];
        permsByRole[perm.custom_role_id].push(perm);
      });
      setCustomRolePermissions(permsByRole);
    }

    setLoading(false);
  };

  const handleToggle = async (permissionId: string, field: keyof Omit<Permission, 'id' | 'role' | 'resource'>, value: boolean, isCustom: boolean, roleId?: string) => {
    const table = isCustom ? "custom_role_permissions" : "permissions";
    const { error } = await supabase.from(table).update({ [field]: value }).eq("id", permissionId);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      if (isCustom && roleId) {
        setCustomRolePermissions((prev) => ({
          ...prev,
          [roleId]: prev[roleId].map((p) => p.id === permissionId ? { ...p, [field]: value } : p),
        }));
      } else {
        setPermissions((prev) => prev.map((p) => p.id === permissionId ? { ...p, [field]: value } : p));
      }
      toast({ title: "✅ Sucesso", description: "Permissão atualizada.", className: "bg-green-500 text-white" });
      await logAction("Alterou permissões", `Campo: ${field}`);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  const renderPermissions = (perms: (Permission | CustomRolePermission)[], isCustom: boolean, roleId?: string) => (
    <div className="space-y-4">
      {perms.map((permission) => (
        <Card key={permission.id} className="p-4">
          <h3 className="font-semibold mb-3">{resourceLabels[permission.resource] || permission.resource}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['can_view', 'can_create', 'can_update', 'can_delete'] as const).map((field) => (
              <div key={field} className="flex items-center justify-between">
                <Label htmlFor={`${field}-${permission.id}`}>{field === 'can_view' ? 'Visualizar' : field === 'can_create' ? 'Criar' : field === 'can_update' ? 'Editar' : 'Excluir'}</Label>
                <Switch id={`${field}-${permission.id}`} checked={permission[field]} onCheckedChange={(checked) => handleToggle(permission.id, field, checked, isCustom, roleId)} />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciar Permissões por Cargo</CardTitle>
        <CardDescription>Edite as permissões dos cargos fixos ou customizados.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button onClick={fetchAllData} variant="outline"><RefreshCw className="h-4 w-4 mr-2" />Atualizar Lista</Button>
        <div className="flex gap-2">
          <Button variant={selectedRoleType === "fixed" ? "default" : "outline"} onClick={() => setSelectedRoleType("fixed")}>Cargos Fixos</Button>
          <Button variant={selectedRoleType === "custom" ? "default" : "outline"} onClick={() => setSelectedRoleType("custom")} disabled={customRoles.length === 0}>Cargos Customizados</Button>
        </div>
        {selectedRoleType === "fixed" ? (
          <>
            <div className="flex gap-2">{["gerente", "midias"].map((role) => <Button key={role} variant={selectedRole === role ? "default" : "outline"} onClick={() => setSelectedRole(role)}>{fixedRoleLabels[role]}</Button>)}</div>
            {renderPermissions(permissions.filter((p) => p.role === selectedRole), false)}
          </>
        ) : customRoles.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum cargo customizado. Crie cargos na aba "Cargos".</p>
        ) : (
          <>
            <div className="flex gap-2 flex-wrap">{customRoles.map((role) => <Button key={role.id} variant={selectedCustomRole === role.id ? "default" : "outline"} onClick={() => setSelectedCustomRole(role.id)}>{role.name}</Button>)}</div>
            {renderPermissions(customRolePermissions[selectedCustomRole] || [], true, selectedCustomRole)}
          </>
        )}
      </CardContent>
    </Card>
  );
};
