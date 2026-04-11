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

const App = () => {
  const { lang, setLang, t, navLinks, socialLinks } = useLanguage();
  const { menuOpen, closeMenu, toggleMenu } = useNavMenu();
  const { theme, toggleTheme } = useTheme();

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

        <SectionContact label={contactLabel} socialLinks={socialLinks} />
      </main>

      <SiteFooter instagramDisclaimer={footerInstagramDisclaimer} />
    </>
  );
};

export default App;
