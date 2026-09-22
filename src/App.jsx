import { useLayoutEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { GigPage } from "./components/GigPage";
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
import { useLenis } from "./hooks/useLenis";
import { useNavMenu } from "./hooks/useNavMenu";

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

    // Wait for menu close animation before jumping (nav links set this).
    const delay = Number(sessionStorage.getItem("df-nav-delay") || 0);
    sessionStorage.removeItem("df-nav-delay");

    const go = () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      if (pathname === "/") {
        window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        return;
      }
      const id = pathname.slice(1);
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({
        behavior: reduced ? "instant" : "smooth",
        block: "start",
      });
    };

    if (delay > 0) {
      const id = window.setTimeout(go, delay);
      return () => window.clearTimeout(id);
    }
    go();
    return undefined;
  }, [pathname, enabled]);
};

const HomePage = () => {
  const location = useLocation();
  const pathOk = ALLOWED_PATHS.has(location.pathname);
  useLenis();
  useScrollToSection(location.pathname, pathOk);

  const { lang, setLang, t, navLinks, socialLinks } = useLanguage();
  const { menuOpen, closeMenu, toggleMenu } = useNavMenu();

  if (!pathOk) {
    return <Navigate to="/" replace />;
  }

  const {
    skip,
    logoAria,
    navAria,
    langGroup,
    menu,
    drawerBackdrop,
    radioOpen,
    radioTitle,
    radioClose,
    radioPlay,
    radioPause,
    radioVolume,
    heroCtaMusic,
    heroCtaBooking,
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
    contactFormToggleOpen,
    contactFormToggleClose,
    gigsLabel,
    gigs,
    gigsHint,
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
        tgAppLabel={t.nav.app}
        lang={lang}
        onSetLang={setLang}
        radioOpen={radioOpen}
        radioTitle={radioTitle}
        radioClose={radioClose}
        radioPlay={radioPlay}
        radioPause={radioPause}
        radioVolume={radioVolume}
        menuOpen={menuOpen}
        onCloseMenu={closeMenu}
        onToggleMenu={toggleMenu}
      />

      <main id="main">
        <Hero ctaMusic={heroCtaMusic} ctaBooking={heroCtaBooking} />

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

        <SectionGigs label={gigsLabel} gigs={gigs} hint={gigsHint} />

        <SectionContact
          label={contactLabel}
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
          contactFormToggleOpen={contactFormToggleOpen}
          contactFormToggleClose={contactFormToggleClose}
        />
      </main>

      <SiteFooter
        navLinks={navLinks}
        socialLinks={socialLinks}
        instagramDisclaimer={t.footerInstagramDisclaimer}
        labels={{
          colLinks: t.footerColLinks,
          colFollow: t.footerColFollow,
          rights: t.footerRights,
        }}
      />
    </>
  );
};

const GigPageRoute = () => {
  const { lang, setLang, t, navLinks, socialLinks } = useLanguage();
  const { menuOpen, closeMenu, toggleMenu } = useNavMenu();
  useLenis();

  return (
    <GigPage
      gigs={t.gigs}
      backLabel={t.gigsBackLabel}
      ticketsLabel={t.gigsTicketsLabel}
      detailsSoon={t.gigsDetailsSoon}
      skip={t.skip}
      logoAria={t.logoAria}
      navAria={t.navAria}
      langGroup={t.langGroup}
      menuLabel={t.menu}
      drawerBackdropLabel={t.drawerBackdrop}
      navLinks={navLinks}
      socialLinks={socialLinks}
      instagramDisclaimer={t.footerInstagramDisclaimer}
      footerLabels={{
        colLinks: t.footerColLinks,
        colFollow: t.footerColFollow,
        rights: t.footerRights,
      }}
      tgAppLabel={t.nav.app}
      lang={lang}
      onSetLang={setLang}
      radioOpen={t.radioOpen}
      radioTitle={t.radioTitle}
      radioClose={t.radioClose}
      radioPlay={t.radioPlay}
      radioPause={t.radioPause}
      radioVolume={t.radioVolume}
      menuOpen={menuOpen}
      onCloseMenu={closeMenu}
      onToggleMenu={toggleMenu}
    />
  );
};

const App = () => (
  <Routes>
    <Route path="/gigs/:slug" element={<GigPageRoute />} />
    <Route path="*" element={<HomePage />} />
  </Routes>
);

export default App;
