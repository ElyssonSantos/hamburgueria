import { useState } from "react";
import { ShoppingCart, X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { CheckoutModal } from "./CheckoutModal";

export const FloatingCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { items, removeItem, updateQuantity, total, itemCount } = useCart();

  const handleCheckout = () => {
    setShowCheckout(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Botão flutuante do carrinho */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className="relative h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-all bg-gradient-to-r from-primary to-secondary"
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </div>

      {/* Painel lateral do carrinho */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Painel */}
          <Card className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 flex flex-col shadow-2xl animate-slide-in-right overflow-hidden">
            {/* Cabeçalho */}
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary to-secondary">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Lista de itens */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <ShoppingCart className="h-16 w-16 mb-4 opacity-50" />
                  <p>Seu carrinho está vazio</p>
                  <p className="text-sm mt-2">Adicione produtos para começar!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <Card key={item.id} className="p-3 flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                        <p className="text-primary font-bold">
                          R$ {item.price.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 ml-auto text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Rodapé com total e botão */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-3">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-primary">R$ {total.toFixed(2)}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold"
                  size="lg"
                >
                  Finalizar Pedido
                </Button>
              </div>
            )}
          </Card>
        </>
      )}

      {/* Modal de Checkout */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
      />
    </>
  );
};
