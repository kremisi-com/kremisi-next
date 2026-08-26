import "server-only";

import { Resend } from "resend";

function requireEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function singleLine(value) {
  return value.replace(/\s+/g, " ").trim();
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

export async function sendContactEmail(payload) {
  const resend = new Resend(requireEnv("RESEND_API_KEY"));
  const from = requireEnv("RESEND_FROM_EMAIL");
  const to = requireEnv("CONTACT_EMAIL_TO");
  const safeName = singleLine(payload.name);

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: payload.email,
    subject: `Nuovo contatto Kremisi — ${safeName}`,
    text: buildContactEmailText(payload),
  });

  if (error) {
    const providerError = [error.name, error.message].filter(Boolean).join(": ");
    throw new Error(
      `Resend rejected the contact email: ${providerError || "unknown_error"}`,
    );
  }

  if (!data?.id) {
    throw new Error("Resend accepted the request without returning an email ID.");
  }

  return data.id;
}
