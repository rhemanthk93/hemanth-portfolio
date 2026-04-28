// Single source of truth for contact channels. Surfaces:
//   - components/bento/ContactTile.tsx (homepage strip)
//   - data/contact.md (knowledge-base entry the chat agent reads)
//
// Email and LinkedIn URL fall back to the public values the site shipped
// with — they're not secret (they're in past commits and on the live
// site) — but env vars take precedence so a fork can override without
// editing source. The WhatsApp URL is hardcoded on purpose: the phone
// number must live in exactly one place in the codebase, and that place
// is here. Anything else (display labels, copy) consumes from this file.

const DEFAULT_EMAIL = "rhemanthk93@gmail.com";
const DEFAULT_LINKEDIN = "https://www.linkedin.com/in/rhemanthkumar93/";

export const CONTACT = {
  email: process.env.NEXT_PUBLIC_EMAIL ?? DEFAULT_EMAIL,
  whatsapp:
    "https://wa.me/6597693514?text=Hi%20Hemanth%2C%20I%20found%20you%20via%20askhemanth",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? DEFAULT_LINKEDIN,
  github: "https://github.com/rhemanthk93",
  medium: "https://medium.com/@rhemanthk93",
} as const;
