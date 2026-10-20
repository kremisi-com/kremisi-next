"use client";

import RadioOptions from "@/components/radio-options/radio-options";
import styles from "./contact-form.module.css";
import { submitContact } from "@/components/contact-form/actions";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import GitButton from "../git-button/git-button";
import toast from "react-hot-toast";
import Script from "next/script";
import Turnstile from "@/components/turnstile/turnstile";
import { appendOpenAIAdsContext } from "@/lib/openai-ads-browser.mjs";
import {
  trackViewContactForm,
  trackContactFormStart,
  trackLead,
} from "@/lib/analytics";

const COPY = {
  en: {
    success: "Message sent successfully!",
    serviceTitle: "What you need",
    information: "Information",
    services: [
      "Development",
      "Design & Development",
      "AI Integration & Data",
      "Other",
    ],
    budgetTitle: "Project Budget",
    timelineTitle: "Preferred Timeline",
    timelines: ["1-2 months", "2-4 months", "4-6 months"],
    detailsTitle: "Details About The Project",
    messageTitle: "Enter your message",
    messagePlaceholder: "How can we help you?",
    detailsPlaceholder:
      "What are you building? Goals, timeline, current problems, references...",
    contactsTitle: "Your Contact Details",
    name: "Full Name*",
    company: "Company",
    phone: "Phone",
    privacy: "I have read and accept the",
    submit: "Request Proposal",
    sending: "Sending...",
    reply: "Usually reply within 24h.",
    automationTitle: "Your process and the tools you use",
    optional: "optional",
    automationPlaceholder: "Tell us about a repetitive task, the tools you use and where things get stuck.",
    automationSubmit: "Send your request",
    automationSuccess: "Thank you. Your request has been sent. We'll contact you to discuss your process.",
    securityUnavailable: "The form is currently unavailable. You can write to info@kremisi.com.",
  },
  it: {
    success: "Richiesta inviata con successo!",
    serviceTitle: "Di cosa hai bisogno",
    information: "Informazioni",
    services: ["Sviluppo", "Design e sviluppo", "AI e Data", "Altro"],
    budgetTitle: "Budget del progetto",
    timelineTitle: "Tempistiche",
    timelines: ["1–2 mesi", "2–4 mesi", "4–6 mesi"],
    detailsTitle: "Dettagli del progetto",
    messageTitle: "Inserisci il Messaggio",
    messagePlaceholder: "Come possiamo aiutarti?",
    detailsPlaceholder:
      "Cosa vuoi realizzare? Obiettivi, tempistiche, esigenze attuali, riferimenti...",
    contactsTitle: "I tuoi contatti",
    name: "Nome e cognome*",
    company: "Azienda",
    phone: "Telefono",
    privacy: "Ho letto e accetto la",
    submit: "Invia la richiesta",
    sending: "Invio in corso...",
    reply: "Rispondiamo solitamente entro 24 ore lavorative.",
    automationTitle: "Il processo e gli strumenti che usi",
    optional: "opzionale",
    automationPlaceholder: "Raccontaci un'attività ripetitiva, gli strumenti che usi e dove il lavoro si blocca.",
    automationSubmit: "Invia la richiesta",
    automationSuccess: "Grazie, la tua richiesta è stata inviata. Ti ricontatteremo per approfondire il tuo processo.",
    securityUnavailable: "Il modulo non è al momento disponibile. Puoi scriverci a info@kremisi.com.",
  },
};

async function submitContactWithAds(prevState, formData) {
  appendOpenAIAdsContext(formData);
  return submitContact(prevState, formData);
}

export default function ContactForm({ locale = "en", variant = "default" }) {
  const copy = COPY[locale] || COPY.en;
  const isAutomation = variant === "automation";
  const formRef = useRef(null);
  const formStarted = useRef(false);
  const statusId = useId();
  const submissionId = useRef(null);
  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    submissionId.current ||= crypto.randomUUID();
    formData.set("submissionId", submissionId.current);
    try {
      return await submitContactWithAds(prevState, formData);
    } catch {
      // A lost response can follow provider acceptance. Keep the intent and
      // fields so retry uses the same email/conversion idempotency key.
      return { success: false, error: locale === "it"
        ? "Non è stato possibile inviare il modulo."
        : "Unable to send the form" };
    }
  }, {
    success: null,
    error: null,
  });

  // valori controllati per i campi testuali
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [service, setService] = useState("information");
  const isInformation = service === "information";
  const [turnstileToken, setTurnstileToken] = useState("");

  const serviceRef = useRef();
  const budgetRef = useRef();
  const deliveryRef = useRef();
  const turnstileRef = useRef(null);

  useEffect(() => {
    if (!isAutomation || !window.IntersectionObserver) {
      trackViewContactForm();
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        trackViewContactForm();
        observer.disconnect();
      }
    });
    observer.observe(formRef.current);
    return () => observer.disconnect();
  }, [isAutomation]);

  useEffect(() => {
    if (state?.success) {
      submissionId.current = null;
      toast.success(copy.success);
      const submittedService = isAutomation ? "information" : serviceRef.current?.getValue?.() || "unknown";
      if (!state?.silentDrop) {
        trackLead({
          service: submittedService,
          budget: submittedService === "information"
            ? "not-applicable"
            : budgetRef.current?.getValue?.() || "unknown",
          delivery: submittedService === "information"
            ? "not-applicable"
            : deliveryRef.current?.getValue?.() || "unknown",
          form_location: isAutomation ? "automation_landing" : "contacts",
        }, state.openaiAds);
      }
      // reset radio options
      serviceRef.current?.reset();
      budgetRef.current?.reset();
      deliveryRef.current?.reset();
      formStarted.current = false;
      // reset campi testuali
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setDetails("");
      setPrivacyAccepted(false);
      setTurnstileToken("");
      turnstileRef.current?.reset?.();
    }

    if (state?.error && !state.success) {
      toast.error(state.error);
      turnstileRef.current?.reset?.();
    }

    if (state?.message) {
      console.log(state.message);
    }
  }, [copy.success, isAutomation, state]);

  return (
    <form
      ref={formRef}
      className={`${styles.form} ${isAutomation ? styles.automation : ""}`}
      action={formAction}
      aria-busy={pending}
      aria-describedby={isAutomation ? statusId : undefined}
      onFocusCapture={isAutomation ? () => {
        if (!formStarted.current) {
          trackContactFormStart();
          formStarted.current = true;
        }
      } : undefined}
    >
      <input type="hidden" name="locale" value={locale} />
      {isAutomation && <input type="hidden" name="source" value="automation_landing" />}
      <input
        type="hidden"
        name="cf-turnstile-response"
        value={turnstileToken}
        readOnly
      />
      <input
        type="text"
        name="krs_x9q4"
        defaultValue=""
        readOnly
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        data-1p-ignore="true"
        data-lpignore="true"
        data-bwignore="true"
        style={{
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      {isAutomation ? <input type="hidden" name="service" value="information" /> : <div className="row">
        <div className="col">
          <h3>{copy.serviceTitle}</h3>
          <RadioOptions
            ref={serviceRef}
            options={[
              { value: "information", label: copy.information },
              { value: "development", label: copy.services[0] },
              {
                value: "design-development",
                label: copy.services[1],
              },
              {
                value: "data-analytics",
                label: copy.services[2],
              },
              {
                value: "other",
                label: copy.services[3],
              },
            ]}
            name="service"
            defaultValue="information"
            onChange={setService}
            required
          />
        </div>
      </div>}
      {!isAutomation && <>
      <div
        className={`${styles.projectOptions} ${!isInformation ? styles.projectOptionsVisible : ""}`}
        aria-hidden={isInformation}
        inert={isInformation}
      >
        <fieldset className={styles.projectFields} disabled={isInformation}>
          <div className="row">
            <div className="col">
              <h3>{copy.budgetTitle}</h3>
              <RadioOptions
                ref={budgetRef}
                options={[
                  { value: "low", label: "< €2k" },
                  { value: "medium", label: "€2k – 6k" },
                  { value: "high", label: "€6k – 12k" },
                  { value: "very-high", label: "€12k+" },
                ]}
                name="budget"
                required={!isInformation}
              />
            </div>
            <div className="col">
              <h3>{copy.timelineTitle}</h3>
              <RadioOptions
                ref={deliveryRef}
                options={[
                  { value: "1-2", label: copy.timelines[0] },
                  { value: "2-4", label: copy.timelines[1] },
                  { value: "4-6", label: copy.timelines[2] },
                ]}
                name="delivery"
                required={!isInformation}
              />
            </div>
          </div>
        </fieldset>
      </div>
      </>}
      <div className="row">
        <div className="col">
          <h3>
            <span key={isInformation ? "message" : "project"} className={styles.detailsTitle}>
              {isAutomation ? <label htmlFor={`${statusId}-details`}>{copy.automationTitle}*</label> : isInformation ? copy.messageTitle : copy.detailsTitle}
            </span>
          </h3>
          <textarea
            id={`${statusId}-details`}
            name="details"
            aria-label={isAutomation ? copy.automationTitle : isInformation ? copy.messageTitle : copy.detailsTitle}
            rows="5"
            placeholder={isAutomation ? copy.automationPlaceholder : isInformation ? copy.messagePlaceholder : copy.detailsPlaceholder}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            minLength={5}
            required
          ></textarea>
        </div>
      </div>
      <div className={`row ${isAutomation ? styles.contactFields : ""}`}>
        <div className="col">
          <h3>{copy.contactsTitle}</h3>
        </div>
        <div className="col"></div>
        <div className="col">
          {isAutomation && <label htmlFor={`${statusId}-name`}>{copy.name}</label>}
          <input
            type="text"
            id={`${statusId}-name`}
            placeholder={isAutomation ? undefined : copy.name}
            name="name"
            aria-label={copy.name}
            autoComplete="name"
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="col">
          {isAutomation && <label htmlFor={`${statusId}-company`}>{copy.company} ({copy.optional})</label>}
          <input
            type="text"
            id={`${statusId}-company`}
            placeholder={isAutomation ? undefined : copy.company}
            name="company"
            aria-label={copy.company}
            autoComplete="organization"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="col">
          {isAutomation && <label htmlFor={`${statusId}-email`}>Email*</label>}
          <input
            type="email"
            id={`${statusId}-email`}
            placeholder={isAutomation ? undefined : "Email*"}
            name="email"
            aria-label="Email"
            autoComplete="email"
            value={email}
            onFocus={isAutomation ? undefined : () => trackContactFormStart()}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="col">
          {isAutomation && <label htmlFor={`${statusId}-phone`}>{copy.phone} ({copy.optional})</label>}
          <input
            type="tel"
            id={`${statusId}-phone`}
            placeholder={isAutomation ? undefined : copy.phone}
            name="phone"
            aria-label={copy.phone}
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="row">
        <div className="col mb-0">
          <label className={styles.privacyConsent}>
            <input
              type="checkbox"
              name="privacy"
              checked={privacyAccepted}
              onChange={(event) => setPrivacyAccepted(event.target.checked)}
              required
              style={{ paddingRight: "12px" }}
            />
            <span style={{ marginLeft: 10, marginRight: 10 }}>
              {copy.privacy}
            </span>
            <a
              href="https://www.iubenda.com/privacy-policy/87027585"
              className="iubenda-white iubenda-noiframe iubenda-embed"
              title="Privacy Policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Privacy Policy
            </a>
            <Script
              strategy="lazyOnload"
              src="https://cdn.iubenda.com/iubenda.js"
            />
          </label>
        </div>
      </div>
      <div className="row">
        <div className="col mb-0">
          <Turnstile
            ref={turnstileRef}
            className={styles.turnstile}
            onTokenChange={setTurnstileToken}
            unavailableMessage={isAutomation ? copy.securityUnavailable : undefined}
            size={isAutomation ? "compact" : "normal"}
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className={styles.submitWrapper}>
            <GitButton
              isSubmit={true}
              submitText={pending ? copy.sending : isAutomation ? copy.automationSubmit : copy.submit}
              disabled={pending || !turnstileToken}
            />
            {!isAutomation && <span className={styles.replyNote}>{copy.reply}</span>}
          </div>
        </div>
      </div>
      {isAutomation && <p id={statusId} role="status" aria-live="polite" className={styles.status}>
        {state?.error || (state?.success ? copy.automationSuccess : "")}
      </p>}
    </form>
  );
}
