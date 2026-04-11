import { useEffect, useMemo, useState } from "react";
import { COPY } from "../content/copy";
import { SOCIAL } from "../content/social";

const LANG_KEY = "dummfound-lang";

export const readStoredLang = () => {
  try {
    const s = localStorage.getItem(LANG_KEY);
    if (s === "en" || s === "ru") return s;
  } catch {
    /* ignore */
  }
  return "ru";
};

export const useLanguage = () => {
  const [lang, setLang] = useState(readStoredLang);
  const t = COPY[lang];

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang;
  }, [lang]);

  const navLinks = useMemo(() => {
    const { about, music, booking, contact, gigs } = t.nav;
    return [
      { href: "#about", label: about },
      { href: "#music", label: music },
      { href: "#booking", label: booking },
      { href: "#gigs", label: gigs },
      { href: "#contact", label: contact }
      
    ];
  }, [t]);

  const socialLinks = useMemo(
    () =>
      SOCIAL.map((item) => ({
        ...item,
        label:
          item.key === "instagram" ? t.instagramSocialLabel : item.label,
      })),
    [t]
  );

  return { lang, setLang, t, navLinks, socialLinks };
};
