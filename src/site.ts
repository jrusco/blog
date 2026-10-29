export type ProfileLink = { label: string; href?: string };

// The footer shows a link only once its href is set. Do not use a real name.
export const PROFILE_LINKS: ProfileLink[] = [
  { label: "X", href: "https://x.com" },
  { label: "GitHub", href: "https://github.com" },
];
