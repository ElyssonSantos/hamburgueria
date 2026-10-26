import { Instagram, Facebook, Truck } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useQuery } from "@tanstack/react-query";

type FooterBlock = Tables<'footer_blocks'>;

export const Footer = () => {
  const [socialConfig, setSocialConfig] = useState({
    whatsapp: "5511999999999",
    instagram: null as string | null,
    facebook: null as string | null,
    tiktok: null as string | null,
    delivery_url: null as string | null,
  });

  // Fetch footer blocks using React Query for better caching and real-time updates
  const { data: footerBlocks = [], isLoading: isLoadingBlocks } = useQuery<FooterBlock[]>({
    queryKey: ["footerBlocks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("footer_blocks")
        .select("*")
        .order("order_index");
      if (error) throw new Error(error.message);
      return data || [];
    },
  });

  useEffect(() => {
    fetchSocialConfig();
  }, []);

  const fetchSocialConfig = async () => {
    const { data } = await supabase
      .from("site_config")
      .select("whatsapp, instagram, facebook, tiktok, delivery_url")
      .limit(1)
      .single();

    if (data) setSocialConfig(data);
  };

  return (
    <footer className="bg-card border-t mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoadingBlocks ? (
            <div className="md:col-span-3 text-center text-muted-foreground">Carregando informações do rodapé...</div>
          ) : footerBlocks.length === 0 ? (
            <div className="md:col-span-3 text-center text-muted-foreground">Nenhuma informação de rodapé configurada.</div>
          ) : (
            footerBlocks.map((block) => (
              <div key={block.id} className="space-y-4">
                <h3 className="text-lg font-bold">{block.title}</h3>
                <div className="text-muted-foreground space-y-1 whitespace-pre-line">
                  {block.description}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <div className="flex gap-4 justify-center pb-4">
            {socialConfig.delivery_url && (
              <a
                href={socialConfig.delivery_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Delivery"
              >
                <Truck className="h-6 w-6" />
              </a>
            )}
            {socialConfig.instagram && (
              <a
                href={socialConfig.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
            )}
            {socialConfig.facebook && (
              <a
                href={socialConfig.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
            )}
            {socialConfig.tiktok && (
              <a
                href={socialConfig.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="TikTok"
              >
                <FaTiktok className="h-6 w-6" />
              </a>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 BigBig Burguer. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};