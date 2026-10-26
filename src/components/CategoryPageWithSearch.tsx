import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Hero } from "./Hero";
import { ProductCard } from "./ProductCard";
import { Loader2 } from "lucide-react";
import { ProductSearch } from "./ProductSearch";

interface CategoryPageWithSearchProps {
  categoryId: string;
  categoryName: string;
}

export const CategoryPageWithSearch = ({ categoryId, categoryName }: CategoryPageWithSearchProps) => {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchCategoryBannerSetting();
  }, [categoryId]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("categoria_id", categoryId)
      .order("destaque", { ascending: false });

    if (data) {
      setProducts(data);
      setFilteredProducts(data);
    }
    setLoading(false);
  };

  const fetchCategoryBannerSetting = async () => {
    const { data } = await supabase
      .from("categories")
      .select("mostrar_banner")
      .eq("id", categoryId)
      .single();

    if (data) {
      setShowBanner(data.mostrar_banner ?? true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {showBanner && <Hero />}
      
      <section className="py-16 px-4 bg-background">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            {categoryName}
          </h1>
          
          <ProductSearch
            products={products}
            onFilteredProducts={setFilteredProducts}
          />

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-xl">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.nome}
                  description={product.descricao}
                  ingredients={product.ingredientes}
                  price={product.preco}
                  image={product.imagem_url}
                  promotion={{
                    active: product.promocao_ativa,
                    percentage: product.promocao_percentual,
                  }}
                  featured={product.destaque}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};