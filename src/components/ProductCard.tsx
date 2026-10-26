import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { ProductDetailsModal } from "./ProductDetailsModal";

interface ProductCardProps {
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  promotion?: {
    active: boolean;
    percentage: number;
  };
  featured?: boolean;
}

export const ProductCard = ({
  name,
  description,
  ingredients,
  price,
  image,
  promotion,
  featured,
}: ProductCardProps) => {
  const { addItem } = useCart();
  const [showDetails, setShowDetails] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  
  const finalPrice = promotion?.active
    ? price - (price * promotion.percentage) / 100
    : price;

  const handleAddToCart = () => {
    addItem({
      id: `${name}-${Date.now()}`,
      name,
      price: finalPrice,
      image,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <>
      <Card className="overflow-hidden group hover:shadow-[var(--hover-shadow)] transition-all duration-300">
        <div className="relative overflow-hidden cursor-pointer" onClick={() => setShowDetails(true)}>
          <img
            src={image}
            alt={name}
            className="w-full h-56 object-cover p-4 group-hover:scale-110 transition-transform duration-300"
          />
        {promotion?.active && (
          <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground text-sm font-bold">
            -{promotion.percentage}%
          </Badge>
        )}
        {featured && (
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-bold">
            ⭐ Mais Pedido
          </Badge>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-xl font-bold mb-2">{name}</h3>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Ingredientes:
          </p>
          <p className="text-sm text-muted-foreground">{ingredients.join(", ")}</p>
        </div>

        <div className="flex items-end justify-between pt-4 border-t">
          <div>
            {promotion?.active && (
              <p className="text-sm text-muted-foreground line-through">
                R$ {price.toFixed(2)}
              </p>
            )}
            <p className="text-2xl font-bold text-primary">
              R$ {finalPrice.toFixed(2)}
            </p>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            className={`bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all font-semibold ${
              justAdded ? "scale-95" : ""
            }`}
          >
            {justAdded ? "✔ Adicionado" : "Adicionar"}
          </Button>
        </div>
      </div>
      </Card>

      <ProductDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        product={{ name, description, ingredients, price, image, promotion }}
        onAddToCart={() => {
          handleAddToCart();
          setShowDetails(false);
        }}
      />
    </>
  );
};
