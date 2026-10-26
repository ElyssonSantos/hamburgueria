import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Import CardDescription
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const SiteConfigManager = () => {
  const [loading, setLoading] = useState(true);
  const [configId, setConfigId] = useState("");
  const { toast } = useToast();
  const { logAction } = useAdminLog();

  const [tempoRotacao, setTempoRotacao] = useState("15");
  const [intervaloNotificacao, setIntervaloNotificacao] = useState("30");
  const [logoUrl, setLogoUrl] = useState("");
  const [headerLogoUrl, setHeaderLogoUrl] = useState("");
  const [usarLogoHeader, setUsarLogoHeader] = useState(false);
  const [mostrarLogoBanner, setMostrarLogoBanner] = useState(true);
  const [textoPrincipalHome, setTextoPrincipalHome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconUrl, setFaviconUrl] = useState("");
  const [email, setEmail] = useState("");
  const [deliveryUrl, setDeliveryUrl] = useState("");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data, error } = await supabase.from("site_config").select("*").limit(1).single();
    if (!error && data) {
      setConfigId(data.id);
      setTempoRotacao(data.tempo_rotacao_banner.toString());
      setIntervaloNotificacao(data.intervalo_notificacao.toString());
      setWhatsapp(data.whatsapp);
      setInstagram(data.instagram || "");
      setFacebook(data.facebook || "");
      setTiktok(data.tiktok || "");
      setLogoUrl(data.logo_url || "");
      setHeaderLogoUrl(data.header_logo_url || "");
      setUsarLogoHeader(data.usar_logo_header || false);
      setMostrarLogoBanner(data.mostrar_logo_banner ?? true);
      setTextoPrincipalHome(data.texto_principal_home || "Os melhores hambúrgueres gourmet, pizzas artesanais e muito mais!");
      setEmail(data.email || "");
      setFaviconUrl(data.favicon_url || "");
      setDeliveryUrl(data.delivery_url || "");
    }
    setLoading(false);
  };

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFaviconFile(e.target.files[0]);
    }
  };

  const uploadFavicon = async (file: File): Promise<string | null> => {
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O arquivo excede o tamanho máximo permitido de 2MB.",
      });
      return null;
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `favicon.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast({ variant: "destructive", title: "Erro ao fazer upload", description: uploadError.message });
      return null;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalFaviconUrl = faviconUrl;
    if (faviconFile) {
      const uploadedUrl = await uploadFavicon(faviconFile);
      if (uploadedUrl) {
        finalFaviconUrl = uploadedUrl;
        
        const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'icon';
        link.href = finalFaviconUrl;
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }

    const { error } = await supabase.from("site_config").update({
      tempo_rotacao_banner: parseInt(tempoRotacao),
      intervalo_notificacao: parseInt(intervaloNotificacao),
      whatsapp,
      instagram,
      facebook,
      tiktok,
      delivery_url: deliveryUrl || null,
      logo_url: logoUrl || null,
      header_logo_url: headerLogoUrl || null,
      usar_logo_header: usarLogoHeader,
      mostrar_logo_banner: mostrarLogoBanner,
      texto_principal_home: textoPrincipalHome,
      email: email || null,
      favicon_url: finalFaviconUrl || null,
    }).eq("id", configId);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      await logAction("Atualizou configurações do site", "WhatsApp, redes sociais, horários, logos e textos");
      toast({ title: "Configurações salvas!" });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Configurações do Site</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Logo do Banner Principal (URL)</Label>
              <Input 
                type="url" 
                value={logoUrl} 
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
              <p className="text-sm text-muted-foreground">
                O logo será exibido acima dos botões no banner principal. Formatos aceitos: PNG, JPG, SVG
              </p>
              {logoUrl && (
                <div className="mt-2 p-4 bg-muted rounded-lg flex justify-center">
                  <img src={logoUrl} alt="Preview do logo" className="max-h-24 object-contain" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mostrarLogoBanner"
                checked={mostrarLogoBanner}
                onChange={(e) => setMostrarLogoBanner(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="mostrarLogoBanner">Ativar logo do banner principal</Label>
            </div>
            <div className="space-y-2">
              <Label>Logo do Header (URL)</Label>
              <Input 
                type="url" 
                value={headerLogoUrl} 
                onChange={(e) => setHeaderLogoUrl(e.target.value)}
                placeholder="https://exemplo.com/logo-header.png"
              />
              <p className="text-sm text-muted-foreground">
                Logo que substituirá o texto "BigBig Burguer" no canto superior esquerdo
              </p>
              {headerLogoUrl && (
                <div className="mt-2 p-4 bg-muted rounded-lg flex justify-center">
                  <img src={headerLogoUrl} alt="Preview do logo header" className="max-h-12 object-contain" />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="usarLogoHeader"
                checked={usarLogoHeader}
                onChange={(e) => setUsarLogoHeader(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="usarLogoHeader">Usar logo do header no lugar do texto "BigBig Burguer"</Label>
            </div>
            <div className="space-y-2">
              <Label>Texto Principal da Home</Label>
              <Input 
                value={textoPrincipalHome} 
                onChange={(e) => setTextoPrincipalHome(e.target.value)}
                placeholder="Os melhores hambúrgueres gourmet, pizzas artesanais e muito mais!"
              />
              <p className="text-sm text-muted-foreground">
                Frase principal que aparece no banner da página inicial
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Rotação Banner (segundos)</Label><Input type="number" value={tempoRotacao} onChange={(e) => setTempoRotacao(e.target.value)} /></div>
              <div className="space-y-2"><Label>Intervalo Notificações (segundos)</Label><Input type="number" value={intervaloNotificacao} onChange={(e) => setIntervaloNotificacao(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>E-mail de Contato</Label>
              <Input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@bigbigburguer.com.br"
              />
            </div>
            <div className="space-y-2">
              <Label>Favicon do Site</Label>
              <Input 
                type="file" 
                accept="image/x-icon,image/png,image/jpg,image/jpeg" 
                onChange={handleFaviconFileChange}
              />
              <p className="text-sm text-muted-foreground">
                Upload de favicon (ICO, PNG, JPG - até 2MB). A imagem será atualizada automaticamente.
              </p>
              {faviconUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={faviconUrl} alt="Favicon Preview" className="w-8 h-8" />
                  <span className="text-xs text-muted-foreground">Favicon atual</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Instagram URL</Label><Input value={instagram} onChange={(e) => setInstagram(e.target.value)} /></div>
              <div className="space-y-2"><Label>Facebook URL</Label><Input value={facebook} onChange={(e) => setFacebook(e.target.value)} /></div>
              <div className="space-y-2"><Label>TikTok URL</Label><Input value={tiktok} onChange={(e) => setTiktok(e.target.value)} /></div>
            </div>
            <div className="space-y-2">
              <Label>URL de Entrega/Delivery</Label>
              <Input 
                type="url"
                value={deliveryUrl} 
                onChange={(e) => setDeliveryUrl(e.target.value)} 
                placeholder="https://exemplo.com/delivery"
              />
              <p className="text-sm text-muted-foreground">
                Link para sistema de delivery. O ícone aparecerá no rodapé ao lado das redes sociais.
              </p>
            </div>
            <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">Salvar Configurações</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Importantes</CardTitle>
          <CardDescription>
            ATENÇÃO! Descontos e cupons promocionais do BIGBIG só podem ser obtidos em nossos canais oficiais (redes sociais e site).
            Reforçamos que informações que não sejam provenientes dessas fontes não são válidas.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
};