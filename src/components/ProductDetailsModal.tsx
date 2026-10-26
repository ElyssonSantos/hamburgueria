import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    name: string;
    description: string;
    ingredients: string[];
    price: number;
    image: string;
    promotion?: {
      active: boolean;
      percentage: number;
    };
  } | null;
  onAddToCart: () => void;
}

export const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
}: ProductDetailsModalProps) => {
  if (!product) return null;

  const finalPrice = product.promotion?.active
    ? product.price - (product.price * product.promotion.percentage) / 100
    : product.price;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <X className="h-5 w-5" />
          </Button>

          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 md:h-full object-cover"
              />
              {product.promotion?.active && (
                <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-sm font-bold">
                  -{product.promotion.percentage}%
                </Badge>
              )}
            </div>

            <div className="p-4 md:p-6 flex flex-col">
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-3">{product.name}</h2>
                <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">{product.description}</p>

                <div className="space-y-2 mb-4 md:mb-6">
                  <p className="text-xs md:text-sm font-semibold text-muted-foreground uppercase">
                    Ingredientes:
                  </p>
                  <p className="text-xs md:text-sm">{product.ingredients.join(", ")}</p>
                </div>
              </div>

              <div className="space-y-3 md:space-y-4 border-t pt-3 md:pt-4">
                <div className="flex items-end justify-between">
                  <div>
                    {product.promotion?.active && (
                      <p className="text-xs md:text-sm text-muted-foreground line-through">
                        R$ {product.price.toFixed(2)}
                      </p>
                    )}
                    <p className="text-2xl md:text-3xl font-bold text-primary">
                      R$ {finalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={onAddToCart}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-semibold"
                  size="lg"
                >
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
