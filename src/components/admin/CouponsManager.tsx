import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminLog } from "@/hooks/useAdminLog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
}

export const CouponsManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const { toast } = useToast();
  const { logAction } = useAdminLog();

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    if (data) setCoupons(data as Coupon[]);
    setLoading(false);
  };

  const resetForm = () => {
    setCode("");
    setType("percentage");
    setValue("");
    setExpiresAt("");
    setMaxUses("");
    setActive(true);
    setEditingCoupon(null);
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.toString());
    setExpiresAt(coupon.expires_at ? new Date(coupon.expires_at).toISOString().split("T")[0] : "");
    setMaxUses(coupon.max_uses?.toString() || "");
    setActive(coupon.active);
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      code: code.toUpperCase(),
      type,
      value: parseFloat(value),
      expires_at: expiresAt || null,
      max_uses: maxUses ? parseInt(maxUses) : null,
      active,
    };

    if (editingCoupon) {
      const { error } = await supabase.from("coupons").update(couponData).eq("id", editingCoupon.id);
      if (error) {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      } else {
        await logAction("Atualizou cupom", `Cupom: ${code}`);
        toast({ title: "Cupom atualizado!" });
        setDialogOpen(false);
        resetForm();
        fetchCoupons();
      }
    } else {
      const { error } = await supabase.from("coupons").insert(couponData);
      if (error) {
        toast({ variant: "destructive", title: "Erro", description: error.message });
      } else {
        await logAction("Criou cupom", `Cupom: ${code}, Desconto: ${value}${type === "percentage" ? "%" : " R$"}`);
        toast({ title: "Cupom criado!" });
        setDialogOpen(false);
        resetForm();
        fetchCoupons();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
    } else {
      await logAction("Excluiu cupom", "");
      toast({ title: "Cupom excluído" });
      fetchCoupons();
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cupons de Desconto</h2>
          <p className="text-muted-foreground">Crie e gerencie cupons promocionais</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Editar Cupom" : "Novo Cupom"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Código do Cupom</Label>
                <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BIG10" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Desconto</Label>
                  <Select value={type} onValueChange={(v) => setType(v as "percentage" | "fixed")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Expiração</Label>
                  <Input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Usos Máximos</Label>
                  <Input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Ilimitado" />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch checked={active} onCheckedChange={setActive} />
                <Label>Cupom Ativo</Label>
              </div>
              <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary">
                {editingCoupon ? "Salvar Alterações" : "Criar Cupom"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((coupon) => (
          <Card key={coupon.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="text-2xl font-mono">{coupon.code}</span>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => openEditDialog(coupon)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(coupon.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg font-bold text-primary">
                {coupon.type === "percentage" ? `${coupon.value}% OFF` : `R$ ${coupon.value.toFixed(2)} OFF`}
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                {coupon.expires_at && <p>Expira: {new Date(coupon.expires_at).toLocaleDateString()}</p>}
                {coupon.max_uses && <p>Usos: {coupon.current_uses}/{coupon.max_uses}</p>}
                <p className={coupon.active ? "text-green-600" : "text-red-600"}>
                  {coupon.active ? "✓ Ativo" : "✗ Inativo"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};