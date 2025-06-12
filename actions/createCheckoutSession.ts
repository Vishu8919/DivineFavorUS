"use server";
import stripe from "@/lib/stripe";
import { urlFor } from "@/sanity/lib/image";
import { CartItem } from "@/store";
import Stripe from "stripe";

export interface Metadata {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  clerkUserId: string;
}

interface CartItems {
  products: CartItem["product"];
  quantity: number;
}

export async function createCheckoutSession(
  items: CartItem[],
  metadata: Metadata
) {
  try {
    // Validate inputs
    if (!items.length) {
      throw new Error("Cart is empty");
    }
    if (!metadata.orderNumber || !metadata.customerEmail || !metadata.clerkUserId) {
      throw new Error("Missing required metadata fields");
    }

          const customers = await stripe.customers.list({
        email: metadata.customerEmail,
        limit: 1,
      });

      let customerId = "";

      if (customers.data.length > 0) {
        const customer = customers.data[0];

        // ✅ Ensure email is attached to the Stripe customer
        if (!customer.email) {
          await stripe.customers.update(customer.id, {
            email: metadata.customerEmail,
          });
        }

        customerId = customer.id;
      }

    const sessionPayload: Stripe.Checkout.SessionCreateParams = {
      metadata: {
        orderNumber: String(metadata.orderNumber),
        customerName: String(metadata.customerName || "Unknown"),
        customerEmail: String(metadata.customerEmail),
        clerkUserId: String(metadata.clerkUserId),
      },
      mode: "payment",
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      invoice_creation: {
        enabled: true,
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&orderNumber=${metadata.orderNumber}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,

      shipping_address_collection: {
    allowed_countries: ["US", "CA", "IN"], // You can add more countries
  },

      line_items: items.map((item) => {
        if (!item.product._id) {
          throw new Error(`Missing product ID for item: ${item.product.name || "Unknown"}`);
        }
        if (!item.product.price) {
          throw new Error(`Missing price for product: ${item.product.name || "Unknown"}`);
        }

        return {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(item.product.price * 100),
            product_data: {
              name: item.product.name || "Unnamed Product",
              description: item.product.description || undefined,
              metadata: { id: item.product._id },
              images:
                item.product.images && item.product.images.length > 0
                  ? [urlFor(item.product.images[0]).url()]
                  : undefined,
            },
          },
          quantity: item.quantity || 1,
        };
      }),
    };

    if (customerId) {
      sessionPayload.customer = customerId;
    } else {
      sessionPayload.customer_email = metadata.customerEmail;
    }

    console.log("Creating Checkout Session with payload:", JSON.stringify(sessionPayload, null, 2));

    const session = await stripe.checkout.sessions.create(sessionPayload);
    return session.url;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error creating checkout session:", {
        message: error.message,
        stack: error.stack,
        items: items.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
        })),
        metadata,
      });
      throw new Error(`Failed to create checkout session: ${error.message}`);
    } else {
      console.error("Unknown error creating checkout session:", error);
      throw new Error("Failed to create checkout session: Unknown error occurred.");
    }
  }
}
