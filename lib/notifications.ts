// lib/notifications.ts
export async function notifyAdminOnSlack({
  orderId,
  customerName,
  email,
  total,
}: {
  orderId: string;
  customerName: string;
  email: string;
  total: number;
}) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("⚠️ Slack webhook URL is missing in .env");
    return;
  }

  const message = {
    text: `🛒 *New Order Placed!*\n• Order ID: ${orderId}\n• Customer: ${customerName}\n• Email: ${email}\n• Total: $${total.toFixed(
      2
    )}`,
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}
