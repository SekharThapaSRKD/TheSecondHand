import React, { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, ShoppingBag, CreditCard, ArrowLeft, Wallet, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import PaymentButtons from "@/components/payment/PaymentButtons";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const KHALTI_PUBLIC = import.meta.env.VITE_KHALTI_PUBLIC_KEY || "";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (KHALTI_PUBLIC) {
      const id = "khalti-js";
      if (!document.getElementById(id)) {
        const s = document.createElement("script");
        s.id = id;
        s.src = "https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.17.0.0.0/khalti-checkout.iffe.js";
        s.async = true;
        document.body.appendChild(s);
      }
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full border-0 shadow-lg">
            <div className="p-12 text-center space-y-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Sign In to Checkout</h2>
                <p className="text-muted-foreground">Please sign in to complete your purchase</p>
              </div>
              <Button size="lg" onClick={() => navigate("/login")} className="w-full">Sign In</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const checkoutCOD = async () => {
    if (!isAuthenticated) return alert("Please login to place order");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paymentMethod: "cod" }),
      });
      const data = await res.json();
      if (res.ok) {
        clearCart();
        navigate("/payment/success?session_id=cod_manual&created=true");
      } else {
        alert(data?.message || "Failed to place order");
      }
    } catch (e) {
      console.error(e);
      alert("Error placing order");
    }
  };

  const checkoutStripe = async () => {
    if (!isAuthenticated) return alert("Please login to checkout");
    try {
      const amount = Math.round(cart.total * 100);
      const res = await fetch(
        `${API}/api/payments/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency: "usd", name: "Order" }),
        }
      );
      const d = await res.json();
      if (d?.url) window.location.href = d.url;
      else alert("Failed to create checkout");
    } catch (e) {
      console.error(e);
      alert("Error creating checkout");
    }
  };

  const checkoutKhalti = () => {
    if (!isAuthenticated) return alert("Please login to checkout");
    if (!KHALTI_PUBLIC) {
      alert("Khalti public key not configured");
      return;
    }

    const amount = Math.round(cart.total * 100); // Khalti expects paisa (cents equivalent)

    // @ts-ignore
    const config = {
      publicKey: KHALTI_PUBLIC,
      productIdentity: "cart_checkout",
      productName: "Cart Checkout",
      productUrl: window.location.href,
      eventHandler: {
        onSuccess(payload: any) {
          // 1. Verify Payment
          fetch(`${API}/api/payments/khalti/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: payload.token, amount }),
          })
            .then((r) => r.json())
            .then((d) => {
              if (d?.ok) {
                 // 2. Create Order
                 const token = localStorage.getItem("token");
                 fetch(`${API}/api/orders`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ paymentMethod: "khalti" }),
                 })
                 .then(r => r.json())
                 .then(orderData => {
                     if (orderData?.ok) {
                        clearCart();
                        navigate("/payment/success?session_id=khalti_" + payload.idx + "&created=true");
                     } else {
                        alert("Payment verified but failed to create order: " + orderData.message);
                     }
                 })
              } else {
                 alert("Khalti verification failed");
              }
            })
            .catch((e) => {
              console.error(e);
              alert("Khalti verification failed");
            });
        },
        onError(err: any) {
          console.error("Khalti error", err);
          alert("Khalti payment error");
        },
        onClose() {
          console.log("widget is closing");
        },
      },
    };

    // @ts-ignore
    const khalti = new window.KhaltiCheckout(config);
    khalti.show({ amount });
  };

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4">
          <Card className="max-w-md w-full border-0 shadow-lg">
            <div className="p-12 text-center space-y-6">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto opacity-50" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
                <p className="text-muted-foreground">Add some items to get started shopping</p>
              </div>
              <Button size="lg" onClick={() => navigate("/search")} className="w-full">Continue Shopping</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-5xl mx-auto p-4 md:p-6">
      <div className="mb-6 space-y-4">
        <Button variant="ghost" className="p-0 hover:bg-transparent text-muted-foreground hover:text-primary" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-7 h-7" /> Your Cart
        </h1>
      </div>

      {cart.items.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button className="mt-4" onClick={() => navigate("/search")}>Continue Shopping</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CART ITEMS */}
          <div className="md:col-span-2 space-y-4">
            {cart.items.map((it) => (
              <Card key={it.product._id} className="shadow-sm">
                <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4">
                  <div className="flex-1">
                    <div className="font-semibold text-lg">
                      {it.product.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      NRs {it.price} per item
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {it.product.clothType && (
                        <span>{it.product.clothType.replace('-', ' ')}</span>
                      )}
                      {it.product.size && (
                        <span> • Size: {it.product.size}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        NRs {(it.price * it.quantity).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Qty: {it.quantity}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFromCart(it.product._id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* SUMMARY */}
          <Card className="h-fit sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Items</span>
                <span>{cart.items.length}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>NRs {cart.total.toFixed(2)}</span>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={checkoutStripe}>
                  <CreditCard className="w-4 h-4" /> Pay with Card
                </Button>
                <Button
                  className="w-full gap-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300 text-purple-600"
                  variant="outline"
                  onClick={checkoutKhalti}>
                  <Wallet className="w-4 h-4" /> Pay with Khalti
                </Button>
                <Button
                  className="w-full gap-2"
                  onClick={checkoutCOD}
                  variant="secondary" id="cod">
                  <Banknote className="w-4 h-4" /> Cash on Delivery
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
