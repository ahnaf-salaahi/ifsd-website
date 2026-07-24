export const SITE_NAME = "Institute for Skills Development";

export function withSiteName(pageTitle?: string | null) {
  const title = pageTitle?.trim();
  if (!title || title.toLowerCase() === "institute") return SITE_NAME;
  if (title.toLowerCase().includes(SITE_NAME.toLowerCase())) return title;
  return `${title.replace(/\s*\|\s*institute\s*$/i, "")} | ${SITE_NAME}`;
}
