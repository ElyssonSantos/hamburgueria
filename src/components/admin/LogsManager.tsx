import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AdminLog {
  id: string;
  user_email: string;
  user_role: string;
  action: string;
  details: string | null;
  created_at: string;
}

export const LogsManager = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar logs",
        description: error.message,
      });
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string, createdAt: string) => {
    const logDate = new Date(createdAt);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (logDate < sevenDaysAgo) {
      toast({
        variant: "destructive",
        title: "Não é possível excluir",
        description: "Apenas logs dos últimos 7 dias podem ser excluídos.",
      });
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este log?")) return;

    const { error } = await supabase.from("admin_logs").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir log",
        description: error.message,
      });
    } else {
      toast({
        title: "Log excluído",
        description: "O registro foi removido com sucesso.",
      });
      fetchLogs();
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
        <h2 className="text-2xl font-bold">Logs de Atividades</h2>
        <p className="text-muted-foreground">
          Histórico de todas as ações administrativas realizadas no sistema
        </p>
      </div>

      <div className="space-y-3">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Nenhum log encontrado</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base font-semibold">
                      {log.action}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      <span className="font-medium">{log.user_email}</span>
                      {" • "}
                      <span className="capitalize">{log.user_role}</span>
                      {" • "}
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </CardDescription>
                  </div>
                  {hasRole("dono") && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(log.id, log.created_at)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              {log.details && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
