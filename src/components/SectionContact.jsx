import { ContactForm } from "./ContactForm";
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
}) => {
  return (
    <section id="contact" className={styles.section}>
      <div className={styles.sectionInner}>
        <h2 className={styles.sectionLabel}>{label}</h2>
        <div className={styles.sectionBody}>
          <address className={styles.contactBlock}>
            <a className={styles.contactMail} href={`mailto:${MAIL}`}>
              {MAIL}
            </a>
          </address>
          {hasFormspree && contactFormIntro ? (
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
    </section>
  );
};
