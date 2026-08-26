"use client";

import RadioOptions from "@/components/radio-options/radio-options";
import styles from "./contact-form.module.css";
import { submitContact } from "@/components/contact-form/actions";
import { useActionState, useEffect, useRef, useState } from "react";
import GitButton from "../git-button/git-button";
import toast from "react-hot-toast";
import Script from "next/script";
import Turnstile from "@/components/turnstile/turnstile";
import {
  trackViewContactForm,
  trackContactFormStart,
  trackLead,
} from "@/lib/analytics";

const COPY = {
  en: {
    success: "Message sent successfully!",
    serviceTitle: "What you need",
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
  },
  it: {
    success: "Richiesta inviata con successo!",
    serviceTitle: "Di cosa hai bisogno",
    services: ["Sviluppo", "Design e sviluppo", "AI e Data", "Altro"],
    budgetTitle: "Budget del progetto",
    timelineTitle: "Tempistiche",
    timelines: ["1–2 mesi", "2–4 mesi", "4–6 mesi"],
    detailsTitle: "Dettagli del progetto",
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
  },
};

export default function ContactForm({ locale = "en" }) {
  const copy = COPY[locale] || COPY.en;
  const [state, formAction, pending] = useActionState(submitContact, {
    success: null,
    error: null,
  });

  // valori controllati per i campi testuali
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [formStartedAt] = useState(() => Date.now().toString());

  const serviceRef = useRef();
  const budgetRef = useRef();
  const deliveryRef = useRef();
  const turnstileRef = useRef(null);

  useEffect(() => {
    trackViewContactForm();
  }, []);

  useEffect(() => {
    if (state?.success) {
      toast.success(copy.success);
      if (!state?.silentDrop) {
        trackLead({
          service: serviceRef.current?.getValue?.() || "unknown",
          budget: budgetRef.current?.getValue?.() || "unknown",
          delivery: deliveryRef.current?.getValue?.() || "unknown",
        });
      }
      // reset radio options
      serviceRef.current.reset();
      budgetRef.current.reset();
      deliveryRef.current.reset();
      // reset campi testuali
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setDetails("");
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
  }, [copy.success, state]);

  return (
    <form className={styles.form} action={formAction}>
      <input type="hidden" name="formStartedAt" value={formStartedAt} />
      <input type="hidden" name="locale" value={locale} />
      <input
        type="hidden"
        name="cf-turnstile-response"
        value={turnstileToken}
        readOnly
      />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
      <div className="row">
        <div className="col">
          <h3>{copy.serviceTitle}</h3>
          <RadioOptions
            ref={serviceRef}
            options={[
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
            required
          />
        </div>
      </div>
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
            required
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
            required
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h3>{copy.detailsTitle}</h3>
          <textarea
            name="details"
            rows="5"
            placeholder={copy.detailsPlaceholder}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            minLength={5}
            required
          ></textarea>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h3>{copy.contactsTitle}</h3>
        </div>
        <div className="col"></div>
        <div className="col">
          <input
            type="text"
            placeholder={copy.name}
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="col">
          <input
            type="text"
            placeholder={copy.company}
            name="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="col">
          <input
            type="email"
            placeholder="Email*"
            name="email"
            value={email}
            onFocus={() => trackContactFormStart()}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="col">
          <input
            type="tel"
            placeholder={copy.phone}
            name="phone"
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
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div className={styles.submitWrapper}>
            <GitButton
              isSubmit={true}
              submitText={pending ? copy.sending : copy.submit}
              disabled={pending || !turnstileToken}
            />
            <span className={styles.replyNote}>{copy.reply}</span>
          </div>
        </div>
      </div>
    </form>
  );
}
