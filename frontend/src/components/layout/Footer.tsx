import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Github, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t bg-background pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3 lg:gap-16">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                SecondHand-Store
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your premium destination for buying and selling pre-loved fashion. 
              Sustainable, secure, and stylish.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/search" className="hover:text-primary transition-colors">Browse Items</Link>
              </li>
              <li>
                <Link to="/sell" className="hover:text-primary transition-colors">Start Selling</Link>
              </li>
              <li>
                <Link to="/search?category=men" className="hover:text-primary transition-colors">Men's Fashion</Link>
              </li>
              <li>
                <Link to="/search?category=women" className="hover:text-primary transition-colors">Women's Fashion</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-primary transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">Safety Guidelines</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Newsletter</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to get updates on new arrivals and special offers.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                Join
              </button>
            </form>
          </div> */}
        </div>

        <div className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-1">
            © {new Date().getFullYear()} SecondHand-Store
          </p>
        </div>
      </div>
    </footer>
  );
};
