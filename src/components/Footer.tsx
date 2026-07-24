import Link from "next/link";
import type { NavigationNode } from "@/lib/cms/types";
import { SITE_NAME } from "@/lib/site-brand";

const FALLBACK_LINKS = [
  { label: "About Us", url: "/about" },
  { label: "Scholarships", url: "/scholarships" },
  { label: "Programmes", url: "/programmes" },
  { label: "Events", url: "/events" },
  { label: "Success Stories", url: "/success-stories" },
  { label: "Blog", url: "/blog" },
];

const safeHref = (value: string) => {
  if (value.startsWith("/") && !value.startsWith("//")) {
    const normalized = value.length > 1 ? value.replace(/\/+$/, "") : value;
    return PUBLIC_NAVIGATION_ROUTES.has(normalized) ? normalized : null;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
};

const PUBLIC_NAVIGATION_ROUTES = new Set([
  "/",
  "/about",
  "/blog",
  "/contact",
  "/events",
  "/programmes",
  "/scholarships",
  "/success-stories",
]);
const SOCIAL_PLATFORMS = new Set([
  "facebook",
  "instagram",
  "linkedin",
  "twitter",
  "x",
  "youtube",
  "whatsapp",
]);

export default function Footer({
  navigation = [],
  description,
  email,
  phone,
  address,
  socialLinks = [],
}: {
  navigation?: NavigationNode[];
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  socialLinks?: Array<{ label: string; url: string }>;
}) {
  const links = dedupeLinks(
    navigation.length
      ? navigation.flatMap((item) => [item, ...item.children])
      : FALLBACK_LINKS,
  );
  const safeSocialLinks = socialLinks.filter(
    (item) =>
      SOCIAL_PLATFORMS.has(item.label.trim().toLowerCase()) &&
      safeHttps(item.url),
  );
  return (
    <footer className="mt-20 bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-10 gap-y-12 px-6 py-16 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 text-lg font-semibold text-white">
            {SITE_NAME}
          </h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-400">
            {description ||
              "Empowering students and youth through skills, education, and guidance since 2026."}
          </p>
        </div>
        <div className="lg:col-span-2">
          <h4 className="mb-4 font-medium text-white">Quick Links</h4>
          <ul className="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
            {links.map((item) => {
              const href = safeHref(item.url);
              if (!href) return null;
              const blank = "target" in item && item.target === "blank";
              return (
                <li key={item.url}>
                  <Link
                    href={href}
                    target={blank ? "_blank" : undefined}
                    rel={blank || href.startsWith("https://") ? "noopener noreferrer" : undefined}
                    className="hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-medium text-white">Contact</h4>
          <ul className="space-y-2.5 text-sm text-gray-400">
            {email && <li><a className="hover:text-white" href={`mailto:${email}`}>{email}</a></li>}
            {phone && <li><a className="hover:text-white" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a></li>}
            {address && <li className="whitespace-pre-line">{address}</li>}
            {!email && !phone && !address && (
              <>
                <li>Email: info.isd.lk@gmail.com</li>
                <li>Phone: +94 71 144 2448</li>
              </>
            )}
            {safeSocialLinks.length > 0 && (
              <li className="flex flex-wrap gap-3 pt-2">
                {safeSocialLinks.map((item) => (
                  <a
                    key={item.url}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    {item.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-5 text-center text-xs text-gray-500">
        {`© ${new Date().getFullYear()} ${SITE_NAME} (Pvt) Ltd. All rights reserved.`}
      </div>
    </footer>
  );
}

function dedupeLinks<T extends { url: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const href = safeHref(item.url);
    if (!href || seen.has(href)) return false;
    seen.add(href);
    return true;
  });
}

function safeHttps(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}
