// Public contact address. Override with REACT_APP_SUPPORT_EMAIL if it ever changes.
export const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL || "tablecoin2026@gmail.com";
export const mailto = (subject) => `mailto:${SUPPORT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
