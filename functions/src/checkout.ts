import { Request, Response } from "express";
import { getStripe } from "./init"; // Use the centralized Stripe instance

export const createCheckoutSessionHandler = async (req: Request, res: Response) => {
  try {
    const stripe = getStripe(); // Lazily get the Stripe instance
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Financial Report",
            },
            unit_amount: 1000, // $10.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.protocol}://${req.get(
        "host"
      )}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get("host")}/cancel`,
      // TODO: Consider adding the reasoning_audit to the metadata here as well
      // for better tracking, similar to the webhook handler.
      // metadata: {
      //   reasoning_audit: JSON.stringify(your_audit_data_here),
      // },
    });

    res.status(200).send({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).send("Internal Server Error");
  }
};
