const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const axios = require("axios");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Create a Stripe Checkout Session
router.post("/stripe/create-checkout-session", async (req, res) => {
  try {
    const {
      amount,
      currency = "usd",
      name = "Purchase",
      quantity = 1,
    } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name },
            unit_amount: Math.round(amount),
          },
          quantity,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/payment/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(
      "Stripe checkout create error:",
      err && err.message ? err.message : err
    );
    res.status(500).json({ message: "Failed to create checkout session" });
  }
});

// Khalti verification endpoint
router.post("/khalti/verify", async (req, res) => {
  try {
    const { token, amount } = req.body;
    const KHALTI_SECRET = process.env.KHALTI_SECRET_KEY;
    if (!KHALTI_SECRET)
      return res.status(500).json({ message: "Khalti secret not configured" });
    if (!token || !amount)
      return res.status(400).json({ message: "Missing token or amount" });

    const url = "https://khalti.com/api/v2/payment/verify/";
    const payload = { token, amount };

    const response = await axios.post(url, payload, {
      headers: { Authorization: `Key ${KHALTI_SECRET}` },
    });

    // Khalti returns 200 for successful verification
    if (response && response.data) {
      return res.json({ ok: true, data: response.data });
    }

    res.status(500).json({ message: "Khalti verification failed" });
  } catch (err) {
    console.error(
      "Khalti verify error:",
      err && err.response ? err.response.data : err.message || err
    );
    res.status(500).json({ message: "Khalti verification error" });
  }
});

module.exports = router;
