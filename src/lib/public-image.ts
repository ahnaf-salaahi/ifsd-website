import "server-only";

/**
 * Accepts only application assets and the established public `photos` bucket.
 * Canonical private CMS media must continue through the publication-aware
 * signer instead of this compatibility helper.
 */
export function safeLegacyPublicImageUrl(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!configuredUrl) return null;

  try {
    const candidate = new URL(value);
    const supabase = new URL(configuredUrl);
    if (
      candidate.protocol !== "https:" ||
      candidate.origin !== supabase.origin ||
      !candidate.pathname.startsWith("/storage/v1/object/public/photos/")
    ) {
      return null;
    }
    return candidate.toString();
  } catch {
    return null;
  }
}
