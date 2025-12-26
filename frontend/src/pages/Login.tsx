import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-950 dark:to-indigo-950 px-4">
      <Card className="w-full max-w-md animate-fade-in-up glass-card border-none">
        <CardHeader className="text-center space-y-2">
          <Link
            to="/"
            className="mb-6 inline-block font-display text-4xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300">
            SecondHand-Store
          </Link>
          <CardTitle className="text-3xl font-display font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-base text-balance">
            Sign in to access your curated collection
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-white/50 backdrop-blur-sm border-white/20 focus:bg-white transition-all duration-300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 bg-white/50 backdrop-blur-sm border-white/20 focus:bg-white transition-all duration-300"
              />
            </div>
            <Button type="submit" id="signin" className="w-full h-11 text-base shadow-lg hover:shadow-primary/25 transition-all duration-300" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-primary hover:text-indigo-600 transition-colors">
                Create account
              </Link>
            </p>

          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
