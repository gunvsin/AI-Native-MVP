
import express from "express";
import cors from "cors";
import { sampleDataRouter } from "./sample-data-apis";
import { createCheckoutSessionHandler } from "./checkout";
import { getReasoningAudit } from "./feedback";
import { syncStripeData } from "./stripe-sync";
import { stripeWebhookHandler } from "./stripe-webhooks";

const app = express();

app.use(cors({ origin: true }));

app.use((req, res, next) => {
  if (req.path === "/stripe-webhook") {
    express.raw({ type: "application/json" })(req, res, (err) => {
      if (err) {
        return res.status(400).send("Invalid request body");
      }
      next();
    });
  } else {
    express.json()(req, res, next);
  }
});

app.use("/v1", sampleDataRouter);
app.post("/v1/create-checkout-session", createCheckoutSessionHandler);
app.post("/stripe-webhook", stripeWebhookHandler as any);

app.get("/reasoning-audit", async (req, res) => {
  const auditData = await getReasoningAudit();
  res.json(auditData);
});

app.post("/stripe-sync", async (req, res) => {
  try {
    await syncStripeData(req.body.userId);
    res.status(200).send({ status: "success" });
  } catch (error: any) {
    console.error("Stripe Sync Failed:", error);
    res.status(500).send({ status: "error", message: error.message });
  }
});

app.get("/api/config/theme", (req, res) => {
    res.json({
        colors: {
            primary: "#FFCC00",
            on_surface: "#1B1C1C",
            success: "#27AE60"
        }
    });
});

export { app };
