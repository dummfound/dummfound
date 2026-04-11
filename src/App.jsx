import { useLayoutEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Hero } from "./components/Hero";
import { SectionAbout } from "./components/SectionAbout";
import { SectionBooking } from "./components/SectionBooking";
import { SectionContact } from "./components/SectionContact";
import { SectionGigs } from "./components/SectionGigs";
import { SectionMusic } from "./components/SectionMusic";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { SkipLink } from "./components/SkipLink";
import { useLanguage } from "./hooks/useLanguage";
import { useNavMenu } from "./hooks/useNavMenu";
import { useTheme } from "./hooks/useTheme";

const ALLOWED_PATHS = new Set([
  "/",
  "/about",
  "/music",
  "/booking",
  "/gigs",
  "/contact",
]);

const useScrollToSection = (pathname, enabled) => {
  useLayoutEffect(() => {
    if (!enabled) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const smooth = reduced ? "instant" : "smooth";

    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    const id = pathname.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: smooth, block: "start" });
  }, [pathname, enabled]);
};

const App = () => {
  const location = useLocation();
  const pathOk = ALLOWED_PATHS.has(location.pathname);
  useScrollToSection(location.pathname, pathOk);

  const { lang, setLang, t, navLinks, socialLinks } = useLanguage();
  const { menuOpen, closeMenu, toggleMenu } = useNavMenu();
  const { theme, toggleTheme } = useTheme();

  if (!pathOk) {
    return <Navigate to="/" replace />;
  }

  const {
    skip,
    logoAria,
    navAria,
    langGroup,
    themeToggle,
    themeDark,
    themeLight,
    menu,
    drawerBackdrop,
    heroIntro,
    aboutLabel,
    aboutP,
    musicLabel,
    releases,
    bookingLabel,
    bookingP,
    bookingCta,
    formatLabel,
    formatVal,
    geoLabel,
    geoVal,
    contactLabel,
    contactFormIntro,
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
    footerInstagramDisclaimer,
    gigsLabel,
    gigs,
  } = t;

  return (
    <>
      <SkipLink>{skip}</SkipLink>

      <SiteHeader
        logoAria={logoAria}
        navAria={navAria}
        langGroup={langGroup}
        menuLabel={menu}
        drawerBackdropLabel={drawerBackdrop}
        navLinks={navLinks}
        lang={lang}
        onSetLang={setLang}
        theme={theme}
        onToggleTheme={toggleTheme}
        themeToggleLabel={themeToggle}
        themeDarkLabel={themeDark}
        themeLightLabel={themeLight}
        menuOpen={menuOpen}
        onCloseMenu={closeMenu}
        onToggleMenu={toggleMenu}
      />

      <main id="main">
        <Hero introLabel={heroIntro} />

        <SectionAbout label={aboutLabel} body={aboutP} />

        <SectionMusic label={musicLabel} releases={releases} />

        <SectionBooking
          label={bookingLabel}
          lead={bookingP}
          ctaLabel={bookingCta}
          formatLabel={formatLabel}
          formatValue={formatVal}
          geoLabel={geoLabel}
          geoValue={geoVal}
        />

        <SectionGigs label={gigsLabel} gigs={gigs} />

        <SectionContact
          label={contactLabel}
          socialLinks={socialLinks}
          contactFormIntro={contactFormIntro}
          contactFormName={contactFormName}
          contactFormEmail={contactFormEmail}
          contactFormMessage={contactFormMessage}
          contactFormSubmit={contactFormSubmit}
          contactFormSending={contactFormSending}
          contactFormSuccess={contactFormSuccess}
          contactFormError={contactFormError}
          contactFormHelper={contactFormHelper}
          contactFormValidationSummary={contactFormValidationSummary}
          contactFormErrorEmailRequired={contactFormErrorEmailRequired}
          contactFormErrorEmailInvalid={contactFormErrorEmailInvalid}
          contactFormErrorMessageRequired={contactFormErrorMessageRequired}
        />
      </main>

      <SiteFooter instagramDisclaimer={footerInstagramDisclaimer} />
    </>
  );
};

export default App;
