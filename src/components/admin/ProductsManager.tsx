import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, ImageOff, X, Search } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Product {
  id: string;
  nome: string;
  categoria_id: string;
  preco: number;
  descricao: string;
  ingredientes: string[];
  imagem_url: string;
  promocao_ativa: boolean;
  promocao_percentual: number;
  destaque: boolean;
}

interface Category {
  id: string;
  nome: string;
}

export const ProductsManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { hasRole } = useAuth();
  const { toast } = useToast();
  const { logAction } = useAdminLog();

  // Form state
  const [nome, setNome] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [preco, setPreco] = useState("");
  const [descricao, setDescricao] = useState("");
  const [ingredientes, setIngredientes] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(""); // To store the existing image URL
  const [promocaoAtiva, setPromocaoAtiva] = useState(false);
  const [promocaoPercentual, setPromocaoPercentual] = useState("");
  const [destaque, setDestaque] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const canEdit = hasRole("dono") || hasRole("gerente");
  const canEditImages = hasRole("dono") || hasRole("gerente") || hasRole("midias");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      return;
    }

    const normalizedSearch = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const filtered = products.filter((product) => {
      const normalizedName = product.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return normalizedName.includes(normalizedSearch);
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("nome");

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar produtos",
        description: error.message,
      });
    } else {
      setProducts(data || []);
      setFilteredProducts(data || []);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("nome");

    if (!error && data) {
      setCategories(data);
    }
  };

  const resetForm = () => {
    setNome("");
    setCategoriaId("");
    setPreco("");
    setDescricao("");
    setIngredientes("");
    setImageFile(null);
    setImagePreviewUrl(null);
    setCurrentImageUrl("");
    setPromocaoAtiva(false);
    setPromocaoPercentual("");
    setDestaque(false);
    setEditingProduct(null);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setNome(product.nome);
    setCategoriaId(product.categoria_id);
    setPreco(product.preco.toString());
    setDescricao(product.descricao);
    setIngredientes(product.ingredientes.join(", "));
    setCurrentImageUrl(product.imagem_url); // Set current image URL
    setImagePreviewUrl(product.imagem_url); // Show current image as preview
    setImageFile(null); // Clear any pending file upload
    setPromocaoAtiva(product.promocao_ativa);
    setPromocaoPercentual(product.promocao_percentual.toString());
    setDestaque(product.destaque);
    setDialogOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file)); // Create a preview URL
    } else {
      setImageFile(null);
      setImagePreviewUrl(currentImageUrl || null); // Revert to current image or null
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    // This function now only handles the actual upload and returns the URL or null.
    // The `uploadingImage` state for the button is managed by handleSubmit.
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images") // Ensure you have a bucket named 'product-images' in Supabase Storage
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      toast({ variant: "destructive", title: "Erro ao fazer upload", description: uploadError.message });
      return null;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingImage(true); // Start loading for the entire submission process

    let finalImageUrl = currentImageUrl;

    if (imageFile) {
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        setUploadingImage(false); // Stop loading if image upload failed
        return; // Exit early
      }
      finalImageUrl = uploadedUrl;
    } else if (!finalImageUrl) { // If no new file and no existing URL (could be new product or existing product with removed image)
      toast({ variant: "destructive", title: "Imagem obrigatória", description: "Por favor, faça upload de uma imagem ou forneça uma URL." });
      setUploadingImage(false); // Stop loading
      return; // Exit early
    }

    const productData = {
      nome,
      categoria_id: categoriaId,
      preco: parseFloat(preco),
      descricao,
      ingredientes: ingredientes.split(",").map((i) => i.trim()),
      imagem_url: finalImageUrl, // Use the uploaded or existing image URL
      promocao_ativa: promocaoAtiva,
      promocao_percentual: promocaoAtiva ? parseInt(promocaoPercentual) : 0,
      destaque,
    };

    let error;
    if (editingProduct) {
      ({ error } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id));
    } else {
      ({ error } = await supabase.from("products").insert(productData));
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar produto",
        description: error.message,
      });
      // Keep dialog open on error to allow user to fix
    } else {
      await logAction(editingProduct ? "Atualizou produto" : "Criou produto", `Produto: ${nome}`);
      toast({
        title: editingProduct ? "Produto atualizado!" : "Produto criado!",
        description: editingProduct ? "As alterações foram salvas com sucesso." : "O produto foi adicionado ao cardápio.",
      });
      setDialogOpen(false); // Close dialog on success
      resetForm();
      fetchProducts();
    }
    setUploadingImage(false); // Ensure loading is off in all paths before exiting
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;

    const product = products.find((p) => p.id === id);
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: error.message,
      });
    } else {
      await logAction("Excluiu produto", `Produto: ${product?.nome || "desconhecido"}`);
      toast({
        title: "Produto excluído",
        description: "O produto foi removido do cardápio.",
      });
      fetchProducts();
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
          <p className="text-muted-foreground">
            {canEdit
              ? "Adicione, edite ou remova produtos do cardápio"
              : canEditImages
              ? "Edite imagens e promoções dos produtos"
              : "Visualize os produtos do cardápio"}
          </p>
        </div>
        {canEdit && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? "Editar Produto" : "Novo Produto"}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do produto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria *</Label>
                    <Select value={categoriaId} onValueChange={setCategoriaId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ingredientes">Ingredientes (separados por vírgula) *</Label>
                  <Textarea
                    id="ingredientes"
                    value={ingredientes}
                    onChange={(e) => setIngredientes(e.target.value)}
                    placeholder="Pão, Hambúrguer, Queijo, Alface"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$) *</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      min="0"
                      value={preco}
                      onChange={(e) => setPreco(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imagem">Imagem do Produto *</Label>
                    <Input
                      id="imagem"
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleImageFileChange}
                      disabled={uploadingImage}
                    />
                    {imagePreviewUrl && (
                      <div className="mt-2 relative w-32 h-32 rounded-md overflow-hidden border">
                        <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreviewUrl(null);
                            setCurrentImageUrl("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {uploadingImage && <Loader2 className="h-4 w-4 animate-spin mt-2" />}
                    {!imagePreviewUrl && !imageFile && !currentImageUrl && (
                      <p className="text-sm text-muted-foreground">Nenhuma imagem selecionada.</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="promocao"
                      checked={promocaoAtiva}
                      onCheckedChange={setPromocaoAtiva}
                    />
                    <Label htmlFor="promocao">Em Promoção</Label>
                  </div>
                  {promocaoAtiva && (
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="percentual">Desconto (%)</Label>
                      <Input
                        id="percentual"
                        type="number"
                        min="0"
                        max="100"
                        value={promocaoPercentual}
                        onChange={(e) => setPromocaoPercentual(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="destaque"
                    checked={destaque}
                    onCheckedChange={setDestaque}
                  />
                  <Label htmlFor="destaque">Produto em Destaque</Label>
                </div>

                <DialogFooter>
                  <Button type="submit" className="bg-gradient-to-r from-primary to-secondary" disabled={uploadingImage}>
                    {uploadingImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando Imagem...
                      </>
                    ) : editingProduct ? (
                      "Salvar Alterações"
                    ) : (
                      "Criar Produto"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {canEdit && (
        <div className="relative max-w-xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar produto por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <p className="text-sm text-muted-foreground mt-2">
              {filteredProducts.length} {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </p>
          )}
        </div>
      )}

      {filteredProducts.length === 0 && searchTerm ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-xl">Nenhum produto encontrado com "{searchTerm}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{product.nome}</span>
                <div className="flex gap-2">
                  {canEditImages && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canEdit && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                R$ {product.preco.toFixed(2)}
                {product.promocao_ativa && (
                  <span className="ml-2 text-secondary font-bold">
                    -{product.promocao_percentual}%
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {product.imagem_url ? (
                <img
                  src={product.imagem_url}
                  alt={product.nome}
                  className="w-full h-40 object-cover rounded-lg mb-2"
                />
              ) : (
                <div className="w-full h-40 bg-muted rounded-lg mb-2 flex items-center justify-center text-muted-foreground">
                  <ImageOff className="h-8 w-8" />
                </div>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {product.descricao}
              </p>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
};