import { Header } from "./Header";
import { Footer } from "./Footer";
import { ProductCard } from "./ProductCard";
import { NotificationBanner } from "./NotificationBanner";
import { FloatingCart } from "./FloatingCart";
import { InstagramButton } from "./InstagramButton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Banner {
  id: string;
  tipo: string;
  media_url: string;
  mensagem: string | null;
  ordem: number;
  ativo: boolean;
}

interface Product {
  id: string;
  nome: string;
  descricao: string;
  ingredientes: string[];
  preco: number;
  imagem_url: string;
  promocao_ativa: boolean;
  promocao_percentual: number | null;
  destaque: boolean;
  categoria_id: string;
}

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

interface CategoryPageProps {
  categoryName: string;
  icon: string;
  title: string;
  subtitle: string;
}

export const CategoryPage = ({ categoryName, icon, title, subtitle }: CategoryPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [rotationTime, setRotationTime] = useState(15);
  const [whatsapp, setWhatsapp] = useState("5511999999999");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchBannersAndConfig();
  }, [categoryName]);

  const fetchProducts = async () => {
    const { data: categoryData } = await supabase
      .from("categories")
      .select("*")
      .ilike("nome", categoryName)
      .single();

    if (categoryData) {
      setCategory(categoryData);
      const { data: productsData } = await supabase
        .from("products")
        .select("*")
        .eq("categoria_id", categoryData.id)
        .order("nome");

      if (productsData) setProducts(productsData);
    }
    setLoading(false);
  };

  const fetchBannersAndConfig = async () => {
    const { data: bannersData } = await supabase
      .from("banners")
      .select("*")
      .eq("ativo", true)
      .order("ordem");

    const { data: configData } = await supabase
      .from("site_config")
      .select("tempo_rotacao_banner, whatsapp")
      .limit(1)
      .single();

    if (bannersData && bannersData.length > 0) {
      setBanners(bannersData);
    }

    if (configData) {
      setRotationTime(configData.tempo_rotacao_banner);
      setWhatsapp(configData.whatsapp);
    }
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, rotationTime * 1000);
    return () => clearInterval(interval);
  }, [banners.length, rotationTime]);

  const currentBanner = banners[currentBannerIndex];

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWhatsApp = () => {
    const message = `Olá! Gostaria de fazer um pedido`;
    const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  if (loading || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <NotificationBanner />
      <main className="flex-1">
        {/* Banner Hero Section - Apenas se mostrar_banner for true */}
        {category.mostrar_banner && (
          <section
            className="relative min-h-[60vh] flex items-center justify-center overflow-hidden"
            style={{
              background:
                category.tipo_fundo === "gradient"
                  ? `linear-gradient(135deg, ${category.cor_fundo_1}, ${category.cor_fundo_2})`
                  : category.cor_fundo_1,
            }}
          >
            <div className="absolute inset-0">
              {currentBanner && (
                <>
                  {currentBanner.tipo === "video" ? (
                    <video
                      key={currentBanner.media_url}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-cover opacity-30"
                    >
                      <source src={currentBanner.media_url} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={currentBanner.media_url}
                      alt="Banner"
                      className="w-full h-full object-cover opacity-30"
                    />
                  )}
                </>
              )}
            </div>

            <div className="container mx-auto px-4 relative z-10 text-center">
              <div className="animate-fade-in-up space-y-6">
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg text-white">
                  {category.titulo_customizado || `${icon} ${categoryName}`}
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-white font-medium drop-shadow-md">
                  {category.subtitulo_customizado ||
                    (currentBanner?.mensagem || `Conheça nossos deliciosos ${categoryName.toLowerCase()}`)}
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="container mx-auto px-4 py-16">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted-foreground text-lg">
              Nenhum produto cadastrado nesta categoria ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  name={product.nome}
                  description={product.descricao}
                  ingredients={product.ingredientes}
                  price={Number(product.preco)}
                  image={product.imagem_url}
                  promotion={
                    product.promocao_ativa && product.promocao_percentual
                      ? { active: true, percentage: product.promocao_percentual }
                      : undefined
                  }
                  featured={product.destaque}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <FloatingCart />
      <InstagramButton />
    </div>
  );
};
