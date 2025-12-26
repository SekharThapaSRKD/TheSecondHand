import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Trash2 } from "lucide-react";
import PaymentButtons from "@/components/payment/PaymentButtons";

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
  showBuy?: boolean;
  onDelete?: () => void;
}

export const ProductCard = ({
  product,
  onClick,
  showBuy = false,
  onDelete,
}: ProductCardProps) => {
  const { addToCart } = useCart();

  const conditionColors: Record<string, string> = {
    new: "bg-accent text-accent-foreground",
    "like-new": "bg-chart-2 text-primary-foreground",
    good: "bg-chart-3 text-foreground",
    fair: "bg-muted text-muted-foreground",
  };

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg"
      onClick={onClick}>
      <div className="aspect-square overflow-hidden bg-muted relative">
        <img
          src={product.images[0]?.startsWith("http") ? product.images[0] : `${API}${product.images[0]}`}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md z-10 hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
         )}
        {product.status === "sold" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-md transform -rotate-12">
              Sold
            </span>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-medium">{product.name}</h3>
          <span className="font-bold text-primary">NRs {product.price}</span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {product.location}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="text-xs">
            {product.size}
          </Badge>
          <Badge variant="secondary" className="text-xs capitalize">
            {product.gender}
          </Badge>
          <Badge
            className={`text-xs ${
              conditionColors[product.condition] ?? "bg-muted"
            }`}>
            {product.condition}
          </Badge>
        </div>

        {showBuy && product.status !== "sold" && (
          <div className="mt-4 border-t pt-4">
            <PaymentButtons
              amount={Math.round((product.price || 0) * 100)}
              name={product.name}
              currency="usd"
              productId={product._id}
            />
          </div>
        )}

        <div className="mt-3">
          <Button
            disabled={product.status === "sold"}
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="w-full bg-primary/90 hover:bg-primary text-white shadow hover:shadow-lg transition-all"
            size="default" id="cart">
            Add to cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
