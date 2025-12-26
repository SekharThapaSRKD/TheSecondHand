import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Loader2, Home, ShoppingBag } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function PaymentSuccess() {
  const loc = useLocation();
  const nav = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const session_id = params.get("session_id");
    const created = params.get("created");
    
    // If order is already created (e.g. COD or Khalti flow), just show success
    if (created === "true") {
      setStatus("success");
      return;
    }
    
    // If no session_id and we are strictly relying on it for this page:
    if (!session_id) {
       // Ideally redirect or show error, but for now let's show error state
       setStatus("error");
       return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      // User needs to be logged in to confirm order
      // In a real app, you might save the session_id and redirect to login, then redirect back
      nav("/login?redirect=payment_success");
      return;
    }

    // Call backend to create order with stripe verification
    fetch(`${API}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        paymentMethod: "stripe",
        paymentResult: { session_id },
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          setStatus("success");
          
          // Clear cart from localStorage to force refresh
          localStorage.removeItem("cart");
          
          // Dispatch events to refresh cart and products
          window.dispatchEvent(new Event("cartUpdated"));
          window.dispatchEvent(new Event("productsUpdated"));
          
          // Optional: clear cart locally if needed, but backend should handle order creation logic
        } else {
          console.error("Order creation failed:", d?.message);
          setStatus("error");
        }
      })
      .catch((e) => {
        console.error("Order verification error:", e);
        setStatus("error");
      });
  }, [loc.search, nav]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground font-medium">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
        <Card className="w-full max-w-md bg-white/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                 {/* Error Icon */}
                 <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
            </div>
            <CardTitle className="text-xl">Something went wrong</CardTitle>
            <CardDescription>We couldn't confirm your order details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => nav("/")} variant="outline" className="w-full">Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success State
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
      <Card className="w-full max-w-md animate-scale-in glass-card border-green-100 dark:border-green-900/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-green-100 p-4 shadow-sm animate-pulse-soft">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-display font-bold text-green-700 dark:text-green-400">Payment Successful!</CardTitle>
          <CardDescription className="text-lg text-balance mt-2">
            Thank you for your purchase. Your order has been confirmed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-xl border border-green-100 dark:border-green-900/20 text-center">
             <p className="text-sm text-green-800 dark:text-green-200">
               A confirmation email has been sent to your registered address.
             </p>
          </div>
          
          <div className="grid gap-3">
            <Button onClick={() => nav("/")} id="home" className="w-full h-11 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200 dark:shadow-none">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
            <Button onClick={() => nav("/search")} variant="outline" className="w-full h-11 border-green-200 hover:bg-green-50 hover:text-green-700 border-2">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
