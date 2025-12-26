import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  ShieldCheck,
  LogOut,
  User,
  ShoppingCart,
  MinusCircle,
  PlusCircle,
  Trash2,
  Heart,
  Sun,
  Moon,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, updateQty, removeFromCart } = useCart();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const cartCount = (cart?.items || []).reduce(
    (s, it) => s + (it.quantity || 0),
    0
  );

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 glass">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 duration-200">
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              SecondHand-Store
            </span>
          </Link>

          <div className="hidden md:flex flex-1 ml-6">
             <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">About Us</Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/search")}>
              <Search className="h-5 w-5" />
            </Button>

            {isAuthenticated && (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Cart" id="shopcart">
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5"  />
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white animate-pulse">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 p-2">
                <div className="max-h-64 overflow-auto">
                  {(!cart || !cart.items || cart.items.length === 0) && (
                    <div className="p-4 text-sm text-muted-foreground">
                      Your cart is empty
                    </div>
                  )}
                  {cart.items.map((it) => (
                    <div
                      key={it.product._id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded">
                      <img
                        src={it.product.images?.[0] || ""}
                        alt={it.product.name}
                        className="h-12 w-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm line-clamp-1">
                          {it.product.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          NRs {it.price.toFixed(2)}
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQty(
                                it.product._id,
                                Math.max(1, (it.quantity || 1) - 1)
                              );
                            }}
                            className="p-1">
                            <MinusCircle className="h-4 w-4" />
                          </button>
                          <div className="text-sm">{it.quantity}</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQty(it.product._id, (it.quantity || 1) + 1);
                            }}
                            className="p-1">
                            <PlusCircle className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromCart(it.product._id);
                          }}
                          className="p-1 text-muted-foreground">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-2 pt-2">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <div>Subtotal</div>
                    <div>
                      NRs {(
                        cart?.items?.reduce(
                          (s, it) => s + (it.price || 0) * (it.quantity || 1),
                          0
                        ) || 0
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => navigate("/cart")}
                      className="btn w-full">
                      View Cart
                    </button>
                    <button
                      onClick={() => navigate("/cart")}
                      className="btn w-full" id="checkout">
                      Checkout
                    </button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            )}

            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/sell")} id="sell">
                  <Plus className="mr-1 h-4 w-4" />
                  Sell
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user?.avatar?.startsWith("http") ? user.avatar : `${API_URL}${user?.avatar}`} 
                          alt={user?.name} 
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favorites")}>
                      <Heart className="mr-2 h-4 w-4" />
                      Favorites
                    </DropdownMenuItem>
                    {user?.isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Panel
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut  className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex gap-2">
                <Button id="login" variant="ghost" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button id="signup" onClick={() => navigate("/signup")}>Sign Up</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
