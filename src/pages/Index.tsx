import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { NotificationBanner } from "@/components/NotificationBanner";
import { FloatingCart } from "@/components/FloatingCart";
import { Gallery } from "@/components/Gallery";
import { IfoodButton } from "@/components/IfoodButton";
import { InstagramButton } from "@/components/InstagramButton";
import { ProductSearch } from "@/components/ProductSearch";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("destaque", { ascending: false });
    
    if (data) {
      setAllProducts(data);
    }
    setLoading(false);
  };

  const handleFilteredProducts = (filtered: any[]) => {
    setFilteredProducts(filtered);
    setIsSearching(filtered.length < allProducts.length || filtered.length === 0);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NotificationBanner />
      <main className="flex-1">
        <Hero />
        
        {/* Search Section */}
        <section className="container mx-auto px-4 pt-8 pb-4">
          <ProductSearch
            products={allProducts}
            onFilteredProducts={handleFilteredProducts}
          />
        </section>

        {/* Conditional Content */}
        {isSearching ? (
          <section className="container mx-auto px-4 pb-16">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
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
          </section>
        ) : (
          <CategorySection />
        )}

        <Gallery />
      </main>
      <Footer />
      <InstagramButton />
      <IfoodButton />
      <FloatingCart />
    </div>
  );
};

export default Index;
