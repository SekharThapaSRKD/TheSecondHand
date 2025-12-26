import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Product, User } from "@/types";
import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface ProductContextType {
  products: Product[];
  pendingProducts: Product[];
  addProduct: (
    product: Omit<Product, "_id" | "status" | "createdAt" | "seller"> | FormData,
    seller: User
  ) => void;
  updateProduct: (id: string, productData: any) => Promise<void>;
  approveProduct: (id: string) => void;
  rejectProduct: (id: string) => void;
  getTopSellers: () => Promise<User[]>;
  getTopBuyers: () => Promise<User[]>;
  fetchPending?: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | null>(null);

const mockSellers: User[] = [
  {
    _id: "1",
    name: "Sarah Miller",
    email: "s@m.com",
    isAdmin: false,
    totalSales: 89,
    totalPurchases: 12,
    createdAt: "2024-01-01",
  },
  {
    _id: "2",
    name: "James Wilson",
    email: "j@w.com",
    isAdmin: false,
    totalSales: 67,
    totalPurchases: 34,
    createdAt: "2024-01-15",
  },
  {
    _id: "3",
    name: "Emma Davis",
    email: "e@d.com",
    isAdmin: false,
    totalSales: 54,
    totalPurchases: 45,
    createdAt: "2024-02-01",
  },
  {
    _id: "4",
    name: "Mike Brown",
    email: "m@b.com",
    isAdmin: false,
    totalSales: 23,
    totalPurchases: 78,
    createdAt: "2024-02-15",
  },
  {
    _id: "5",
    name: "Lisa Chen",
    email: "l@c.com",
    isAdmin: false,
    totalSales: 45,
    totalPurchases: 56,
    createdAt: "2024-03-01",
  },
];

const initialProducts: Product[] = [];

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);

  const fetchProducts = useCallback(() => {
    fetch(`${API_URL}/api/products`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.products) setProducts(data.products);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Listen for product update events (e.g., after successful payment)
  useEffect(() => {
    const handleProductsUpdate = () => {
      fetchProducts();
    };

    window.addEventListener("productsUpdated", handleProductsUpdate);
    return () => window.removeEventListener("productsUpdated", handleProductsUpdate);
  }, [fetchProducts]);

  const addProduct = useCallback(async (productData: any, seller: User) => {
    const token = localStorage.getItem("token");
    try {
      const isForm =
        typeof FormData !== "undefined" && productData instanceof FormData;
      const res = await fetch(`${API_URL}/api/products`, {
        method: "POST",
        headers: isForm
          ? { Authorization: `Bearer ${token}` }
          : {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
        body: isForm ? productData : JSON.stringify(productData),
      });

      // Parse response safely: prefer JSON, fall back to text
      let data: any = null;
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        // If server returned HTML (e.g., proxy/404), include some of it in error
        data = { message: text };
      }

      if (!res.ok) {
        const msg = data?.message || res.statusText || "Failed to add product";
        throw new Error(msg);
      }
      toast({
        title: "Product submitted!",
        description: "Waiting for admin approval",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not submit product",
      });
      throw err;
    }
  }, []);

  const updateProduct = useCallback(async (id: string, productData: any) => {
    const token = localStorage.getItem("token");
    try {
      const isForm =
        typeof FormData !== "undefined" && productData instanceof FormData;
      const res = await fetch(`${API_URL}/api/products/${id}`, {
        method: "PUT",
        headers: isForm
          ? { Authorization: `Bearer ${token}` }
          : {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
        body: isForm ? productData : JSON.stringify(productData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Update failed");

      // Update local state
      setPendingProducts((prev) =>
        prev.map((p) => (p._id === id ? data.product : p))
      );
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? data.product : p))
      );

      toast({ title: "Product updated", description: "Changes saved successfully" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not update product",
        variant: "destructive",
      });
      throw err;
    }
  }, []);

  const approveProduct = useCallback(async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/products/${id}/approve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Approve failed");
    setProducts((prev) =>
      [...prev, data.product].filter((p) => p.status === "approved")
    );
    setPendingProducts((prev) => prev.filter((p) => p._id !== id));
    toast({ title: "Product approved", description: "Now visible to buyers" });
  }, []);

  const rejectProduct = useCallback(async (id: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/products/${id}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Reject failed");
    setPendingProducts((prev) => prev.filter((p) => p._id !== id));
    toast({ title: "Product rejected" });
  }, []);

  const fetchPending = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/products/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data?.products) setPendingProducts(data.products);
    } catch (e) {}
  }, []);

  const getTopSellers = useCallback(() => {
    return fetch(`${API_URL}/api/products/stats/top-sellers`)
      .then((r) => r.json())
      .then((data) => data.sellers || [])
      .catch(() => []);
  }, []);

  const getTopBuyers = useCallback(() => {
    return fetch(`${API_URL}/api/products/stats/top-buyers`)
      .then((r) => r.json())
      .then((data) => data.buyers || [])
      .catch(() => []);
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products: products.filter((p) => p.status === "approved"),
        pendingProducts,
        addProduct,
        updateProduct,
        approveProduct,
        rejectProduct,
        getTopSellers,
        getTopBuyers,
        fetchPending,
      }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context)
    throw new Error("useProducts must be used within ProductProvider");
  return context;
};
