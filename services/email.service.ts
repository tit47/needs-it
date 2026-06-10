import { getDefaultFromEmail, getResendClient } from "@/lib/resend";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export type SendEmailResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; skipped?: boolean };

export async function sendEmail(
  input: SendEmailInput
): Promise<SendEmailResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY missing — email skipped:", input.subject);
    return { ok: false, error: "Resend non configuré.", skipped: true };
  }

  try {
    const resend = getResendClient();
    const { data, error } = await resend.emails.send({
      from: getDefaultFromEmail(),
      to: input.to,
      subject: input.subject,
      html: input.html,
    });

    if (error) {
      console.error("[email] send failed:", error);
      return { ok: false, error: error.message ?? "Échec d'envoi." };
    }

    return { ok: true, id: data?.id };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erreur inattendue d'envoi.";
    console.error("[email] unexpected error:", message);
    return { ok: false, error: message };
  }
}
