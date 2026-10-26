export const SOCIAL_TYPES = ["phone", "facebook", "whatsapp", "telegram", "email"];

export const SOCIAL_LABEL = {
  phone: "Phone",
  facebook: "Facebook",
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  email: "Email",
};

export const SOCIAL_HINT = {
  phone: "+8801XXXXXXXXX",
  facebook: "https://facebook.com/your-profile",
  whatsapp: "+8801XXXXXXXXX",
  telegram: "@username or https://t.me/username",
  email: "you@example.com",
};

const isUrl = (v) => /^https?:\/\//i.test(v);

export function socialHref(type, value) {
  const v = (value || "").trim();
  switch (type) {
    case "phone":
      return `tel:${v.replace(/\s+/g, "")}`;
    case "email":
      return `mailto:${v}`;
    case "whatsapp":
      return `https://wa.me/${v.replace(/\D/g, "")}`;
    case "telegram":
      return isUrl(v) ? v : `https://t.me/${v.replace(/^@/, "")}`;
    default:
      return isUrl(v) ? v : `https://${v}`;
  }
}
