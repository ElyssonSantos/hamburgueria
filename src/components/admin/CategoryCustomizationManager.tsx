import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  nome: string;
  titulo_customizado: string | null;
  subtitulo_customizado: string | null;
  cor_fundo_1: string;
  cor_fundo_2: string;
  tipo_fundo: string;
  mostrar_banner: boolean;
}

export const CategoryCustomizationManager = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { logAction } = useAdminLog();

  const [tituloCustomizado, setTituloCustomizado] = useState("");
  const [subtituloCustomizado, setSubtituloCustomizado] = useState("");
  const [corFundo1, setCorFundo1] = useState("#f59e0b");
  const [corFundo2, setCorFundo2] = useState("#f97316");
  const [tipoFundo, setTipoFundo] = useState<string>("gradient");
  const [mostrarBanner, setMostrarBanner] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      const category = categories.find((c) => c.id === selectedCategory);
      if (category) {
        setTituloCustomizado(category.titulo_customizado || "");
        setSubtituloCustomizado(category.subtitulo_customizado || "");
        setCorFundo1(category.cor_fundo_1);
        setCorFundo2(category.cor_fundo_2);
        setTipoFundo(category.tipo_fundo);
        setMostrarBanner(category.mostrar_banner);
      }
    }
  }, [selectedCategory, categories]);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("nome");

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar categorias",
        description: error.message,
      });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory) {
      toast({
        variant: "destructive",
        title: "Selecione uma categoria",
        description: "Escolha uma categoria para personalizar.",
      });
      return;
    }

    const { error } = await supabase
      .from("categories")
      .update({
        titulo_customizado: tituloCustomizado || null,
        subtitulo_customizado: subtituloCustomizado || null,
        cor_fundo_1: corFundo1,
        cor_fundo_2: corFundo2,
        tipo_fundo: tipoFundo,
        mostrar_banner: mostrarBanner,
      })
      .eq("id", selectedCategory);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar personalização",
        description: error.message,
      });
    } else {
      const categoryName = categories.find((c) => c.id === selectedCategory)?.nome;
      await logAction(
        "Personalizou categoria",
        `Categoria: ${categoryName}, Título: ${tituloCustomizado || "padrão"}`
      );
      
      toast({
        title: "Personalização salva!",
        description: "As alterações foram aplicadas com sucesso.",
      });
      fetchCategories();
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
        <h2 className="text-2xl font-bold">Personalização Visual</h2>
        <p className="text-muted-foreground">
          Customize o estilo visual de cada categoria do cardápio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Categoria</CardTitle>
          <CardDescription>
            Selecione uma categoria e personalize seus títulos e cores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategory && (
              <>
                <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
                  <input
                    type="checkbox"
                    id="mostrarBanner"
                    checked={mostrarBanner}
                    onChange={(e) => setMostrarBanner(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="mostrarBanner" className="cursor-pointer">
                    Exibir banner nesta categoria
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo">Título Customizado (opcional)</Label>
                  <Input
                    id="titulo"
                    value={tituloCustomizado}
                    onChange={(e) => setTituloCustomizado(e.target.value)}
                    placeholder="Ex: Nossos Burgers Especiais"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitulo">Subtítulo Customizado (opcional)</Label>
                  <Input
                    id="subtitulo"
                    value={subtituloCustomizado}
                    onChange={(e) => setSubtituloCustomizado(e.target.value)}
                    placeholder="Ex: Feitos com ingredientes premium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipoFundo">Tipo de Fundo</Label>
                  <Select value={tipoFundo} onValueChange={setTipoFundo}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gradient">Gradiente</SelectItem>
                      <SelectItem value="solid">Cor Sólida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cor1">
                      {tipoFundo === "gradient" ? "Cor Inicial" : "Cor de Fundo"}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="cor1"
                        type="color"
                        value={corFundo1}
                        onChange={(e) => setCorFundo1(e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={corFundo1}
                        onChange={(e) => setCorFundo1(e.target.value)}
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>

                  {tipoFundo === "gradient" && (
                    <div className="space-y-2">
                      <Label htmlFor="cor2">Cor Final</Label>
                      <div className="flex gap-2">
                        <Input
                          id="cor2"
                          type="color"
                          value={corFundo2}
                          onChange={(e) => setCorFundo2(e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={corFundo2}
                          onChange={(e) => setCorFundo2(e.target.value)}
                          placeholder="#f97316"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div
                  className="w-full h-24 rounded-lg"
                  style={{
                    background:
                      tipoFundo === "gradient"
                        ? `linear-gradient(135deg, ${corFundo1}, ${corFundo2})`
                        : corFundo1,
                  }}
                />

                <Button type="submit" className="w-full">
                  Salvar Personalização
                </Button>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
