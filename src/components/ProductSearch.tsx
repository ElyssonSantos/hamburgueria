import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "./ui/input";

interface ProductSearchProps {
  products: any[];
  onFilteredProducts: (filtered: any[]) => void;
}

export const ProductSearch = ({ products, onFilteredProducts }: ProductSearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    const normalizedSearch = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return products.filter((product) => {
      const normalizedName = product.nome
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      return normalizedName.includes(normalizedSearch);
    });
  }, [products, searchTerm]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilteredProducts(filteredProducts);
    }, 400);

    return () => clearTimeout(timer);
  }, [filteredProducts, onFilteredProducts]);

  return (
    <div className="w-full max-w-xl mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar produto por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-6 text-base"
        />
      </div>
      {searchTerm && (
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {filteredProducts.length} {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>
      )}
    </div>
  );
};