import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const ThemeCustomizationManager = () => {
  const [loading, setLoading] = useState(true);
  const [configId, setConfigId] = useState("");
  const { toast } = useToast();
  const { logAction } = useAdminLog();

  const [corPrimaria, setCorPrimaria] = useState("hsl(40, 100%, 50%)");
  const [corSecundaria, setCorSecundaria] = useState("hsl(25, 95%, 53%)");
  const [corFundoClaro, setCorFundoClaro] = useState("hsl(0, 0%, 100%)");
  const [corFundoEscuro, setCorFundoEscuro] = useState("hsl(240, 10%, 3.9%)");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    const { data, error } = await supabase.from("site_config").select("*").limit(1).single();
    if (!error && data) {
      setConfigId(data.id);
      setCorPrimaria(data.cor_primaria || "hsl(40, 100%, 50%)");
      setCorSecundaria(data.cor_secundaria || "hsl(25, 95%, 53%)");
      setCorFundoClaro(data.cor_fundo_claro || "hsl(0, 0%, 100%)");
      setCorFundoEscuro(data.cor_fundo_escuro || "hsl(240, 10%, 3.9%)");
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("site_config").update({
      cor_primaria: corPrimaria,
      cor_secundaria: corSecundaria,
      cor_fundo_claro: corFundoClaro,
      cor_fundo_escuro: corFundoEscuro,
    }).eq("id", configId);

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      await logAction("Atualizou cores do tema", "Cores personalizadas");
      toast({ 
        title: "Cores salvas!", 
        description: "Atualize a página para ver as mudanças aplicadas." 
      });
    }
  };

  const applyColors = () => {
    // Aplicar cores dinamicamente nas variáveis CSS
    const root = document.documentElement;
    root.style.setProperty("--primary", corPrimaria);
    root.style.setProperty("--secondary", corSecundaria);
  };

  useEffect(() => {
    applyColors();
  }, [corPrimaria, corSecundaria, corFundoClaro, corFundoEscuro]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalização de Cores</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="corPrimaria">Cor Principal</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="corPrimaria"
                  value={corPrimaria.includes("hsl") ? "#FFA500" : corPrimaria}
                  onChange={(e) => setCorPrimaria(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={corPrimaria}
                  onChange={(e) => setCorPrimaria(e.target.value)}
                  className="flex-1 h-10 rounded border px-3"
                  placeholder="hsl(40, 100%, 50%)"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cor usada em botões, links e destaques
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="corSecundaria">Cor Secundária</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="corSecundaria"
                  value={corSecundaria.includes("hsl") ? "#F97316" : corSecundaria}
                  onChange={(e) => setCorSecundaria(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={corSecundaria}
                  onChange={(e) => setCorSecundaria(e.target.value)}
                  className="flex-1 h-10 rounded border px-3"
                  placeholder="hsl(25, 95%, 53%)"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Cor secundária para gradientes e detalhes
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="corFundoClaro">Fundo Modo Claro</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="corFundoClaro"
                  value={corFundoClaro.includes("hsl") ? "#FFFFFF" : corFundoClaro}
                  onChange={(e) => setCorFundoClaro(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={corFundoClaro}
                  onChange={(e) => setCorFundoClaro(e.target.value)}
                  className="flex-1 h-10 rounded border px-3"
                  placeholder="hsl(0, 0%, 100%)"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="corFundoEscuro">Fundo Modo Escuro</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  id="corFundoEscuro"
                  value={corFundoEscuro.includes("hsl") ? "#0A0A0F" : corFundoEscuro}
                  onChange={(e) => setCorFundoEscuro(e.target.value)}
                  className="h-10 w-20 rounded border cursor-pointer"
                />
                <input
                  type="text"
                  value={corFundoEscuro}
                  onChange={(e) => setCorFundoEscuro(e.target.value)}
                  className="flex-1 h-10 rounded border px-3"
                  placeholder="hsl(240, 10%, 3.9%)"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline"
              onClick={applyColors}
            >
              Pré-visualizar
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Salvar Cores
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            💡 Dica: Use valores HSL para melhor compatibilidade com o tema claro/escuro.
            Exemplo: hsl(40, 100%, 50%)
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
