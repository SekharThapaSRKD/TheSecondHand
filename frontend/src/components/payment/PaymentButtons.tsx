import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  amount: number; // amount in smallest currency unit for Stripe (e.g., cents)
  currency?: string;
  name?: string;
  productId?: string;
};

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";
const KHALTI_PUBLIC = import.meta.env.VITE_KHALTI_PUBLIC_KEY || "";

export default function PaymentButtons({
  amount,
  currency = "usd",
  name = "Purchase",
  productId,
}: Props) {
  useEffect(() => {
    // load Khalti script if public key provided
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

  const handleStripeCheckout = async () => {
    try {
      // If buying a single product, add it to cart first so the order can be created on return
      if (productId) {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login to continue");
          return;
        }

        // Add product to cart
        await fetch(`${API}/api/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            productId: productId,
            quantity: 1,
          }),
        });
      }

      const res = await fetch(
        `${API}/api/payments/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, currency, name }),
        }
      );
      const data = await res.json();
      if (data && data.url) {
        // redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session");
      }
    } catch (err) {
      console.error(err);
      alert("Error initiating Stripe checkout");
    }
  };

  const handleKhalti = () => {
    if (!KHALTI_PUBLIC) {
      alert("Khalti public key not configured");
      return;
    }

    // @ts-ignore
    const config = {
      publicKey: KHALTI_PUBLIC,
      productIdentity: "1",
      productName: name,
      productUrl: window.location.href,
      eventHandler: {
        onSuccess(payload: any) {
          // send token to backend to verify
          fetch(`${API}/api/payments/khalti/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: payload.token, amount }),
          })
            .then((r) => r.json())
            .then((d) => {
              console.log("Khalti verify response:", d);
              alert("Payment successful (Khalti)");
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
          // user closed widget
        },
      },
    };

    // @ts-ignore
    const khalti = new window.KhaltiCheckout(config);
    khalti.show({ amount });
  };

  const handleCOD = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to place an order");
      return;
    }

    try {
      let body: any = { paymentMethod: "cod" };
      if (productId) {
         // Single item purchase
         body.items = [{
            product: productId,
            name: name,
            quantity: 1,
            price: amount / 100
         }];
      }

      const res = await fetch(`${API}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = `/payment/success?session_id=cod_manual&created=true`;
      } else {
        alert(data?.message || "Failed to place order");
      }
    } catch (e) {
      console.error(e);
      alert("Error placing order");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button onClick={handleStripeCheckout} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all duration-200">
        Card 
      </Button>
      <Button onClick={handleKhalti} variant="outline" className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300">
        Khalti
      </Button>
      <Button onClick={handleCOD} variant="secondary" className="w-full col-span-2 bg-green-600 hover:bg-green-700 text-white">
        Cash on Delivery
      </Button>
    </div>
  );
}
