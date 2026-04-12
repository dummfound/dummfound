import { useEffect, useState } from "react";
import styles from "../styles.module.scss";

const formId = import.meta.env.VITE_FORMSPREE_FORM_ID?.trim();

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export const ContactForm = ({
  nameLabel,
  emailLabel,
  messageLabel,
  submitLabel,
  sendingLabel,
  successMessage,
  errorMessage,
  helperText,
  validationSummary,
  errorEmailRequired,
  errorEmailInvalid,
  errorMessageRequired,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [messageBlurred, setMessageBlurred] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (status !== "success" && status !== "error") return undefined;
    const id = window.setTimeout(() => setStatus("idle"), 7000);
    return () => window.clearTimeout(id);
  }, [status]);

  const emailTrim = email.trim();
  const messageTrim = message.trim();
  const emailOk = emailTrim.length > 0 && isValidEmail(emailTrim);
  const messageOk = messageTrim.length > 0;
  const isFormValid = emailOk && messageOk;

  useEffect(() => {
    if (isFormValid) {
      setSubmitAttempted(false);
    }
  }, [isFormValid]);

  const showEmailError =
    emailBlurred && (!emailTrim ? true : !isValidEmail(emailTrim));
  const showMessageError = messageBlurred && !messageTrim;

  const showSummary = !isFormValid && submitAttempted;

  if (!formId) {
    return null;
  }

  const action = `https://formspree.io/f/${formId}`;

  const resetFormState = () => {
    setName("");
    setEmail("");
    setMessage("");
    setEmailBlurred(false);
    setMessageBlurred(false);
    setSubmitAttempted(false);
  };

  const clearSubmitStatus = () => {
    if (status === "success" || status === "error") {
      setStatus("idle");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setSubmitAttempted(true);
      setEmailBlurred(true);
      setMessageBlurred(true);
      return;
    }
    setStatus("sending");
    const form = e.currentTarget;
    try {
      const res = await fetch(action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setStatus("success");
        resetFormState();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <form
      className={styles.contactForm}
      onSubmit={handleSubmit}
      noValidate
    >
      <input type="hidden" name="_subject" value="DUMMFOUND — сайт" />
      {!isFormValid && status !== "success" ? (
        <p className={styles.contactFormHelper}>{helperText}</p>
      ) : null}
      <div className={styles.contactField}>
        <label className={styles.contactLabel} htmlFor="contact-name">
          {nameLabel}
        </label>
        <input
          id="contact-name"
          className={styles.contactInput}
          type="text"
          name="name"
          autoComplete="name"
          value={name}
          onChange={(e) => {
            clearSubmitStatus();
            setName(e.target.value);
          }}
        />
      </div>
      <div className={styles.contactField}>
        <label className={styles.contactLabel} htmlFor="contact-email">
          {emailLabel}
        </label>
        <input
          id="contact-email"
          className={`${styles.contactInput} ${showEmailError ? styles.contactInputInvalid : ""}`}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            clearSubmitStatus();
            setEmail(e.target.value);
          }}
          onBlur={() => setEmailBlurred(true)}
          aria-invalid={showEmailError}
          aria-describedby={
            showEmailError ? "contact-email-error" : undefined
          }
        />
        {showEmailError ? (
          <p id="contact-email-error" className={styles.contactFieldError}>
            {!emailTrim ? errorEmailRequired : errorEmailInvalid}
          </p>
        ) : null}
      </div>
      <div className={styles.contactField}>
        <label className={styles.contactLabel} htmlFor="contact-message">
          {messageLabel}
        </label>
        <textarea
          id="contact-message"
          className={`${styles.contactTextarea} ${showMessageError ? styles.contactInputInvalid : ""}`}
          name="message"
          rows={5}
          value={message}
          onChange={(e) => {
            clearSubmitStatus();
            setMessage(e.target.value);
          }}
          onBlur={() => setMessageBlurred(true)}
          aria-invalid={showMessageError}
          aria-describedby={
            showMessageError ? "contact-message-error" : undefined
          }
        />
        {showMessageError ? (
          <p id="contact-message-error" className={styles.contactFieldError}>
            {errorMessageRequired}
          </p>
        ) : null}
      </div>
      <input
        type="text"
        name="_gotcha"
        tabIndex={-1}
        autoComplete="off"
        className={styles.contactHoneypot}
        aria-hidden="true"
      />
      {showSummary ? (
        <p
          className={styles.contactValidationSummary}
          role="alert"
          id="contact-form-summary"
        >
          {validationSummary}
        </p>
      ) : null}
      <button
        type="submit"
        className={styles.contactSubmit}
        disabled={status === "sending"}
        aria-describedby={
          !isFormValid && showSummary ? "contact-form-summary" : undefined
        }
      >
        {status === "sending" ? sendingLabel : submitLabel}
      </button>
      {status === "success" || status === "error" ? (
        <p className={styles.gigsType} role="status" aria-live="polite">
          {status === "success" ? successMessage : errorMessage}
        </p>
      ) : null}
    </form>
  );
};
