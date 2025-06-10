import { backendClient } from "../sanity/lib/backendClient.js";

const sampleProductId = "5c957ecc-dd2a-419d-851c-97f209e2301b";

backendClient
  .create({
    _type: "order",
    orderNumber: "TEST123",
    stripeCustomerId: "cus_test",
    clerkUserId: "user_test",
    customerName: "Test User",
    email: "test@example.com",
    stripePaymentIntentId: "pi_test",
    products: sampleProductId
      ? [
          {
            _key: crypto.randomUUID(),
            _type: "object",
            product: {
              _type: "reference",
              _ref: sampleProductId,
            },
            quantity: 1,
          },
        ]
      : [],
    totalPrice: 100,
    currency: "usd",
    amountDiscount: 0,
    status: "paid",
    orderDate: new Date().toISOString(),
  })
  .then((result) => console.log("Order created:", JSON.stringify(result, null, 2)))
  .catch((error) => console.error("Error creating order:", error.message, error.details));