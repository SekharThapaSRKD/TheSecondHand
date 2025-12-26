import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Recycle, Users, Heart, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
} as any;

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 overflow-hidden">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1555529733-0e670560f7e1?auto=format&fit=crop&q=80&w=2070" 
              alt="Various items" 
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background" />
          </div>
          
          <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,white,transparent)] z-0" />
          
          <motion.div 
            className="container relative mx-auto px-4 text-center z-10"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-4xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-indigo-600 bg-clip-text text-transparent animate-gradient-x">
                About SecondHand-Store
              </h1>
            </motion.div>
            
            <motion.p 
              variants={itemVariants}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
            >
              We're on a mission to revolutionize shopping by making second-hand the first choice.
              <span className="block mt-2 font-medium text-foreground">Sustainable. Affordable. Diverse.</span>
            </motion.p>
            
            <motion.div variants={itemVariants}>
              <Button 
                size="lg" 
                onClick={() => navigate("/search")}
                className="group text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300"
              >
                Explore Collection
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-muted/30 relative">
           {/* Subtle Pattern Background */}
           <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(#6366f1 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>
           
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={containerVariants}
            >
              {[
                {
                  icon: Recycle,
                  color: "text-green-600",
                  bg: "bg-green-100",
                  title: "Sustainability First",
                  desc: "Every item finds a new home, reducing waste and extending the lifecycle of quality goods."
                },
                {
                  icon: ShoppingBag,
                  color: "text-blue-600",
                  bg: "bg-blue-100",
                  title: "Quality Curated",
                  desc: "We provide a platform where accuracy and honesty in listings are paramount for all categories."
                },
                {
                  icon: Users,
                  color: "text-purple-600",
                  bg: "bg-purple-100",
                  title: "Community Driven",
                  desc: "Join a community of buyers and sellers who believe in value without compromise to the planet."
                }
              ].map((item, index) => (
                <motion.div key={index} variants={itemVariants} whileHover={{ y: -10 }} className="h-full">
                  <Card className="h-full border-none shadow-xl bg-card/80 backdrop-blur hover:shadow-2xl transition-shadow duration-300">
                    <CardContent className="pt-8 px-6 pb-8 text-center space-y-4">
                      <motion.div 
                        className={`w-16 h-16 rounded-full ${item.bg} flex items-center justify-center mx-auto ${item.color}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        <item.icon className="w-8 h-8" />
                      </motion.div>
                      <h3 className="text-2xl font-semibold">{item.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20 relative overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
             <img 
              src="https://images.unsplash.com/photo-1509785303752-252a1e967f6b?auto=format&fit=crop&q=80&w=2070" 
              alt="Variety of Items" 
              className="w-full h-full object-cover opacity-10"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="max-w-3xl mx-auto space-y-8 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >

              
              <h2 className="text-4xl font-bold">Our Story</h2>
              
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2024, SecondHand-Store began with a simple idea: passing things on shouldn't be complicated. 
                  What started as a small local exchange has grown into a vibrant marketplace connecting buyers 
                  and sellers across the region.
                </p>
                <p>
                  We believe that every item has a story and value. We're here to help you find your next treasure or 
                  give a new life to things you no longer need. From electronics to furniture, books to fashion,
                  you're part of a movement towards a more sustainable future.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
