import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  max_uses: number | null;
  current_uses: number;
}

export const CheckoutModal = ({ isOpen, onClose }: CheckoutModalProps) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const { items, total, clearCart } = useCart();
  const { whatsapp } = useSiteConfig();
  const { toast } = useToast();

  const discount = appliedCoupon
    ? appliedCoupon.type === "percentage"
      ? (total * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;

  const finalTotal = Math.max(0, total - discount);

  useEffect(() => {
    if (!isOpen) {
      setAppliedCoupon(null);
      setCouponCode("");
    }
  }, [isOpen]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setLoadingCoupon(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("active", true)
      .maybeSingle();

    setLoadingCoupon(false);

    if (error || !data) {
      toast({ variant: "destructive", title: "Cupom inválido", description: "Código não encontrado ou expirado" });
      return;
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      toast({ variant: "destructive", title: "Cupom expirado" });
      return;
    }

    if (data.max_uses && data.current_uses >= data.max_uses) {
      toast({ variant: "destructive", title: "Cupom esgotado" });
      return;
    }

    setAppliedCoupon(data as Coupon);
    toast({ title: "Cupom aplicado!", description: `Você ganhou ${data.type === "percentage" ? `${data.value}%` : `R$ ${data.value.toFixed(2)}`} de desconto` });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (finalTotal < 10) {
      toast({
        variant: "destructive",
        title: "Pedido mínimo não atingido",
        description: "O pedido mínimo é de R$10,00. Adicione mais itens para continuar 😉",
      });
      return;
    }

    if (!name || !phone || !neighborhood) {
      toast({
        variant: "destructive",
        title: "Dados incompletos",
        description: "Por favor, preencha todos os campos.",
      });
      return;
    }

    setLoading(true);

    if (appliedCoupon) {
      await supabase
        .from("coupons")
        .update({ current_uses: appliedCoupon.current_uses + 1 })
        .eq("id", appliedCoupon.id);
    }

    // Construir mensagem do WhatsApp
    const itemsList = items
      .map((item) => `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`)
      .join("\n");

    let message = `🍔 *NOVO PEDIDO - BigBig Burguer*\n\n` +
      `👤 *Cliente:* ${name}\n` +
      `📱 *Telefone:* ${phone}\n` +
      `📍 *Bairro:* ${neighborhood}\n\n` +
      `🛒 *Itens do Pedido:*\n${itemsList}\n\n`;

    if (appliedCoupon) {
      message += `🎟️ *Cupom:* ${appliedCoupon.code} (-R$ ${discount.toFixed(2)})\n`;
    }

    message += `💰 *Valor Total:* R$ ${finalTotal.toFixed(2)}`;

    const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, "_blank");

    // Limpar carrinho e fechar modal
    setTimeout(() => {
      clearCart();
      setName("");
      setPhone("");
      setNeighborhood("");
      setLoading(false);
      onClose();
      toast({
        title: "Pedido enviado!",
        description: "Aguarde o contato no WhatsApp 😊",
      });
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro</Label>
            <Input
              id="neighborhood"
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Seu bairro"
              required
            />
          </div>

          <div className="space-y-3 pt-4 border-t">
            <Label htmlFor="coupon">Cupom de Desconto</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Digite o código"
                disabled={!!appliedCoupon}
              />
              <Button
                type="button"
                onClick={applyCoupon}
                disabled={loadingCoupon || !!appliedCoupon}
                variant="outline"
              >
                {loadingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : appliedCoupon ? "Aplicado" : "Aplicar"}
              </Button>
            </div>
            {appliedCoupon && (
              <p className="text-sm text-green-600">
                ✓ Cupom {appliedCoupon.code} aplicado! Desconto de {appliedCoupon.type === "percentage" ? `${appliedCoupon.value}%` : `R$ ${appliedCoupon.value.toFixed(2)}`}
              </p>
            )}
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto:</span>
                <span>-R$ {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">R$ {finalTotal.toFixed(2)}</span>
            </div>

            {finalTotal < 10 && (
              <p className="text-sm text-destructive">
                Pedido mínimo: R$ 10,00. Faltam R$ {(10 - finalTotal).toFixed(2)}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-secondary mt-4"
              disabled={loading || finalTotal < 10}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Pedido via WhatsApp"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};