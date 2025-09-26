"use client";

import RadioOptions from "@/components/radio-options/radio-options";
import styles from "./contact-form.module.css";
import { submitContact } from "@/components/contact-form/actions";
import { useActionState, useEffect, useRef } from "react";
import GitButton from "../git-button/git-button";
import toast from "react-hot-toast";
import { RecaptchaWrapper } from "./recaptcha-wrapper";
import PrivacyLinks from "./privacy-links";
import Script from "next/script";

export default function ContactForm({}) {
  const [state, formAction, pending] = useActionState(submitContact, {
    success: null,
    error: null,
  });

  const serviceRef = useRef();
  const budgetRef = useRef();
  const deliveryRef = useRef();

  useEffect(() => {
    if (state && state.success) toast.success("Message sent successfully!");
    if (state && state.error && !state.success) toast.error(state.error);
    if (state && state.message) console.log(state.message);

    serviceRef.current.reset();
    budgetRef.current.reset();
    deliveryRef.current.reset();
  }, [state]);

  return (
    <form className={styles.form} action={formAction}>
      <RecaptchaWrapper action={"contact_form"} />
      <div className="row">
        <div className="col">
          <h3>What you need</h3>
          <RadioOptions
            ref={serviceRef}
            options={[
              { value: "development", label: "Development" },
              {
                value: "design",
                label: "Design & Development",
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
              { value: "low", label: "€2-6k" },
              { value: "medium", label: "€6-10k" },
              { value: "high", label: "€10-16k" },
              { value: "very-high", label: "€16k+" },
            ]}
            name="budget"
          />
        </div>
        <div className="col">
          <h3>Delivery Date</h3>
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
            placeholder="Write as many details as possible"
          ></textarea>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <h3>Contact Info</h3>
        </div>
        <div className="col"></div>
        <div className="col">
          <input type="text" placeholder="Full Name" name="name" />
        </div>
        <div className="col">
          <input type="text" placeholder="Company" name="company" />
        </div>
        <div className="col">
          <input type="email" placeholder="Email" name="email" />
        </div>
        <div className="col">
          <input type="tel" placeholder="Phone" name="phone" />
        </div>
      </div>
      <div className="row">
        <div className="col">
          <label className="privacy-consent" style={{ fontSize: "14px" }}>
            <input
              type="checkbox"
              name="privacy"
              required
              style={{ marginRight: "8px" }}
            />
            I have read and accept the{" "}
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
        <div className="col">
          <GitButton isSubmit={true} disabled={pending}>
            {pending ? "Sending..." : "Send"}
          </GitButton>
        </div>
      </div>
    </form>
  );
}
