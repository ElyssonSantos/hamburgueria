import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Loader2, Upload } from "lucide-react";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  order_index: number;
}

export const GalleryManager = () => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const { logAction } = useAdminLog();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data } = await supabase.from("gallery_images").select("*").order("order_index");
    if (data) setImages(data);
    setLoading(false);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setImageFile(null);
    setImageUrl("");
    setMediaType("image");
    setEditingImage(null);
  };

  const handleEdit = (image: GalleryImage) => {
    setEditingImage(image);
    setTitle(image.title || "");
    setDescription(image.description || "");
    setImageUrl(image.image_url);
    setMediaType((image as any).media_type || "image");
    setDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Detect media type
      if (file.type.startsWith("video/")) {
        setMediaType("video");
      } else {
        setMediaType("image");
      }
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    // Validate file size
    const isVideo = file.type.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024; // 50MB for video, 10MB for image

    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: `O arquivo excede o tamanho máximo permitido de ${isVideo ? "50MB" : "10MB"}.`,
      });
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("gallery-images")
      .upload(filePath, file);

    if (uploadError) {
      toast({ variant: "destructive", title: "Erro ao fazer upload", description: uploadError.message });
      return null;
    }

    const { data } = supabase.storage.from("gallery-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let finalImageUrl = imageUrl;

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        setUploading(false);
        return;
      }
      finalImageUrl = uploadedUrl;
    }

    if (!finalImageUrl && !editingImage) {
      toast({ variant: "destructive", title: "Erro", description: "Forneça uma imagem" });
      setUploading(false);
      return;
    }

    if (editingImage) {
      const { error } = await supabase.from("gallery_images").update({
        image_url: finalImageUrl || editingImage.image_url,
        title: title || null,
        description: description || null,
        media_type: mediaType,
      }).eq("id", editingImage.id);

      setUploading(false);

      if (error) {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      } else {
        await logAction("Editou imagem da galeria", title || "");
        toast({ title: "Imagem atualizada!" });
        setDialogOpen(false);
        resetForm();
        fetchImages();
      }
    } else {
      const { error } = await supabase.from("gallery_images").insert({
        image_url: finalImageUrl,
        title: title || null,
        description: description || null,
        media_type: mediaType,
        order_index: images.length,
      });

      setUploading(false);

      if (error) {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      } else {
        await logAction("Adicionou imagem à galeria", title || "");
        toast({ title: "Imagem adicionada!" });
        setDialogOpen(false);
        resetForm();
        fetchImages();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta imagem?")) return;
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      await logAction("Excluiu imagem da galeria", "");
      toast({ title: "Imagem excluída" });
      fetchImages();
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Galeria de Fotos</h2>
          <p className="text-muted-foreground">Gerencie as imagens da seção "Conheça Nosso Espaço"</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Mídia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingImage ? "Editar Foto da Galeria" : "Nova Foto da Galeria"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Título (opcional)</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ambiente interno" />
              </div>
              <div className="space-y-2">
                <Label>Descrição (opcional)</Label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Nosso espaço aconchegante" />
              </div>
              <div className="space-y-2">
                <Label>Upload de Mídia</Label>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  Imagens (JPG, PNG, WEBP até 10MB) ou Vídeos (MP4, WEBM, MOV até 50MB)
                </p>
              </div>
              <div className="space-y-2">
                <Label>URL da Mídia (alternativo)</Label>
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <Button type="submit" disabled={uploading} className="w-full bg-gradient-to-r from-primary to-secondary">
                {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</> : editingImage ? "Salvar Alterações" : "Adicionar à Galeria"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="text-sm">{image.title || "Sem título"}</span>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(image)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(image.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {(image as any).media_type === "video" ? (
                  <>
                    <video src={image.image_url} className="w-full h-48 object-cover rounded-lg" />
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold">
                      Vídeo
                    </div>
                  </>
                ) : (
                  <>
                    <img src={image.image_url} alt={image.title || ""} className="w-full h-48 object-cover rounded-lg" />
                    <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground px-2 py-1 rounded text-xs font-bold">
                      Imagem
                    </div>
                  </>
                )}
              </div>
              {image.description && <p className="text-xs text-muted-foreground mt-2">{image.description}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};