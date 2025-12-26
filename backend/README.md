# Backend for Second Chance Bazaar

This backend is a simple Express + Mongoose server intended to support the frontend in this repo.

Quick start (PowerShell):

```powershell
cd backend
npm install
copy .env.example .env
# (edit .env to configure MONGODB_URI and JWT_SECRET if needed)
npm run dev
```

If you don't have MongoDB locally, you can use Docker:

```powershell
docker run -d -p 27017:27017 --name thrift-mongo mongo:6
```

Default admin credentials created automatically on first successful DB connection:

- email: `admin@thrift.com`
- password: `adminpass`

## Payment integration

This backend includes endpoints for Stripe Checkout and Khalti verification.

- Configure `STRIPE_SECRET_KEY` and `KHALTI_SECRET_KEY` in your `backend/.env` (see `.env.example`).
- Configure `FRONTEND_URL` to where your frontend is running (used for Stripe redirect URLs).

Endpoints

- `POST /api/payments/stripe/create-checkout-session` — body: `{ amount, currency, name }` returns `{ url }` to redirect to Stripe Checkout.
- `POST /api/payments/khalti/verify` — body: `{ token, amount }` verifies Khalti payment on the server.
