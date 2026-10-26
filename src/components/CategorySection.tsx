import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Category {
  id: string;
  nome: string;
  slug: string;
  icon: string;
}

export const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, nome, slug, icon")
      .order("nome");
    if (data) setCategories(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </section>
    );
  }

  return (
    <section id="categorias" className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold mb-4">Nosso Cardápio</h2>
        <p className="text-lg text-muted-foreground">
          Explore nossas deliciosas categorias
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const route = `/categoria/${category.slug}`;
          return (
            <Link key={category.id} to={route}>
              <Card className="p-8 hover:shadow-[var(--hover-shadow)] transition-all duration-300 group cursor-pointer h-full">
                <div className="text-center space-y-4">
                  <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold">{category.nome}</h3>
                  <div className="flex items-center justify-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                    Ver produtos
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
