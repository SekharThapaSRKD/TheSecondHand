import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { ProductGrid } from "@/components/products/ProductGrid";
import { TopUsers } from "@/components/home/TopUsers";
import { useProducts } from "@/context/ProductContext";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

const Index = () => {
  const { products, getTopSellers, getTopBuyers } = useProducts();
  const [sellers, setSellers] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    Promise.all([
      getTopSellers().catch(err => {
        console.error("Failed to fetch top sellers:", err);
        return [];
      }),
      getTopBuyers().catch(err => {
        console.error("Failed to fetch top buyers:", err);
        return [];
      })
    ])
      .then(([sData, bData]) => {
        if (mounted) {
          setSellers(sData || []);
          setBuyers(bData || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching top users:", err);
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950">
      <Navbar />
      <main className="container mx-auto space-y-16 px-4 py-12 md:px-6 lg:px-8 pb-24">
        <HeroSection />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="font-display text-3xl font-bold text-center bg-gradient-to-r from-primary via-purple-500 to-indigo-600 bg-clip-text text-transparent"
            >
              Community Top Picks
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-muted-foreground max-w-2xl mx-auto"
            >
              Discover the most active members and trending items in our sustainable marketplace
            </motion.p>
          </div>
          <TopUsers sellers={sellers} buyers={buyers} />
        </motion.div>
        <ProductGrid products={products.slice(0, 10)} title="Latest Treasures" />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
