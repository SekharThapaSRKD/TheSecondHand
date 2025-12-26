import { User } from '@/types';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopUsersProps {
  sellers: User[];
  buyers: User[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const TopUsers = ({ sellers, buyers }: TopUsersProps) => {
  return (
    <section className="grid gap-6 md:grid-cols-2">
      <Card className="animate-fade-in border-none shadow-lg bg-card/60 backdrop-blur">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl font-semibold">Top Sellers</h3>
          </div>
          <div className="space-y-3">
            {sellers.map((user, index) => (
              <Link 
                to={`/profile/${user._id}`} 
                key={user._id} 
                className="flex items-center gap-3 group p-3 rounded-xl transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-[1.02] border border-transparent hover:border-border/50"
              >
                <span className="w-6 text-center font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {index + 1}
                </span>
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-primary/50 transition-colors">
                   <AvatarImage 
                    src={user.avatar?.startsWith("http") ? user.avatar : `${API_URL}${user.avatar}`} 
                    alt={user.name} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground transition-colors">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.totalSales} items sold</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-in border-none shadow-lg bg-card/60 backdrop-blur" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-accent" />
            <h3 className="font-display text-xl font-semibold">Top Buyers</h3>
          </div>
          <div className="space-y-3">
            {buyers.map((user, index) => (
              <Link 
                to={`/profile/${user._id}`} 
                key={user._id} 
                className="flex items-center gap-3 group p-3 rounded-xl transition-all duration-300 hover:bg-accent hover:shadow-md hover:scale-[1.02] border border-transparent hover:border-border/50"
              >
                <span className="w-6 text-center font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {index + 1}
                </span>
                <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover:border-accent/50 transition-colors">
                  <AvatarImage 
                    src={user.avatar?.startsWith("http") ? user.avatar : `${API_URL}${user.avatar}`} 
                    alt={user.name} 
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-foreground transition-colors">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.totalPurchases} items bought</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
