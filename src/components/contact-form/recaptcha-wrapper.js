"use client";

import Script from "next/script";

export function RecaptchaWrapper({ action }) {
    const executeRecaptcha = () => {
        if (typeof grecaptcha !== "undefined") {
            grecaptcha.enterprise.ready(async () => {
                try {
                    const token = await grecaptcha.enterprise.execute(
                        "6LfIhdUrAAAAAPaGq52hPAQeAfWLtHGVeb3M9mQc",
                        { action }
                    );
                    const tokenInput =
                        document.getElementById("recaptcha-token");
                    if (tokenInput) tokenInput.value = token;
                } catch (e) {
                    console.error("Recaptcha error", e);
                }
            });
        }
    };

    return (
        <>
            <Script
                src="https://www.google.com/recaptcha/enterprise.js?render=6LfIhdUrAAAAAPaGq52hPAQeAfWLtHGVeb3M9mQc"
                strategy="afterInteractive"
                onLoad={executeRecaptcha}
            />
            <input type="hidden" name="recaptchaToken" id="recaptcha-token" />
        </>
    );
}
