import "server-only";

import { Resend } from "resend";

function singleLine(value) {
  return value.replace(/\s+/g, " ").trim();
}

function maskEmailAddress(value) {
  const atIndex = value.lastIndexOf("@");

  if (atIndex <= 0) {
    return "[invalid-or-redacted]";
  }

  return `${value.slice(0, 1)}***${value.slice(atIndex)}`;
}

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function buildContactEmailText({
  service,
  budget,
  delivery,
  details,
  name,
  company,
  email,
  phone,
}) {
  return [
    "Nuova richiesta di contatto da kremisi.com",
    "",
    `Servizio: ${service}`,
    `Budget: ${budget}`,
    `Tempistiche: ${delivery}`,
    "",
    "Dettagli:",
    details,
    "",
    `Nome: ${name}`,
    `Azienda: ${company || "Non specificata"}`,
    `Email: ${email}`,
    `Telefono: ${phone || "Non specificato"}`,
  ].join("\n");
}

export async function sendContactEmail(payload, { requestId } = {}) {
  let stage = "configuration";

  try {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    console.info(
      `[ContactEmail] RESEND_API_KEY configured: ${Boolean(apiKey)}`,
      { requestId },
    );

    if (!apiKey) {
      throw new Error("Missing required environment variable: RESEND_API_KEY");
    }

    const from = requireEnv("RESEND_FROM_EMAIL");
    const to = requireEnv("CONTACT_EMAIL_TO");
    const safeName = singleLine(payload.name);
    const subject = `Nuovo contatto Kremisi — ${safeName}`;
    const resend = new Resend(apiKey);

    console.info("[ContactEmail] Email routing configured.", {
      requestId,
      from,
      to: maskEmailAddress(to),
      subject: "Nuovo contatto Kremisi — [redacted-name]",
    });

    stage = "resend-api-call";
    console.info("[ContactEmail] Starting Resend API call.", { requestId });

    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: payload.email,
      subject,
      text: buildContactEmailText(payload),
    });

    console.info("[ContactEmail] Resend response received.", {
      requestId,
      dataReturned: Boolean(data),
      errorReturned: Boolean(error),
    });

    if (error) {
      console.error("[ContactEmail] Resend returned an error.", {
        requestId,
        error,
      });
      const providerError = [error.name, error.message].filter(Boolean).join(": ");
      throw new Error(
        `Resend rejected the contact email: ${providerError || "unknown_error"}`,
        { cause: error },
      );
    }

    if (!data?.id) {
      throw new Error("Resend accepted the request without returning an email ID.");
    }

    console.info("[ContactEmail] Resend returned email data.", {
      requestId,
      emailId: data.id,
    });

    return data.id;
  } catch (error) {
    console.error("[ContactEmail] Email send exception.", {
      requestId,
      stage,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
