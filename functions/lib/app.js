"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sample_data_apis_1 = require("./sample-data-apis");
const checkout_1 = require("./checkout");
const feedback_1 = require("./feedback");
const stripe_sync_1 = require("./stripe-sync");
const stripe_webhooks_1 = require("./stripe-webhooks");
const app = (0, express_1.default)();
exports.app = app;
app.use((0, cors_1.default)({ origin: true }));
app.use((req, res, next) => {
    if (req.path === "/stripe-webhook") {
        express_1.default.raw({ type: "application/json" })(req, res, (err) => {
            if (err) {
                return res.status(400).send("Invalid request body");
            }
            next();
        });
    }
    else {
        express_1.default.json()(req, res, next);
    }
});
app.use("/v1", sample_data_apis_1.sampleDataRouter);
app.post("/v1/create-checkout-session", checkout_1.createCheckoutSessionHandler);
app.post("/stripe-webhook", stripe_webhooks_1.stripeWebhookHandler);
app.get("/reasoning-audit", async (req, res) => {
    const auditData = await (0, feedback_1.getReasoningAudit)();
    res.json(auditData);
});
app.post("/stripe-sync", async (req, res) => {
    try {
        await (0, stripe_sync_1.syncStripeData)(req.body.userId);
        res.status(200).send({ status: "success" });
    }
    catch (error) {
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
