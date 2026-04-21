"use server";

import { verifyTurnstileToken } from "@/lib/turnstile";

export async function submitContact(prevState, formData) {
    const getVal = (key) => (formData.get(key) ?? "").toString().trim();
    const MIN_FORM_FILL_TIME_MS = 3000;

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
            error: "Security check failed. Refresh the page and try again.",
        };
    }

    if (!privacy) {
        return { success: false, error: "You must accept the privacy policy." };
    }

    // Validazioni

    if (details && details.length < 5) {
        return {
            success: false,
            error: "Details too short (minimum 5 characters).",
        };
    }

    if (!name || name.length < 2) {
        return { success: false, error: "Enter a valid name." };
    }

    if (!email) {
        return { success: false, error: "Enter an email address." };
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
        return { success: false, error: "Invalid email." };
    }

    // Telefono opzionale ma, se presente, deve essere plausibile
    if (phone) {
        const phoneRe = /^[+\d\s().-]{6,30}$/;
        if (!phoneRe.test(phone)) {
            return { success: false, error: "Invalid phone number." };
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

        const result = await response.json();
        console.log("Risposta da PHP:", result);

        return { success: result.success, message: result.message ?? null };
    } catch (error) {
        console.error("Error during sending:", error);
        return { success: false, error: "Unable to send the form" };
    }
}
