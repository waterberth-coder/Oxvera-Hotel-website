import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/send-email-receipt", (req, res) => {
    try {
      const { email, roomName, checkIn, checkOut, sessionId, totalPrice, currency } = req.body;
      
      console.log(`[Firebase Cloud Function - sendEmailReceipt] Dispatching digital receipt to: ${email}`);
      console.log(`Details: ${roomName} | Stay: ${checkIn} to ${checkOut} | Reference: ${sessionId}`);
      console.log(`Financials: ${totalPrice} ${currency}`);

      return res.json({ 
        success: true, 
        message: "Receipt dispatched successfully via Cloud Function emulation." 
      });
    } catch (err: any) {
      console.error("Error in Cloud Function emulation:", err);
      return res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const { roomId, roomName, pricePerNight, nights, checkIn, checkOut, userId } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Oxvera Hotel - ${roomName}`,
                description: `Stay from ${checkIn} to ${checkOut}`,
              },
              unit_amount: Math.round(pricePerNight * 100),
            },
            quantity: nights,
          },
        ],
        mode: "payment",
        success_url: `${process.env.APP_URL || 'http://localhost:3000'}/booking-success?session_id={CHECKOUT_SESSION_ID}&roomId=${roomId}&userId=${userId}&checkIn=${checkIn}&checkOut=${checkOut}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/rooms`,
        metadata: {
          roomId,
          userId,
          checkIn,
          checkOut,
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe session creation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
