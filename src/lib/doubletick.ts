export async function sendWhatsAppMessage(phone: string, templateName: string, variables: Record<string, string>) {
  // Simulate network latency (200ms - 800ms)
  const latency = Math.floor(Math.random() * 600) + 200;
  await new Promise((resolve) => setTimeout(resolve, latency));

  // Simulate a 5% failure rate for testing retries
  const shouldFail = Math.random() < 0.05;

  if (shouldFail) {
    throw new Error("DoubleTick API simulated network timeout or 500 error");
  }

  // Generate a mock message ID
  const messageId = `msg_${Math.random().toString(36).substring(2, 15)}`;

  console.log(`[DoubleTick Mock] Sent WhatsApp message to ${phone}`);
  console.log(`[DoubleTick Mock] Template: ${templateName}`);
  console.log(`[DoubleTick Mock] Variables:`, variables);
  console.log(`[DoubleTick Mock] Message ID: ${messageId}`);

  return {
    success: true,
    messageId,
  };
}
