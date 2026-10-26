import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Bell, Upload, X } from "lucide-react";
import { criarNotificacaoInterna } from "@/utils/internalNotifications";
import { useAuth } from "@/hooks/useAuth";

interface NotificationHistory {
  id: string;
  title: string;
  body: string;
  image_url?: string;
  sent_at: string;
  sent_by: string;
}

export const InternalNotificationsManager = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<NotificationHistory[]>([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [duration, setDuration] = useState(4);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data } = await supabase
      .from("push_notifications_history")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(50);

    if (data) {
      setHistory(data);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `notifications/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      return null;
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast({
        title: "Erro",
        description: "Preencha título e mensagem",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }

      // Salvar no histórico
      await supabase.from("push_notifications_history").insert({
        title,
        body: message,
        image_url: imageUrl || null,
        target: "all",
        sent_by: user?.email || "admin",
        duration_ms: duration * 1000,
      });

      // Não chamar criarNotificacaoInterna aqui - o realtime vai disparar para todos

      toast({
        title: "Notificação enviada!",
        description: "A notificação foi exibida com sucesso.",
      });

      // Limpar formulário
      setTitle("");
      setMessage("");
      setImageFile(null);
      setImagePreview("");
      setDuration(4);
      fetchHistory();
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações Internas
          </CardTitle>
          <CardDescription>
            Envie notificações visuais que aparecem para quem está com o site aberto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ex: Nova promoção!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Descrição</Label>
            <Textarea
              id="message"
              placeholder="Ex: Confira nossos novos produtos..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Tempo de exibição (segundos)</Label>
            <Input
              id="duration"
              type="number"
              min={1}
              max={60}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              placeholder="4"
            />
            <p className="text-sm text-muted-foreground">
              Tempo que a notificação ficará visível na tela (1-60 segundos)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Ícone/Imagem (opcional)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSendNotification}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Enviar Notificação
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>
            Últimas notificações enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma notificação enviada ainda
              </p>
            ) : (
              history.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  {notif.image_url ? (
                    <img
                      src={notif.image_url}
                      alt="notification"
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                      🔔
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold">{notif.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {notif.body}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {new Date(notif.sent_at).toLocaleString("pt-BR")}
                      </span>
                      <span>Por: {notif.sent_by}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
