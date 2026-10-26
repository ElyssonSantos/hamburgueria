import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit, Save, X, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface RolePermission {
  id: string;
  custom_role_id: string;
  resource: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

const availableResources = [
  { key: "products", label: "Produtos" },
  { key: "categories", label: "Categorias" },
  { key: "banners", label: "Banners" },
  { key: "notifications", label: "Notificações" },
  { key: "users", label: "Usuários" },
  { key: "logs", label: "Logs" },
  { key: "customization", label: "Personalização Visual" },
  { key: "config", label: "Configurações do Site" },
  { key: "permissions", label: "Gerenciar Permissões" },
  { key: "theme", label: "Personalização de Cores" },
  { key: "coupons", label: "Cupons" },
  { key: "gallery", label: "Galeria" },
  { key: "footer", label: "Rodapé" },
];

export const CustomRolesManager = () => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [permissions, setPermissions] = useState<{ [roleId: string]: RolePermission[] }>({});

  const { toast } = useToast();
  const { logAction } = useAdminLog();

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    const { data: rolesData } = await supabase
      .from("custom_roles")
      .select("*")
      .order("name");

    if (rolesData) {
      setRoles(rolesData);
      
      // Fetch permissions for all roles
      const { data: permData } = await supabase
        .from("custom_role_permissions")
        .select("*");

      if (permData) {
        const permsByRole: { [key: string]: RolePermission[] } = {};
        permData.forEach((perm) => {
          if (!permsByRole[perm.custom_role_id]) {
            permsByRole[perm.custom_role_id] = [];
          }
          permsByRole[perm.custom_role_id].push(perm);
        });
        setPermissions(permsByRole);
      }
    }
    setLoading(false);
  };

  const handleCreateRole = async () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O nome do cargo é obrigatório.",
      });
      return;
    }

    const { data, error } = await supabase
      .from("custom_roles")
      .insert({
        name: formData.name,
        description: formData.description || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao criar cargo",
        description: error.message,
      });
    } else {
      // Create default permissions for the new role
      const defaultPermissions = availableResources.map((resource) => ({
        custom_role_id: data.id,
        resource: resource.key,
        can_view: false,
        can_create: false,
        can_update: false,
        can_delete: false,
      }));

      await supabase.from("custom_role_permissions").insert(defaultPermissions);

      toast({
        title: "✅ Sucesso",
        description: "Cargo criado com sucesso.",
        className: "bg-green-500 text-white",
      });
      await logAction("Criou cargo customizado", `Nome: ${formData.name}`);
      setCreatingNew(false);
      setFormData({ name: "", description: "" });
      fetchRoles();
    }
  };

  const handleUpdateRole = async (roleId: string) => {
    const { error } = await supabase
      .from("custom_roles")
      .update({
        name: formData.name,
        description: formData.description || null,
      })
      .eq("id", roleId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar cargo",
        description: error.message,
      });
    } else {
      toast({
        title: "✅ Sucesso",
        description: "Cargo atualizado com sucesso.",
        className: "bg-green-500 text-white",
      });
      await logAction("Atualizou cargo customizado", `ID: ${roleId}`);
      setEditingRole(null);
      fetchRoles();
    }
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    const { error } = await supabase
      .from("custom_roles")
      .delete()
      .eq("id", roleToDelete);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir cargo",
        description: error.message,
      });
    } else {
      toast({
        title: "✅ Sucesso",
        description: "Cargo excluído com sucesso.",
        className: "bg-green-500 text-white",
      });
      await logAction("Excluiu cargo customizado", `ID: ${roleToDelete}`);
      setRoleToDelete(null);
      fetchRoles();
    }
  };


  const startEdit = (role: CustomRole) => {
    setEditingRole(role.id);
    setFormData({
      name: role.name,
      description: role.description || "",
    });
  };

  const cancelEdit = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "" });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Cargos Customizados</CardTitle>
          <CardDescription>
            Crie cargos personalizados e defina permissões específicas para cada um.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setCreatingNew(true)}
              disabled={creatingNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Novo Cargo
            </Button>
            <Button
              onClick={fetchRoles}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar Lista
            </Button>
          </div>

          {creatingNew && (
            <Card className="mb-6 border-primary">
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor="new-name">Nome do Cargo*</Label>
                  <Input
                    id="new-name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Atendente, Supervisor, Marketing"
                  />
                </div>
                <div>
                  <Label htmlFor="new-description">Descrição</Label>
                  <Textarea
                    id="new-description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Descrição opcional do cargo"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateRole}>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreatingNew(false);
                      setFormData({ name: "", description: "" });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {roles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum cargo customizado criado ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    {editingRole === role.id ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`edit-name-${role.id}`}>Nome do Cargo</Label>
                          <Input
                            id={`edit-name-${role.id}`}
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`edit-desc-${role.id}`}>Descrição</Label>
                          <Textarea
                            id={`edit-desc-${role.id}`}
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleUpdateRole(role.id)}>
                            <Save className="h-4 w-4 mr-2" />
                            Salvar
                          </Button>
                          <Button variant="outline" onClick={cancelEdit}>
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{role.name}</CardTitle>
                          {role.description && (
                            <CardDescription className="mt-1">
                              {role.description}
                            </CardDescription>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(role)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setRoleToDelete(role.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  {editingRole !== role.id && (
                    <CardContent>
                      <p className="text-muted-foreground text-sm">
                        As permissões deste cargo podem ser editadas na aba <strong>Permissões</strong>.
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={roleToDelete !== null}
        onOpenChange={() => setRoleToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cargo? Esta ação não pode ser
              desfeita e todos os usuários com este cargo perderão suas
              permissões.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRole}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
