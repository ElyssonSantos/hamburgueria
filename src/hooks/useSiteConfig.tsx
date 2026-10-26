import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SiteConfig {
  whatsapp: string;
  texto_principal_home: string;
}

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>({ 
    whatsapp: "5511999999999",
    texto_principal_home: "Os melhores hambúrgueres gourmet, pizzas artesanais e muito mais!"
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("site_config")
      .select("whatsapp, texto_principal_home")
      .limit(1)
      .single();

    if (data) setConfig(data);
  };

  return config;
};