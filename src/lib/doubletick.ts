const DOUBLETICK_API_URL = "https://public.doubletick.io/whatsapp/message/template";
const DOUBLETICK_CONFIRM_TEMPLATE = process.env.DOUBLETICK_CONFIRM_TEMPLATE ?? "onam_2026_confirmation_message_v4";

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/** {{1}} name, {{2}} branch, {{3}} vehicle, {{4}} VIN, {{5}} confirmation URL */
export type ConfirmPlaceholders = [
  name: string,
  branch: string,
  vehicle: string,
  vin: string,
  confirmationUrl: string,
];

async function callDoubleTick(
  phone: string,
  templateName: string,
  placeholders: string[]
): Promise<SendResult> {
  const apiKey = process.env.DOUBLETICK_API_KEY;

  if (!apiKey) {
    await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));
    if (Math.random() < 0.05) throw new Error("DoubleTick mock: simulated transient failure");
    const messageId = `mock_${Math.random().toString(36).slice(2, 10)}`;
    console.log(`[DoubleTick Mock] → ${phone} | tpl=${templateName} | vars=`, placeholders);
    return { success: true, messageId };
  }

  const body = {
    messages: [
      {
        to: phone,
        from: process.env.DOUBLETICK_FROM ?? "",
        content: {
          templateName,
          language: "en",
          templateData: {
            body: { placeholders },
          },
        },
      },
    ],
  };

  const res = await fetch(DOUBLETICK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(`DoubleTick API ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = JSON.parse(text || "{}");
  const msg = data?.messages?.[0];
  // DoubleTick returns HTTP 200 even when delivery enqueue fails
  if (msg?.status === "FAILED" || msg?.errorMessage) {
    throw new Error(msg.errorMessage || `DoubleTick status FAILED`);
  }

  return {
    success: true,
    messageId: msg?.messageId ?? msg?.id ?? data?.id,
  };
}

export async function sendWhatsAppMessage(
  phone: string,
  templateName: string,
  placeholders: ConfirmPlaceholders
): Promise<SendResult> {
  return callDoubleTick(phone, templateName, placeholders);
}

export { DOUBLETICK_CONFIRM_TEMPLATE };
