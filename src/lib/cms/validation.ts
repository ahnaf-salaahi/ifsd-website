import { CmsError } from "./errors";

export const CMS_MEDIA_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type CmsMediaMimeType = (typeof CMS_MEDIA_MIME_TYPES)[number];

export const CMS_MEDIA_KINDS = [
  "branding",
  "page",
  "section",
  "team",
  "partner",
  "testimonial",
  "featured_programme",
  "featured_scholarship",
  "featured_story",
  "programme",
  "scholarship",
  "success_story",
  "gallery",
  "general",
] as const;

export type CmsMediaKind = (typeof CMS_MEDIA_KINDS)[number];

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: string) {
  return UUID_PATTERN.test(value);
}

export function requireUuid(value: string, field = "id") {
  if (!isUuid(value)) {
    throw new CmsError("validation", {
      safeDetails: { field },
    });
  }
  return value;
}

export function requirePageKey(value: string) {
  if (!/^[a-z][a-z0-9_]{1,79}$/.test(value)) {
    throw new CmsError("validation", { safeDetails: { field: "pageKey" } });
  }
  return value;
}

export function requireSlug(value: string) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || value.length > 160) {
    throw new CmsError("validation", { safeDetails: { field: "slug" } });
  }
  return value;
}

export function requireDisplayOrder(value: number) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new CmsError("validation", {
      safeDetails: { field: "displayOrder" },
    });
  }
  return value;
}

export function requireMediaKind(value: string): CmsMediaKind {
  if (!(CMS_MEDIA_KINDS as readonly string[]).includes(value)) {
    throw new CmsError("validation", {
      safeDetails: { field: "mediaKind" },
    });
  }
  return value as CmsMediaKind;
}

export function requireMimeType(value: string): CmsMediaMimeType {
  if (!(CMS_MEDIA_MIME_TYPES as readonly string[]).includes(value)) {
    throw new CmsError("validation", {
      safeDetails: { field: "mimeType" },
    });
  }
  return value as CmsMediaMimeType;
}

export function requireFileSize(value: number) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 10_485_760) {
    throw new CmsError("validation", {
      safeDetails: { field: "fileSize" },
    });
  }
  return value;
}

export function optionalHttpsUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") throw new Error("Invalid protocol");
    return parsed.toString();
  } catch {
    throw new CmsError("validation", { safeDetails: { field: "url" } });
  }
}
