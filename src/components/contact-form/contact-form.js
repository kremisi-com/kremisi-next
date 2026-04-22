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

export default function ContactForm({}) {
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
      toast.success("Message sent successfully!");
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
  }, [state]);

  return (
    <form className={styles.form} action={formAction}>
      <input type="hidden" name="formStartedAt" value={formStartedAt} />
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
          <h3>What you need</h3>
          <RadioOptions
            ref={serviceRef}
            options={[
              { value: "development", label: "Development" },
              {
                value: "design-development",
                label: "Design & Development",
              },
              {
                value: "data-analytics",
                label: "AI Integration & Data",
              },
              {
                value: "other",
                label: "Other",
              },
            ]}
            name="service"
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h3>Project Budget</h3>
          <RadioOptions
            ref={budgetRef}
            options={[
              { value: "low", label: "< €2k" },
              { value: "medium", label: "€2k - 6k" },
              { value: "high", label: "€6k - 12k" },
              { value: "very-high", label: "€12k+" },
            ]}
            name="budget"
          />
        </div>
        <div className="col">
          <h3>Preferred Timeline</h3>
          <RadioOptions
            ref={deliveryRef}
            options={[
              { value: "1-2", label: "1-2 months" },
              { value: "2-4", label: "2-4 months" },
              { value: "4-6", label: "4-6 months" },
            ]}
            name="delivery"
          />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h3>Details About The Project</h3>
          <textarea
            name="details"
            rows="5"
            placeholder="What are you building? Goals, timeline, current problems, references..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          ></textarea>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h3>Your Contact Details</h3>
        </div>
        <div className="col"></div>
        <div className="col">
          <input
            type="text"
            placeholder="Full Name*"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="col">
          <input
            type="text"
            placeholder="Company"
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
            placeholder="Phone"
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
              I have read and accept the
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
            <GitButton isSubmit={true} disabled={pending || !turnstileToken}>
              {pending ? "Sending..." : "Send"}
            </GitButton>
            <span className={styles.replyNote}>Usually reply within 24h.</span>
          </div>
        </div>
      </div>
    </form>
  );
}
