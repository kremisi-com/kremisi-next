"use server";

export async function submitContact(prevState, formData) {
  const getVal = (key) => (formData.get(key) ?? "").toString().trim();

  const service = getVal("service");
  const budget = getVal("budget");
  const delivery = getVal("delivery");
  const details = getVal("details");
  const name = getVal("name");
  const company = getVal("company");
  const email = getVal("email");
  const phone = getVal("phone");
  const privacy = getVal("privacy") === "on";
  console.log("privacy", getVal("privacy"));

  if (!privacy) {
    return { success: false, error: "You must accept the privacy policy." };
  }

  // Validazioni
  if (!service) {
    return { success: false, error: "Select a service." };
  }

  if (!budget) {
    return { success: false, error: "Enter a budget." };
  }

  if (!delivery) {
    return {
      success: false,
      error: "Specify the expected delivery date.",
    };
  }

  if (!details || details.length < 5) {
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

  const rawFormData = Object.fromEntries(formData);
  const recaptchaResponse = await fetch(
    `https://recaptchaenterprise.googleapis.com/v1/projects/kremisi-projects/assessments?key=${String(
      process.env.GOOGLE_API_KEY
    )}`,
    {
      method: "POST",
      body: JSON.stringify({
        event: {
          token: rawFormData.recaptchaToken,
          expectedAction: "contact_form",
          siteKey: "6LfIhdUrAAAAAPaGq52hPAQeAfWLtHGVeb3M9mQc",
        },
      }),
    }
  );
  const recaptchaData = await recaptchaResponse.json();
  console.log("Recaptcha data", JSON.stringify(recaptchaData, null, 2));

  if (
    !recaptchaData?.riskAnalysis?.score ||
    recaptchaData?.tokenProperties?.valid !== true
  ) {
    console.log("Recaptcha failed", JSON.stringify(recaptchaData, null, 2));
    return {
      success: false,
      error: "Recaptcha failed.",
      message: JSON.stringify(recaptchaData, null, 2),
    };
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
