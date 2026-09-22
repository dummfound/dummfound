import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
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
  const titleId = useId();
  const [formOpen, setFormOpen] = useState(false);

  useEffect(() => {
    if (!formOpen) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event) => {
      if (event.key === "Escape") setFormOpen(false);
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [formOpen]);

  const drawer =
    hasFormspree && formOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className={`${styles.contactDrawerLayer} ${styles.contactDrawerLayerOpen}`}
          >
            <button
              type="button"
              className={`${styles.contactDrawerBackdrop} ${styles.isVisible}`}
              aria-label={contactFormToggleClose}
              onClick={() => setFormOpen(false)}
            />
            <div
              id="contact-form-panel"
              className={`${styles.contactDrawer} ${styles.contactDrawerOpen}`}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <header className={styles.contactDrawerChrome}>
                <h3 id={titleId} className={styles.contactDrawerTitle}>
                  {contactFormToggleOpen}
                </h3>
                <button
                  type="button"
                  className={styles.contactDrawerClose}
                  aria-label={contactFormToggleClose}
                  onClick={() => setFormOpen(false)}
                >
                  <svg
                    className={styles.contactDrawerCloseIcon}
                    viewBox="0 0 16 16"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      d="M3.2 3.2l9.6 9.6M12.8 3.2L3.2 12.8"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </header>
              <div className={styles.contactDrawerBody}>
                {contactFormIntro ? (
                  <p className={styles.contactFormIntro}>{contactFormIntro}</p>
                ) : null}
                <ContactForm
                  wide
                  onSuccess={() => setFormOpen(false)}
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
          </div>,
          document.body
        )
      : null;

  return (
    <section
      id="contact"
      className={`${styles.section} ${styles.sectionContact}`}
      data-section="contact"
      data-theme="gray"
    >
      <div className={styles.contactLayout}>
        <div className={styles.sectionTop}>
          <span className={styles.sectionSquare} aria-hidden="true" />
          <h2 className={styles.contactSectionLabel}>
            {label}
          </h2>
        </div>
        {/* Desktop: badge-height bridge glues label into the contact panel */}
        <div className={styles.contactBridge} aria-hidden="true" />

        <address className={styles.contactPanel}>
          {contactFormIntro ? (
            <p className={styles.contactLead}>{contactFormIntro}</p>
          ) : null}

          <div className={styles.contactActions}>
            <a className={styles.contactMail} href={`mailto:${MAIL}`}>
              <IosMailIcon className={styles.contactMailIcon} />
              <span className={styles.contactMailText}>{MAIL}</span>
            </a>

            {hasFormspree ? (
              <button
                type="button"
                className={styles.contactFormToggle}
                aria-expanded={formOpen}
                aria-controls="contact-form-panel"
                onClick={() => setFormOpen(true)}
              >
                <span>{contactFormToggleOpen}</span>
              </button>
            ) : null}
          </div>
        </address>

        <div className={styles.contactFill} aria-hidden="true" />
      </div>
      {drawer}
    </section>
  );
};
