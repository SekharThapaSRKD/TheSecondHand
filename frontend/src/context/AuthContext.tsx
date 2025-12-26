import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (form: FormData) => Promise<void>;
  wishlist: string[];
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Uses backend API

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [wishlist, setWishlist] = useState<string[]>([]);

  // On mount, if token exists, try to refresh user and fetch wishlist
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
          } else {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        });
    }
    
    // Fetch wishlist if user exists or just token exists
    if (token) {
        fetch(`${API_URL}/api/auth/wishlist`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(r => r.json())
        .then(data => {
            if (Array.isArray(data)) {
                // if populated, map to IDs, or just store objects?
                // backend /wishlist returns populated objects.
                // let's store IDs for easy checking, or Objects for display?
                // For "My Favorites" page we need objects. For "Heart" button we need IDs.
                // I'll store objects in a separate state if needed, or just map IDs here.
                // Actually the backend endpoint I wrote:
                // GET /wishlist -> populates
                // POST /wishlist -> returns IDs (since I didn't populate)
                // This is inconsistent. I should fix backend or handle both.
                // Let's assume the GET returns objects.
                setWishlist(data.map((item: any) => typeof item === 'object' ? item._id : item));
            }
        })
        .catch(console.error);
    }
  }, [user]); // re-run if user changes (login)

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Login failed");
    const { user: u, token } = data;
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", token);
    toast({ title: "Welcome back!", description: `Logged in as ${u.name}` });
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Signup failed");
      const { user: u, token } = data;
      setUser(u);
      localStorage.setItem("user", JSON.stringify(u));
      localStorage.setItem("token", token);
      toast({ title: "Account created!", description: "Welcome to ThriftHub" });
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setWishlist([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast({ title: "Logged out", description: "See you soon!" });
  }, []);

  const updateProfile = useCallback(async (form: FormData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    } as any);
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Update failed");
    const u = data.user;
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
    toast({ title: "Profile updated" });
  }, []);

  const addToWishlist = useCallback(async (productId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
        toast({ title: "Please login first" });
        return;
    }
    const res = await fetch(`${API_URL}/api/auth/wishlist/${productId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
        setWishlist(prev => [...prev, productId]);
        toast({ title: "Added to favorites" });
    }
  }, []);

  const removeFromWishlist = useCallback(async (productId: string) => {
     const token = localStorage.getItem("token");
    if (!token) return;
    const res = await fetch(`${API_URL}/api/auth/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
        setWishlist(prev => prev.filter(id => id !== productId));
        toast({ title: "Removed from favorites" });
    } 
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile,
        wishlist,
        addToWishlist,
        removeFromWishlist
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
