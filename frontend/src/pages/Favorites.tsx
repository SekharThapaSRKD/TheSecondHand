import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Favorites() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Fetch full wishlist objects
    const fetchFavorites = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${API}/api/auth/wishlist`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setFavorites(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchFavorites();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <h2 className="text-2xl font-bold">Please login to view favorites</h2>
            <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
    );
  }

  if (loading) {
    return <div className="p-20 text-center">Loading favorites...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-900">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors mb-4" 
            onClick={() => navigate("/")}
        >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <div className="flex items-center gap-2 mb-8">
            <Heart className="text-red-500 fill-red-500 w-8 h-8" />
            <h1 className="text-3xl font-bold">My Favorites</h1>
        </div>

        {favorites.length === 0 ? (
            <div className="text-center py-20 bg-muted/30 rounded-lg">
                <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-6">Start exploring and save items you love!</p>
                <Button onClick={() => navigate("/search")}>Browse Items</Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favorites.map((product) => (
                    <ProductCard 
                        key={product._id} 
                        product={product} 
                        onClick={() => navigate(`/product/${product._id}`)}
                        showBuy={true}
                    />
                ))}
            </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
