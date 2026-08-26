"use server";

import { randomUUID } from "node:crypto";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { sendContactEmail } from "@/lib/contact-email";

const FORM_ERRORS = {
    it: {
        security: "Verifica di sicurezza non riuscita. Ricarica la pagina e riprova.",
        privacy: "Devi accettare la Privacy Policy.",
        service: "Seleziona il servizio richiesto.",
        budget: "Seleziona il budget del progetto.",
        delivery: "Seleziona le tempistiche desiderate.",
        details: "Inserisci almeno 5 caratteri nei dettagli del progetto.",
        name: "Inserisci un nome valido.",
        emailRequired: "Inserisci un indirizzo email.",
        emailInvalid: "Inserisci un indirizzo email valido.",
        phone: "Inserisci un numero di telefono valido.",
        send: "Non è stato possibile inviare il modulo.",
    },
    en: {
        security: "Security check failed. Refresh the page and try again.",
        privacy: "You must accept the privacy policy.",
        service: "Select the service you need.",
        budget: "Select the project budget.",
        delivery: "Select the preferred timeline.",
        details: "Enter at least 5 characters in the project details.",
        name: "Enter a valid name.",
        emailRequired: "Enter an email address.",
        emailInvalid: "Invalid email.",
        phone: "Invalid phone number.",
        send: "Unable to send the form",
    },
};

function createRequestId() {
    return `contact-${Date.now()}-${randomUUID().slice(0, 8)}`;
}

function validationFailure(requestId, field, error) {
    console.warn("[ContactEmail] Validation failed.", { requestId, field });
    return { success: false, error };
}

export async function submitContact(prevState, formData) {
    const requestId = createRequestId();
    let locale = "en";
    let stage = "request-received";

    console.info("[ContactEmail] Request received.", { requestId });

    try {
        const getVal = (key) => (formData.get(key) ?? "").toString().trim();
        locale = getVal("locale") === "it" ? "it" : "en";
        const errors = FORM_ERRORS[locale];

        const service = getVal("service");
        const budget = getVal("budget");
        const delivery = getVal("delivery");
        const details = getVal("details");
        const name = getVal("name");
        const company = getVal("company");
        const email = getVal("email");
        const phone = getVal("phone");
        const privacy = getVal("privacy") === "on";
        const website = getVal("website");
        const turnstileToken = getVal("cf-turnstile-response");

        // Turnstile already evaluates automated traffic. A minimum completion time
        // can silently discard legitimate submissions completed with autofill.
        if (website) {
            console.warn("[ContactEmail] Honeypot triggered; submission discarded.", {
                requestId,
            });
            return { success: true, silentDrop: true };
        }

        stage = "turnstile-verification";
        console.info("[ContactEmail] Turnstile verification started.", {
            requestId,
            tokenPresent: Boolean(turnstileToken),
        });
        const turnstileResult = await verifyTurnstileToken({
            token: turnstileToken,
            requestId,
        });

        if (!turnstileResult.success) {
            console.warn("[ContactEmail] Turnstile verification failed.", {
                requestId,
                reason: turnstileResult.reason,
                errorCodes: turnstileResult.errorCodes,
            });
            return { success: false, error: errors.security };
        }

        console.info("[ContactEmail] Turnstile verification passed.", { requestId });

        stage = "form-validation";
        if (!privacy) {
            return validationFailure(requestId, "privacy", errors.privacy);
        }

        if (!service) {
            return validationFailure(requestId, "service", errors.service);
        }

        if (!budget) {
            return validationFailure(requestId, "budget", errors.budget);
        }

        if (!delivery) {
            return validationFailure(requestId, "delivery", errors.delivery);
        }

        if (details.length < 5) {
            return validationFailure(requestId, "details", errors.details);
        }

        if (!name || name.length < 2) {
            return validationFailure(requestId, "name", errors.name);
        }

        if (!email) {
            return validationFailure(requestId, "email-required", errors.emailRequired);
        }

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
            return validationFailure(requestId, "email-invalid", errors.emailInvalid);
        }

        // Telefono opzionale ma, se presente, deve essere plausibile
        if (phone) {
            const phoneRe = /^[+\d\s().-]{6,30}$/;
            if (!phoneRe.test(phone)) {
                return validationFailure(requestId, "phone", errors.phone);
            }
        }

        console.info("[ContactEmail] Validation passed.", { requestId });

        // Se tutto ok, costruisci il payload (stringhe)
        const payload = {
            service,
            budget,
            delivery,
            details,
            name,
            company,
            email,
            phone,
        };

        stage = "resend-send";
        const emailId = await sendContactEmail(payload, { requestId });
        console.info("[ContactEmail] Email accepted by Resend.", {
            requestId,
            emailId,
        });
        return { success: true };
    } catch (error) {
        console.error("[ContactEmail] Unexpected error:", {
            requestId,
            stage,
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
        });
        return { success: false, error: FORM_ERRORS[locale].send };
    }
}
