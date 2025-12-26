import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductGrid } from "@/components/products/ProductGrid";
import { TopUsers } from "@/components/home/TopUsers";
import { useProducts } from "@/context/ProductContext";
import React, { useEffect, useState } from "react";

const Index = () => {
  const { products, getTopSellers, getTopBuyers } = useProducts();
  const [sellers, setSellers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    
    Promise.all([getTopSellers(), getTopBuyers()])
      .then(([sData, bData]) => {
        if (mounted) {
          setSellers(sData);
          setBuyers(bData);
        }
      })
      .catch(() => {
        // quiet fail
      });

    return () => {
      mounted = false;
    };
  }, [getTopSellers, getTopBuyers]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Navbar />
      <main className="container mx-auto space-y-16 px-4 py-12 md:px-6 lg:px-8 pb-24">
        <HeroSection />
        <div className="space-y-4">
            <h2 className="font-display text-3xl font-bold text-center">Community Top Picks</h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto">
              Discover the most active members and trending items in our sustainable marketplace
            </p>
            <TopUsers sellers={sellers} buyers={buyers} />
        </div>
        <ProductGrid products={products.slice(0, 10)} title="Latest Treasures" />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
