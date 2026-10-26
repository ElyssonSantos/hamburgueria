import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useFavicon = () => {
  useEffect(() => {
    const loadFavicon = async () => {
      const { data } = await supabase
        .from("site_config")
        .select("favicon_url")
        .limit(1)
        .maybeSingle();

      if (data?.favicon_url) {
        const faviconLink = document.getElementById("dynamic-favicon") as HTMLLinkElement;
        if (faviconLink) {
          faviconLink.href = data.favicon_url;
        }
      }
    };

    loadFavicon();
  }, []);
};