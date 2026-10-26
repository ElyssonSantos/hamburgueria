import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAdminLog } from "@/hooks/useAdminLog";

interface Profile {
  id: string;
  nome: string;
  email: string; // Assuming email is available in profiles or can be fetched
  created_at: string; // Assuming created_at is available
}

interface UserRole {
  id: string;
  user_id: string;
  role: "dono" | "gerente" | "midias";
  custom_role_id?: string | null;
}

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
}

interface UserWithRole extends Profile {
  user_role?: UserRole;
  custom_role_name?: string;
}

export const UsersManager = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const { logAction } = useAdminLog();

  const isDono = hasRole("dono");

  useEffect(() => {
    fetchUsers();
    fetchCustomRoles();
  }, []);

  const fetchCustomRoles = async () => {
    const { data } = await supabase
      .from("custom_roles")
      .select("*")
      .order("name");
    
    if (data) {
      setCustomRoles(data);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch profiles (users)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, nome, created_at")
      .order("nome");

    if (profilesError) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar usuários",
        description: profilesError.message,
      });
      setLoading(false);
      return;
    }

    // Fetch user roles
    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("*, custom_roles(name)");

    if (rolesError) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar permissões",
        description: rolesError.message,
      });
    }

    // Fetch user emails from auth.users table (requires admin privileges or a function)
    // For now, we'll simulate or assume email is part of profile if available
    // In a real scenario, you'd need a Supabase Function to get emails of all users
    const { data: authUsersData, error: authUsersError } = await supabase.auth.admin.listUsers();

    if (authUsersError) {
      console.error("Error fetching auth users:", authUsersError.message);
      const usersWithRolesAndEmails = profiles.map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          email: "N/A",
          user_role: userRole,
          custom_role_name: (userRole as any)?.custom_roles?.name,
        };
      });
      setUsers(usersWithRolesAndEmails);
    } else {
      const usersWithRolesAndEmails = profiles.map((profile) => {
        const authUser = authUsersData?.users?.find((au: any) => au.id === profile.id);
        const userRole = roles?.find((r) => r.user_id === profile.id);
        return {
          ...profile,
          email: authUser?.email || "N/A",
          user_role: userRole,
          custom_role_name: (userRole as any)?.custom_roles?.name,
        };
      });
      setUsers(usersWithRolesAndEmails);
    }
    
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (newRole === "none") {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao remover permissão",
          description: error.message,
        });
        } else {
          await logAction("Removeu permissão de usuário", `Usuário ID: ${userId}`);
          toast({
            title: "✅ Sucesso!",
            description: "Permissão removida com sucesso",
            className: "bg-green-500 text-white",
          });
          fetchUsers();
        }
    } else {
      const existingRole = users.find((u) => u.id === userId)?.user_role;
      
      // Check if it's a custom role (UUID format) or standard role
      const isCustomRole = newRole.includes("-");
      const updateData = isCustomRole
        ? { role: null as any, custom_role_id: newRole }
        : { role: newRole as any, custom_role_id: null };

      if (existingRole) {
        const { error } = await supabase
          .from("user_roles")
          .update(updateData)
          .eq("user_id", userId);

        if (error) {
          toast({
            variant: "destructive",
            title: "Erro ao atualizar permissão",
            description: "Não foi possível aplicar o cargo selecionado. " + error.message,
          });
        } else {
          await logAction("Atualizou permissão de usuário", `Usuário ID: ${userId}, Novo Cargo: ${newRole}`);
          toast({
            title: "✅ Sucesso!",
            description: "Cargo atualizado com sucesso",
            className: "bg-green-500 text-white",
          });
          fetchUsers();
        }
      } else {
        const insertData: any = { user_id: userId };
        
        if (isCustomRole) {
          insertData.custom_role_id = newRole;
        } else {
          insertData.role = newRole;
        }

        const { error } = await supabase
          .from("user_roles")
          .insert(insertData);

        if (error) {
          toast({
            variant: "destructive",
            title: "Erro ao adicionar permissão",
            description: "Não foi possível aplicar o cargo selecionado. " + error.message,
          });
        } else {
          await logAction("Adicionou permissão a usuário", `Usuário ID: ${userId}, Cargo: ${newRole}`);
          toast({
            title: "✅ Sucesso!",
            description: "Cargo atribuído com sucesso",
            className: "bg-green-500 text-white",
          });
          fetchUsers();
        }
      }
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    // IMPORTANT: Deleting users from auth.users table requires a Supabase Function
    // or direct access to the Supabase Admin API from a secure backend.
    // Client-side `supabase.auth.admin.deleteUser` is not available.
    // For this implementation, we will simulate the deletion and inform the user.

    toast({
      variant: "destructive",
      title: "Ação restrita",
      description: "A exclusão de usuários (auth.users) deve ser feita através de uma Supabase Function ou API segura. Implementação frontend apenas para demonstração.",
      duration: 5000,
    });

    // Simulate deletion for UI update
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    await logAction("Tentativa de exclusão de usuário", `Usuário: ${userName} (ID: ${userId}) - Requer Supabase Function`);
    toast({
      title: "Usuário removido (simulado)",
      description: `O usuário ${userName} foi removido da lista. Para exclusão permanente, configure uma Supabase Function.`,
    });
  };

  const getRoleLabel = (user: UserWithRole) => {
    if (user.custom_role_name) {
      return user.custom_role_name;
    }
    
    switch (user.user_role?.role) {
      case "dono":
        return "Dono";
      case "gerente":
        return "Gerente";
      case "midias":
        return "Mídias Sociais";
      default:
        return "Sem permissão";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerenciar Usuários</h2>
        <p className="text-muted-foreground">
          Gerencie as permissões dos usuários do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  {user.nome}
                </div>
                {isDono && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza que deseja excluir este membro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso removerá o usuário "{user.nome}" e todas as suas permissões.
                          Para exclusão completa do sistema de autenticação, você precisará configurar uma Supabase Function.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteUser(user.id, user.nome)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardTitle>
              <CardDescription>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground">Registrado em: {format(new Date(user.created_at), "dd/MM/yyyy", { locale: ptBR })}</p>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cargo</label>
                <Select
                  value={user.user_role?.custom_role_id || user.user_role?.role || "none"}
                  onValueChange={(value) => handleRoleChange(user.id, value)}
                  disabled={!isDono && user.user_role?.role === "dono"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem permissão</SelectItem>
                    {isDono && <SelectItem value="dono">Dono</SelectItem>}
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="midias">Mídias Sociais</SelectItem>
                    {customRoles.length > 0 && (
                      <>
                        <SelectItem value="divider" disabled>
                          ──────────
                        </SelectItem>
                        {customRoles.map((customRole) => (
                          <SelectItem key={customRole.id} value={customRole.id}>
                            {customRole.name}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Cargo atual: {getRoleLabel(user)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};