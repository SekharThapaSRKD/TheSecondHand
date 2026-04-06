import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface TopUsersProps {
  sellers: User[];
  buyers: User[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export const TopUsers = ({ sellers, buyers }: TopUsersProps) => {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-primary/10 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur hover:border-primary/30 transition-colors duration-300">
          <CardContent className="p-6">
            <motion.div 
              className="mb-6 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="h-5 w-5 text-primary" />
              </motion.div>
              <h3 className="font-display text-xl font-semibold">Top Sellers</h3>
            </motion.div>
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {sellers && sellers.length > 0 ? (
                sellers.map((user, index) => (
                  <motion.div
                    key={user._id}
                    variants={itemVariants}
                  >
                    <Link 
                      to={`/profile/${user._id}`} 
                      className="flex items-center gap-3 group p-3 rounded-xl transition-all duration-300 hover:bg-accent hover:shadow-md border border-transparent hover:border-primary/50"
                    >
                      <motion.span 
                        className="w-6 text-center font-bold text-muted-foreground group-hover:text-foreground transition-colors"
                        whileHover={{ scale: 1.2 }}
                      >
                        {index + 1}
                      </motion.span>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-primary/50 transition-colors ring-2 ring-primary/10 group-hover:ring-primary/30">
                          <AvatarImage 
                            src={user.avatar?.startsWith("http") ? user.avatar : `${API_URL}${user.avatar}`} 
                            alt={user.name} 
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground transition-colors">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.totalSales} items sold</p>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No top sellers yet</p>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="border border-accent/10 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur hover:border-accent/30 transition-colors duration-300">
          <CardContent className="p-6">
            <motion.div 
              className="mb-6 flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ShoppingBag className="h-5 w-5 text-accent" />
              </motion.div>
              <h3 className="font-display text-xl font-semibold">Top Buyers</h3>
            </motion.div>
            <motion.div 
              className="space-y-3"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {buyers && buyers.length > 0 ? (
                buyers.map((user, index) => (
                  <motion.div
                    key={user._id}
                    variants={itemVariants}
                  >
                    <Link 
                      to={`/profile/${user._id}`} 
                      className="flex items-center gap-3 group p-3 rounded-xl transition-all duration-300 hover:bg-accent hover:shadow-md border border-transparent hover:border-accent/50"
                    >
                      <motion.span 
                        className="w-6 text-center font-bold text-muted-foreground group-hover:text-foreground transition-colors"
                        whileHover={{ scale: 1.2 }}
                      >
                        {index + 1}
                      </motion.span>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-accent/50 transition-colors ring-2 ring-accent/10 group-hover:ring-accent/30">
                          <AvatarImage 
                            src={user.avatar?.startsWith("http") ? user.avatar : `${API_URL}${user.avatar}`} 
                            alt={user.name} 
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground transition-colors">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.totalPurchases} items bought</p>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No top buyers yet</p>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
};
