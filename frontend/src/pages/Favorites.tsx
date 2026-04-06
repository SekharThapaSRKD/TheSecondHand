import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { useAuth } from "@/context/AuthContext";
import { Heart, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function Favorites() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    
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
        <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 flex flex-col">
          <Navbar />
          <div className="flex-1 flex items-center justify-center px-4">
            <Card className="max-w-md w-full border-0 shadow-lg">
              <div className="p-12 text-center space-y-6">
                <Heart className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Save Your Favorites</h2>
                  <p className="text-muted-foreground">Sign in to save and manage your favorite items</p>
                </div>
                <Button size="lg" onClick={() => navigate("/login")} className="w-full">Sign In Now</Button>
              </div>
            </Card>
          </div>
        </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <Button 
            variant="ghost" 
            className="pl-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors mb-4" 
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>

          <div className="flex items-center gap-3">
            <Heart className="text-red-500 fill-red-500 w-8 h-8" />
            <div>
              <h1 className="text-4xl font-bold">My Favorites</h1>
              <p className="text-muted-foreground mt-1">{favorites.length} item{favorites.length !== 1 ? 's' : ''} saved</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {favorites.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <div className="p-12 text-center space-y-6">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">No favorites yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">Start exploring and save items you love to your favorites!</p>
                </div>
                <Button onClick={() => navigate("/search")} size="lg">Browse Items</Button>
              </div>
            </Card>
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
