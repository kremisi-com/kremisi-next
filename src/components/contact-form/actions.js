"use server";

import { verifyTurnstileToken } from "@/lib/turnstile";

export async function submitContact(prevState, formData) {
    const getVal = (key) => (formData.get(key) ?? "").toString().trim();
    const MIN_FORM_FILL_TIME_MS = 3000;
    const locale = getVal("locale") === "it" ? "it" : "en";
    const errors = locale === "it"
        ? {
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
        }
        : {
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
        };

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
    const formStartedAt = Number(getVal("formStartedAt"));
    const elapsedMs = Date.now() - formStartedAt;
    const isTooFast =
        !Number.isFinite(formStartedAt) ||
        formStartedAt <= 0 ||
        elapsedMs < MIN_FORM_FILL_TIME_MS;
    const isSpam = Boolean(website) || isTooFast;

    if (isSpam) {
        return { success: true, silentDrop: true };
    }

    const turnstileResult = await verifyTurnstileToken({ token: turnstileToken });

    if (!turnstileResult.success) {
        return {
            success: false,
            error: errors.security,
        };
    }

    if (!privacy) {
        return { success: false, error: errors.privacy };
    }

    // Validazioni

    if (!service) {
        return { success: false, error: errors.service };
    }

    if (!budget) {
        return { success: false, error: errors.budget };
    }

    if (!delivery) {
        return { success: false, error: errors.delivery };
    }

    if (details.length < 5) {
        return {
            success: false,
            error: errors.details,
        };
    }

    if (!name || name.length < 2) {
        return { success: false, error: errors.name };
    }

    if (!email) {
        return { success: false, error: errors.emailRequired };
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
        return { success: false, error: errors.emailInvalid };
    }

    // Telefono opzionale ma, se presente, deve essere plausibile
    if (phone) {
        const phoneRe = /^[+\d\s().-]{6,30}$/;
        if (!phoneRe.test(phone)) {
            return { success: false, error: errors.phone };
        }
    }

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

    try {
        // Invia la richiesta al tuo server PHP
        const response = await fetch("https://api.kremisi.com/send-mail.php", {
            method: "POST",
            body: new URLSearchParams(payload), // invio come form-urlencoded
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
            console.error("Contact form endpoint rejected the request:", result);
            return { success: false, error: errors.send };
        }

        return { success: true, message: result.message ?? null };
    } catch (error) {
        console.error("Error during sending:", error);
        return { success: false, error: errors.send };
    }
}
