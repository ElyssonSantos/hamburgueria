import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
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
export const Hero = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [rotationTime, setRotationTime] = useState(15);
  const [whatsapp, setWhatsapp] = useState("5511999999999");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [mostrarLogoBanner, setMostrarLogoBanner] = useState(true);
  const [textoPrincipalHome, setTextoPrincipalHome] = useState("Os melhores hambúrgueres gourmet, pizzas artesanais e muito mais!");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const {
      data: bannersData
    } = await supabase.from("banners").select("*").eq("ativo", true).order("ordem");
    const {
      data: configData
    } = await supabase.from("site_config").select("tempo_rotacao_banner, whatsapp, logo_url, mostrar_logo_banner, texto_principal_home").limit(1).single();
    if (bannersData && bannersData.length > 0) {
      setBanners(bannersData);
    }
    if (configData) {
      setRotationTime(configData.tempo_rotacao_banner);
      setWhatsapp(configData.whatsapp);
      setLogoUrl(configData.logo_url);
      setMostrarLogoBanner(configData.mostrar_logo_banner ?? true);
      setTextoPrincipalHome(configData.texto_principal_home || "Os melhores hambúrgueres gourmet, pizzas artesanais e muito mais!");
    }
    setLoading(false);
  };
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, rotationTime * 1000);
    return () => clearInterval(interval);
  }, [banners.length, rotationTime]);
  const currentBanner = banners[currentBannerIndex];
  if (loading) {
    return <section className="relative h-[600px] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </section>;
  }
  return <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background - Banner ou Gradiente Padrão */}
      {currentBanner ? <div className="absolute inset-0">
          {currentBanner.tipo === "video" ? <video src={currentBanner.media_url} autoPlay muted loop className="w-full h-full object-cover" /> : <img src={currentBanner.media_url} alt="Banner" className="w-full h-full object-cover" />}
          <div className="absolute inset-0 bg-black/40" />
        </div> : <>
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary opacity-90" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
          </div>
        </>}

      {/* Content */}
      <div className="relative z-10 text-center px-4 space-y-8">
        {logoUrl && mostrarLogoBanner && <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="Logo" className="max-h-32 md:max-h-40 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]" />
          </div>}
        
        
        <p className="text-xl md:text-2xl text-white font-medium max-w-2xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {currentBanner?.mensagem || textoPrincipalHome}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" className="bg-[hsl(36,100%,50%)] text-black hover:bg-[hsl(36,100%,45%)] text-lg font-bold px-8 py-6 shadow-lg" onClick={() => {
          const categorySection = document.getElementById('categorias');
          if (categorySection) {
            categorySection.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }}>
            Ver Cardápio
          </Button>
          <Button asChild size="lg" className="bg-[#25D366] text-white hover:bg-[#20BA5A] p-4 shadow-lg">
            <a href={`https://wa.me/${whatsapp}?text=Olá! Gostaria de fazer um pedido`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </a>
          </Button>
        </div>
      </div>

      {/* Indicadores de Banner */}
      {banners.length > 1 && <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, index) => <button key={index} onClick={() => setCurrentBannerIndex(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentBannerIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"}`} />)}
        </div>}
    </section>;
};