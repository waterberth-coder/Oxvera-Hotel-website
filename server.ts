import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  // CORS middleware to allow requests from any frontend domain
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: "50mb" })); // Support large base64 uploads
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Base64 upload endpoint to optimize Firestore document sizes and boost site performance
  app.post("/api/upload-base64", async (req, res) => {
    try {
      const { base64Data } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: "Missing image data" });
      }

      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ error: "Invalid base64 format" });
      }

      const imageBuffer = Buffer.from(matches[2], 'base64');
      const extension = matches[1].split('/')[1] || 'jpg';

      // Ensure uploads directory exists
      const fs = await import("fs");
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${extension}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      fs.writeFileSync(filePath, imageBuffer);

      // Construct absolute public URL
      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : req.protocol;
      const url = `${protocol}://${host}/uploads/${uniqueFilename}`;

      return res.json({ success: true, url });
    } catch (err: any) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: err.message });
    }
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
    const { createServer: createViteServer } = await import("vite");
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
