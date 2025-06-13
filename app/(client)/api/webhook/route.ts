import { Metadata } from "@/actions/createCheckoutSession";
import stripe from "@/lib/stripe";
import { backendClient } from "@/sanity/lib/backendClient";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { notifyAdminOnSlack } from "@/lib/notifications";



export async function POST(req: NextRequest) {
  console.log("🟢 Webhook: Request received");
  const body = await req.text();
  const headersList = await headers();
  const sig = headersList.get("stripe-signature");
  console.log("🔵 Webhook: Stripe-Signature Header:", sig);

  if (!sig) {
    console.log("Missing stripe signature");
    return NextResponse.json(
      { error: "No Signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_KEY;

  if (!webhookSecret) {
    console.log("Stripe webhook secret is not set");
    return NextResponse.json(
      { error: "Stripe webhook secret is not set" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log("🟢 Webhook: Event Type:", event.type);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Webhook signature verification failed:", error.message);
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      );
    } else {
      console.error("Webhook verification failed with unknown error:", error);
      return NextResponse.json(
        { error: "Webhook Error: Unknown error occurred." },
        { status: 400 }
      );
    }
  }

  if (event.type === "checkout.session.completed") {
    console.log("🟢 Webhook: checkout.session.completed detected");
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("Handling checkout.session.completed for session:", session.id);
    const shipping = session.shipping_details?.address;

    const invoice = session.invoice
      ? await stripe.invoices.retrieve(session.invoice as string)
      : null;

    try {
      const createdOrder = await createOrderInsanity(session, invoice);
      console.log("Order created in Sanity:", createdOrder._id);
      return NextResponse.json({ received: true, orderId: createdOrder._id });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error creating order in Sanity:", {
          message: error.message,
        });
        return NextResponse.json(
          { error: `Error creating order: ${error.message}` },
          { status: 400 }
        );
      } else {
        console.error("Unknown error creating order:", error);
        return NextResponse.json(
          { error: "Error creating order: Unknown error occurred." },
          { status: 400 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}

async function createOrderInsanity(
  session: Stripe.Checkout.Session,
  invoice: Stripe.Invoice | null
) {
  const {
    id,
    amount_total,
    currency,
    metadata,
    payment_intent,
    total_details,
    customer,
    collected_information,
  } = session;

  const shipping_details = collected_information?.shipping_details || null;

  const {
    orderNumber,
    customerName,
    customerEmail,
    clerkUserId,
  } = metadata as unknown as Metadata;

  console.log("Webhook: Creating order with metadata:", {
    orderNumber,
    customerName,
    customerEmail,
    clerkUserId,
    stripeCustomerId: customer,
  });

  if (!customer) {
    console.error("Webhook: Missing Stripe customer ID");
    throw new Error("Missing Stripe customer ID in checkout session");
  }

  const lineItemsWithProduct = await stripe.checkout.sessions.listLineItems(id, {
    expand: ["data.price.product"],
  });

  const sanityProducts = lineItemsWithProduct.data.map((item) => {
    const productId = (item.price?.product as Stripe.Product)?.metadata?.id;
    if (!productId) {
      console.error("Webhook: Missing productId for item:", item);
      throw new Error(`Missing productId in Stripe metadata for item: ${item.description}`);
    }
    return {
      _key: crypto.randomUUID(),
      _type: "object",
      product: {
        _type: "reference",
        _ref: productId,
      },
      quantity: item.quantity || 1,
    };
  });

  if (!sanityProducts.length) {
    console.error("Webhook: No valid products in line items");
    throw new Error("No valid products found in checkout session");
  }

  console.log("🔍 Stripe Shipping Details:", JSON.stringify(shipping_details, null, 2));

  // Always create a shippingInfo object, even if some fields are empty
  const shippingInfo = {
    _type: "object",
    name: shipping_details?.name || "",
    line1: shipping_details?.address?.line1 || "",
    line2: shipping_details?.address?.line2 || "",
    city: shipping_details?.address?.city || "",
    state: shipping_details?.address?.state || "",
    postal_code: shipping_details?.address?.postal_code || "",
    country: shipping_details?.address?.country || "",
  };

  if (!shipping_details?.address) {
    console.warn("⚠️ Shipping details missing from Stripe session");
  }


  const orderData = {
    _type: "order",
    orderNumber,
    stripeCheckoutSessionId: id,
    stripePaymentIntentId: typeof payment_intent === "string" ? payment_intent : payment_intent?.id,
    customerName,
    stripeCustomerId: typeof customer === "string" ? customer : customer?.id,
    clerkUserId,
    email: customerEmail,
    currency: currency || "usd",
    amountDiscount: total_details?.amount_discount
      ? total_details.amount_discount / 100
      : 0,
    products: sanityProducts,
    totalPrice: amount_total ? amount_total / 100 : 0,
    status: "paid",
    orderDate: new Date().toISOString(),
    invoice: invoice
      ? {
          _type: "object",
          id: invoice.id,
          number: invoice.number,
          hosted_invoice_url: invoice.hosted_invoice_url,
        }
      : undefined,
     shipping: shippingInfo,
  };

  console.log("Webhook: Order data to be created:", JSON.stringify(orderData, null, 2));

  try {
    const order = await backendClient.create(orderData);
    console.log("Webhook: Order created successfully:", order._id);

    await notifyAdminOnSlack({
  orderId: order._id,
  customerName,
  email: customerEmail,
  total: amount_total ? amount_total / 100 : 0,
});

    return order;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Webhook: Failed to create order in Sanity:", {
        message: error.message,
        orderData,
      });
      throw new Error(`Failed to create order in Sanity: ${error.message}`);
    } else {
      console.error("Webhook: Unknown error creating order in Sanity:", error);
      throw new Error("Failed to create order in Sanity: Unknown error occurred.");
    }
  }
}
