import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

type CartItem = {
  product: Product;
  quantity: number;
  price: number;
};

type CartState = {
  items: CartItem[];
  total: number;
};

type CartContextType = {
  cart: CartState;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQty: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
};

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [cart, setCart] = useState<CartState>({ items: [], total: 0 });

  useEffect(() => {
    if (isAuthenticated) {
        // load local cart from localStorage
        const saved = localStorage.getItem("cart");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCart(parsed);
            } catch (e) {}
        }
        fetchCart().catch(() => {});
    } else {
        setCart({ items: [], total: 0 });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
        localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  // Listen for cart update events (e.g., after successful payment)
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isAuthenticated) {
        fetchCart().catch(() => {});
      }
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [isAuthenticated]);

  const recalc = (items: CartItem[]) => {
    const total = items.reduce(
      (s, it) => s + (it.price || 0) * (it.quantity || 1),
      0
    );
    return { items, total };
  };

  async function fetchCart() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch(`${API}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const items = (data.items || []).map((i: any) => ({
        product: i.product,
        quantity: i.quantity,
        price: i.price,
      }));
      setCart(recalc(items));
    } catch (e) {
      console.error(e);
    }
  }

  async function addToCart(product: Product, quantity = 1) {
    if (!isAuthenticated) {
        toast({ 
            title: "Please login first", 
            description: "You must be logged in to add items to your cart",
            variant: "destructive"
        });
        return;
    }

    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch(`${API}/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId: product._id, quantity }),
        });
        if (res.ok) {
          const data = await res.json();
          const items = (data.items || []).map((i: any) => ({
            product: i.product,
            quantity: i.quantity,
            price: i.price,
          }));
          setCart(recalc(items));
          toast({ title: "Added to cart" });
          return;
        }
      }

      // fallback: store in local cart
      const exists = cart.items.find((i) => i.product._id === product._id);
      let nextItems = [] as CartItem[];
      if (exists) {
        nextItems = cart.items.map((i) =>
          i.product._id === product._id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      } else {
        nextItems = [
          ...cart.items,
          { product, quantity, price: product.price },
        ];
      }
      setCart(recalc(nextItems));
    } catch (e) {
      console.error(e);
    }
  }

  async function removeFromCart(productId: string) {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch(`${API}/api/cart/${productId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const items = (data.items || []).map((i: any) => ({
            product: i.product,
            quantity: i.quantity,
            price: i.price,
          }));
          setCart(recalc(items));
          return;
        }
      }
      setCart(recalc(cart.items.filter((i) => i.product._id !== productId)));
    } catch (e) {
      console.error(e);
    }
  }

  async function updateQty(productId: string, quantity: number) {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const res = await fetch(`${API}/api/cart`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId, quantity }),
        });
        if (res.ok) {
          const data = await res.json();
          const items = (data.items || []).map((i: any) => ({
            product: i.product,
            quantity: i.quantity,
            price: i.price,
          }));
          setCart(recalc(items));
          return;
        }
      }
      setCart(
        recalc(
          cart.items.map((i) =>
            i.product._id === productId ? { ...i, quantity } : i
          )
        )
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function clearCart() {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${API}/api/cart`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (e) {
      console.error(e);
    }
    setCart({ items: [], total: 0 });
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
        fetchCart,
      }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
