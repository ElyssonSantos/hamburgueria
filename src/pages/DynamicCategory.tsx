import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { InstagramButton } from "@/components/InstagramButton";
import { IfoodButton } from "@/components/IfoodButton";
import { FloatingCart } from "@/components/FloatingCart";
import { NotificationBanner } from "@/components/NotificationBanner";
import { CategoryPageWithSearch } from "@/components/CategoryPageWithSearch";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  nome: string;
  slug: string;
  icon: string | null;
}

export default function DynamicCategory() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  const fetchCategory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("id, nome, slug, icon")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      setNotFound(true);
    } else {
      setCategory(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !category) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <NotificationBanner />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {category.icon && <span className="mr-4">{category.icon}</span>}
            {category.nome}
          </h1>
        </div>
        <CategoryPageWithSearch 
          categoryId={category.id}
          categoryName={category.nome}
        />
      </main>
      <Footer />
      <InstagramButton />
      <IfoodButton />
      <FloatingCart />
    </div>
  );
}
