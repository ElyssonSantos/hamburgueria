import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type FooterBlock = Tables<'footer_blocks'>;

export const FooterManager = () => {
  const [blocks, setBlocks] = useState<FooterBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<FooterBlock | null>(null);
  const { toast } = useToast();
  const { logAction } = useAdminLog();

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("footer_blocks")
      .select("*")
      .order("order_index");

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar blocos do rodapé",
        description: error.message,
      });
    } else {
      setBlocks((data || []) as FooterBlock[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setTitulo("");
    setDescricao("");
    setEditingBlock(null);
  };

  const openEditDialog = (block: FooterBlock) => {
    setEditingBlock(block);
    setTitulo(block.title);
    setDescricao(block.description);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const blockData = {
      title: titulo,
      description: descricao,
      order_index: editingBlock ? editingBlock.order_index : blocks.length,
    };

    if (editingBlock) {
      const { error } = await supabase
        .from("footer_blocks")
        .update(blockData)
        .eq("id", editingBlock.id);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar bloco",
          description: error.message,
        });
      } else {
        await logAction("Atualizou bloco do rodapé", `Título: ${titulo}`);
        toast({
          title: "Bloco atualizado!",
        });
        setDialogOpen(false);
        resetForm();
        fetchBlocks();
      }
    } else {
      const { error } = await supabase.from("footer_blocks").insert(blockData);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro ao criar bloco",
          description: error.message,
        });
      } else {
        await logAction("Criou bloco do rodapé", `Título: ${titulo}`);
        toast({
          title: "Bloco criado!",
        });
        setDialogOpen(false);
        resetForm();
        fetchBlocks();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este bloco?")) return;

    const { error } = await supabase.from("footer_blocks").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir bloco",
        description: error.message,
      });
    } else {
      await logAction("Excluiu bloco do rodapé", "");
      toast({
        title: "Bloco excluído",
      });
      fetchBlocks();
    }
  };

  const moveOrder = async (id: string, direction: "up" | "down") => {
    const currentIndex = blocks.findIndex((b) => b.id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === blocks.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updates = [
      supabase
        .from("footer_blocks")
        .update({ order_index: newIndex })
        .eq("id", blocks[currentIndex].id),
      supabase
        .from("footer_blocks")
        .update({ order_index: currentIndex })
        .eq("id", blocks[newIndex].id),
    ];

    await Promise.all(updates);
    await logAction("Reordenou blocos do rodapé", `Moveu bloco ${blocks[currentIndex].title} ${direction}`);
    fetchBlocks();
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
          <h2 className="text-2xl font-bold">Gerenciar Blocos do Rodapé</h2>
          <p className="text-muted-foreground">
            Crie e organize as informações exibidas no rodapé do site
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Bloco
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBlock ? "Editar Bloco" : "Novo Bloco"}
              </DialogTitle>
              <DialogDescription>
                Defina o título e a descrição do bloco
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Texto livre ou multilinha"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">
                  {editingBlock ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.length === 0 ? (
          <Card className="md:col-span-3">
            <CardContent className="py-12 text-center text-muted-foreground">
              Nenhum bloco de rodapé cadastrado ainda.
            </CardContent>
          </Card>
        ) : (
          blocks.map((block, index) => (
            <Card key={block.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{block.title}</span>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveOrder(block.id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => moveOrder(block.id, "down")}
                      disabled={index === blocks.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(block)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(block.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{block.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};