import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { useNavigate } from "react-router-dom";

interface ProductGridProps {
  products: Product[];
  title?: string;
}

export const ProductGrid = ({ products, title }: ProductGridProps) => {
  const navigate = useNavigate();

  return (
    <section className="animate-fade-in">
      {title && (
        <h2 className="mb-6 font-display text-2xl font-semibold text-foreground">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onClick={() => navigate(`/product/${product._id}`)}
            showBuy={true}
          />
        ))}
      </div>
    </section>
  );
};
