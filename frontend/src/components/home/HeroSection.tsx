import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search, Sparkles, ArrowRight, Package, Tag } from "lucide-react";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      {/* animated gradient background */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 blur-3xl"
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-6xl px-6 py-20 text-center">
        {/* Badge */}
        <motion.div
          variants={item}
          className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-primary">
          <Sparkles className="h-4 w-4 animate-pulse" />
          Sustainable Marketplace
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={item}
          className="mx-auto mb-6 max-w-3xl text-4xl font-extrabold tracking-tight md:text-6xl">
          Buy & Sell <span className="text-primary">Pre-Loved</span> Treasures
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={item}
          className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Discover unique second-hand items or turn your clutter into cash.
          Join thousands of buyers and sellers on SecondHand-Store.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="gap-2" onClick={() => navigate("/search")}> 
            <Search className="h-4 w-4" /> Browse Items
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/sell")}> 
            <Tag className="h-4 w-4" /> Start Selling
          </Button>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          variants={item}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          {["Verified Sellers", "Secure Payments", "Eco-Friendly Shopping"].map(
            (text, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
                className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-primary" />
                {text}
              </motion.div>
            )
          )}
        </motion.div>

        {/* floating decorative icons */}
        <motion.div
          aria-hidden
          className="absolute left-10 top-10 text-primary/30"
          animate={{ y: [0, -12, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}>
          <Package className="h-10 w-10" />
        </motion.div>
        <motion.div
          aria-hidden
          className="absolute right-10 bottom-10 text-primary/30"
          animate={{ y: [0, 14, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity }}>
          <Sparkles className="h-10 w-10" />
        </motion.div>
      </motion.div>
    </section>
  );
};
