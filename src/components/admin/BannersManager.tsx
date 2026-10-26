import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Banner {
  id: string;
  media_url: string;
  tipo: "imagem" | "video";
  mensagem: string | null;
  ordem: number;
  ativo: boolean;
}

export const BannersManager = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const { toast } = useToast();

  const [mediaUrl, setMediaUrl] = useState("");
  const [tipo, setTipo] = useState<"imagem" | "video">("imagem");
  const [mensagem, setMensagem] = useState("");
  const [ativo, setAtivo] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("ordem");

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar banners",
        description: error.message,
      });
    } else {
      setBanners((data || []) as Banner[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setMediaUrl("");
    setTipo("imagem");
    setMensagem("");
    setAtivo(true);
    setEditingBanner(null);
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    setMediaUrl(banner.media_url);
    setTipo(banner.tipo);
    setMensagem(banner.mensagem || "");
    setAtivo(banner.ativo);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bannerData = {
      media_url: mediaUrl,
      tipo,
      mensagem: mensagem || null,
      ativo,
      ordem: editingBanner ? editingBanner.ordem : banners.length,
    };

    if (editingBanner) {
      const { error } = await supabase
        .from("banners")
        .update(bannerData)
        .eq("id", editingBanner.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar banner",
          description: error.message,
        });
      } else {
        toast({
          title: "Banner atualizado!",
        });
        setDialogOpen(false);
        resetForm();
        fetchBanners();
      }
    } else {
      const { error } = await supabase.from("banners").insert(bannerData);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar banner",
          description: error.message,
        });
      } else {
        toast({
          title: "Banner criado!",
        });
        setDialogOpen(false);
        resetForm();
        fetchBanners();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este banner?")) return;

    const { error } = await supabase.from("banners").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir banner",
        description: error.message,
      });
    } else {
      toast({
        title: "Banner excluído",
      });
      fetchBanners();
    }
  };

  const moveOrder = async (id: string, direction: "up" | "down") => {
    const currentIndex = banners.findIndex((b) => b.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === banners.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updates = [
      supabase
        .from("banners")
        .update({ ordem: newIndex })
        .eq("id", banners[currentIndex].id),
      supabase
        .from("banners")
        .update({ ordem: currentIndex })
        .eq("id", banners[newIndex].id),
    ];

    await Promise.all(updates);
    fetchBanners();
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Banners</h2>
          <p className="text-muted-foreground">Configure os banners rotativos do site</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBanner ? "Editar Banner" : "Novo Banner"}
              </DialogTitle>
              <DialogDescription>
                Configure o conteúdo do banner
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select value={tipo} onValueChange={(v: any) => setTipo(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imagem">Imagem</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediaUrl">URL da Mídia *</Label>
                <Input
                  id="mediaUrl"
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem (opcional)</Label>
                <Textarea
                  id="mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Mensagem promocional"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
                <Label htmlFor="ativo">Banner Ativo</Label>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">
                  {editingBanner ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {banners.map((banner, index) => (
          <Card key={banner.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Banner #{index + 1}</span>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveOrder(banner.id, "up")}
                    disabled={index === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => moveOrder(banner.id, "down")}
                    disabled={index === banners.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => openEditDialog(banner)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(banner.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {banner.tipo} • {banner.ativo ? "Ativo" : "Inativo"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {banner.tipo === "imagem" ? (
                <img
                  src={banner.media_url}
                  alt="Banner"
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">Vídeo: {banner.media_url}</span>
                </div>
              )}
              {banner.mensagem && (
                <p className="mt-2 text-sm text-muted-foreground">{banner.mensagem}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
