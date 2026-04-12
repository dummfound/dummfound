import {
  siBandcamp,
  siInstagram,
  siSoundcloud,
  siTelegram,
} from "simple-icons";

const BY_KEY = {
  instagram: siInstagram,
  soundcloud: siSoundcloud,
  bandcamp: siBandcamp,
  telegram: siTelegram,
};

/** SVG-логотипы: simple-icons (CC0-1.0), https://simpleicons.org/ */
export const SocialBrandIcon = ({ brandKey, className }) => {
  const icon = BY_KEY[brandKey];
  if (!icon) return null;
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={24}
      height={24}
      aria-hidden
      focusable="false"
    >
      <path fill="currentColor" d={icon.path} />
    </svg>
  );
};
