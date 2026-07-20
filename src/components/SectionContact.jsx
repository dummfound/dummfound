import { useEffect, useRef, useState } from "react";
import { ContactForm } from "./ContactForm";
import { IosMailIcon } from "./IosMailIcon";
import styles from "../styles.module.scss";

const MAIL = "dummfound@gmail.com";

const hasFormspree = Boolean(import.meta.env.VITE_FORMSPREE_FORM_ID?.trim());

export const SectionContact = ({
  label,
  contactFormName,
  contactFormEmail,
  contactFormMessage,
  contactFormSubmit,
  contactFormSending,
  contactFormSuccess,
  contactFormError,
  contactFormHelper,
  contactFormValidationSummary,
  contactFormErrorEmailRequired,
  contactFormErrorEmailInvalid,
  contactFormErrorMessageRequired,
  contactFormIntro,
  contactFormToggleOpen,
  contactFormToggleClose,
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const formPanelRef = useRef(null);

  useEffect(() => {
    if (!formOpen || !formPanelRef.current) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(
      () => {
        formPanelRef.current?.scrollIntoView({
          behavior: reduced ? "auto" : "smooth",
          block: "end",
          inline: "nearest",
        });
      },
      reduced ? 0 : 200
    );

    return () => window.clearTimeout(id);
  }, [formOpen]);

  return (
    <section id="contact" className={`${styles.section} ${styles.sectionContact}`}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionLabel}>{label}</h2>
        <div className={styles.sectionBody}>
          <address
            className={`${styles.contactBlock} ${formOpen ? styles.contactBlockOpen : ""}`}
          >
            <a className={styles.contactMail} href={`mailto:${MAIL}`}>
              <IosMailIcon className={styles.contactMailIcon} />
              <span className={styles.contactMailText}>{MAIL}</span>
            </a>
            {hasFormspree ? (
              <button
                type="button"
                className={`${styles.contactFormToggle} ${formOpen ? styles.contactFormToggleOpen : ""}`}
                aria-expanded={formOpen}
                aria-controls="contact-form-panel"
                onClick={() => setFormOpen((open) => !open)}
              >
                <span>
                  {formOpen ? contactFormToggleClose : contactFormToggleOpen}
                </span>
                <svg
                  className={styles.contactFormToggleIcon}
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M4 6l4 4 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : null}
          </address>
          {hasFormspree ? (
            <div
              ref={formPanelRef}
              id="contact-form-panel"
              className={`${styles.contactFormPanel} ${formOpen ? styles.contactFormPanelOpen : ""}`}
              aria-hidden={!formOpen}
            >
              <div className={styles.contactFormPanelInner}>
                {contactFormIntro ? (
                  <p className={styles.contactFormIntro}>{contactFormIntro}</p>
                ) : null}
                <ContactForm
                  nameLabel={contactFormName}
                  emailLabel={contactFormEmail}
                  messageLabel={contactFormMessage}
                  submitLabel={contactFormSubmit}
                  sendingLabel={contactFormSending}
                  successMessage={contactFormSuccess}
                  errorMessage={contactFormError}
                  helperText={contactFormHelper}
                  validationSummary={contactFormValidationSummary}
                  errorEmailRequired={contactFormErrorEmailRequired}
                  errorEmailInvalid={contactFormErrorEmailInvalid}
                  errorMessageRequired={contactFormErrorMessageRequired}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
