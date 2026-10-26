import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Notification {
  id: string;
  mensagem: string;
  ativo: boolean;
  ordem: number;
}

export const NotificationsManager = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const { toast } = useToast();

  const [mensagem, setMensagem] = useState("");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("notifications").select("*").order("ordem");
    if (!error && data) setNotifications(data);
    setLoading(false);
  };

  const resetForm = () => {
    setMensagem("");
    setAtivo(true);
    setEditingNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { mensagem, ativo, ordem: editingNotification?.ordem ?? notifications.length };

    if (editingNotification) {
      await supabase.from("notifications").update(data).eq("id", editingNotification.id);
    } else {
      await supabase.from("notifications").insert(data);
    }

    toast({ title: editingNotification ? "Atualizado!" : "Criado!" });
    setDialogOpen(false);
    resetForm();
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir notificação?")) return;
    await supabase.from("notifications").delete().eq("id", id);
    toast({ title: "Excluído" });
    fetchNotifications();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Notificações</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Nova</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingNotification ? "Editar" : "Nova"} Notificação</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Input value={mensagem} onChange={(e) => setMensagem(e.target.value)} required />
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={ativo} onCheckedChange={setAtivo} />
                <Label>Ativa</Label>
              </div>
              <DialogFooter><Button type="submit">Salvar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-4">
        {notifications.map((n) => (
          <Card key={n.id}>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>{n.mensagem}</span>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => { setEditingNotification(n); setMensagem(n.mensagem); setAtivo(n.ativo); setDialogOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(n.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
