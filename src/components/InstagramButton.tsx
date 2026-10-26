import { Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const InstagramButton = () => {
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data } = await supabase
      .from("site_config")
      .select("instagram")
      .limit(1)
      .single();

    if (data?.instagram) setInstagramUrl(data.instagram);
  };

  return (
    <a
      href={instagramUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-40 group"
      aria-label="Instagram"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] rounded-full animate-pulse blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
        <div className="relative bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] p-4 rounded-full shadow-2xl hover:scale-110 transition-transform">
          <Instagram className="h-6 w-6 text-white" />
        </div>
      </div>
    </a>
  );
};