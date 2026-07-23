import "server-only";

import { randomUUID } from "node:crypto";
import type { PostgrestError } from "@supabase/supabase-js";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";
import type { Json, TablesInsert } from "@/types/database.types";
import { requireAdmin } from "./auth";
import { CmsError, databaseError, storageError } from "./errors";
import {
  normalizePagination,
  pageResult,
  type PaginationInput,
} from "./pagination";
import type { MediaWithSignedUrl } from "./types";
import {
  requireFileSize,
  requireMediaKind,
  requireMimeType,
  requireUuid,
  type CmsMediaKind,
  type CmsMediaMimeType,
} from "./validation";

const CMS_MEDIA_BUCKET = "cms-media";
const SIGNED_URL_SECONDS = 300;
const MAX_SIGNED_URL_SECONDS = 900;

const KIND_ROOTS: Record<CmsMediaKind, string> = {
  branding: "branding",
  page: "pages",
  section: "sections",
  team: "team",
  partner: "partners",
  testimonial: "testimonials",
  featured_programme: "featured/programmes",
  featured_scholarship: "featured/scholarships",
  featured_story: "featured/stories",
  programme: "programmes",
  scholarship: "scholarships",
  success_story: "success-stories",
  gallery: "gallery",
  general: "general",
};

const MIME_EXTENSIONS: Record<CmsMediaMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function sanitizeMediaFilename(
  originalFilename: string,
  mimeType: CmsMediaMimeType,
) {
  const withoutExtension = originalFilename.replace(/\.[^.]*$/, "");
  const basename = withoutExtension
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return `${basename || "image"}.${MIME_EXTENSIONS[mimeType]}`;
}

export function generateCanonicalMediaPath(input: {
  mediaKind: CmsMediaKind;
  ownerId?: string;
  originalFilename: string;
  mimeType: CmsMediaMimeType;
  assetId?: string;
}) {
  const kind = requireMediaKind(input.mediaKind);
  const owner =
    input.ownerId ??
    (kind === "branding" || kind === "general" ? "global" : null);
  if (!owner) {
    throw new CmsError("validation", {
      safeDetails: { field: "ownerId" },
    });
  }
  if (owner !== "global") requireUuid(owner, "ownerId");
  if (
    owner === "global" &&
    kind !== "branding" &&
    kind !== "general"
  ) {
    throw new CmsError("validation", {
      safeDetails: { field: "ownerId" },
    });
  }
  const assetId = requireUuid(input.assetId ?? randomUUID(), "assetId");
  const filename = sanitizeMediaFilename(
    input.originalFilename,
    requireMimeType(input.mimeType),
  );
  return `${KIND_ROOTS[kind]}/${owner}/${assetId}/${filename}`;
}

function signedUrlExpiry(seconds = SIGNED_URL_SECONDS) {
  if (!Number.isSafeInteger(seconds) || seconds < 30) {
    throw new CmsError("validation", {
      safeDetails: { field: "expiresIn" },
    });
  }
  return Math.min(seconds, MAX_SIGNED_URL_SECONDS);
}

export async function createAdminMediaSignedUrl(
  objectPath: string,
  expiresIn = SIGNED_URL_SECONDS,
) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.storage
    .from(CMS_MEDIA_BUCKET)
    .createSignedUrl(objectPath, signedUrlExpiry(expiresIn));
  if (error) throw storageError("media.sign.admin", error);
  return data.signedUrl;
}

export async function createAdminMediaSignedUrls(
  objectPaths: string[],
  expiresIn = SIGNED_URL_SECONDS,
) {
  if (objectPaths.length === 0) return new Map<string, string | null>();
  if (objectPaths.length > 100) {
    throw new CmsError("validation", {
      safeDetails: { field: "objectPaths" },
    });
  }
  const { supabase } = await requireAdmin();
  const paths = [...new Set(objectPaths)];
  const { data, error } = await supabase.storage
    .from(CMS_MEDIA_BUCKET)
    .createSignedUrls(paths, signedUrlExpiry(expiresIn));
  if (error) throw storageError("media.signBatch.admin", error);
  return new Map(
    data.map((result) => [
      result.path,
      result.error ? null : result.signedUrl,
    ]),
  );
}

export type PublishedMediaReference =
  | { kind: "branding"; objectPath: string }
  | { kind: "page"; ownerId: string; objectPath: string }
  | { kind: "section"; ownerId: string; objectPath: string }
  | { kind: "team"; ownerId: string; objectPath: string }
  | { kind: "partner"; ownerId: string; objectPath: string }
  | { kind: "testimonial"; ownerId: string; objectPath: string }
  | { kind: "featured_programme"; ownerId: string; objectPath: string }
  | { kind: "featured_scholarship"; ownerId: string; objectPath: string }
  | { kind: "featured_story"; ownerId: string; objectPath: string }
  | { kind: "programme"; ownerId: string; objectPath: string }
  | { kind: "scholarship"; ownerId: string; objectPath: string }
  | { kind: "success_story"; ownerId: string; objectPath: string };

export async function createPublishedMediaSignedUrl(
  reference: PublishedMediaReference,
  expiresIn = SIGNED_URL_SECONDS,
) {
  // Prevent a short-lived URL from being captured in prerendered output.
  await connection();
  await assertPublishedMediaReference(reference);
  const privileged = createAdminClient();
  const { data, error } = await privileged.storage
    .from(CMS_MEDIA_BUCKET)
    .createSignedUrl(reference.objectPath, signedUrlExpiry(expiresIn));
  if (error) throw storageError("media.sign.public", error);
  return data.signedUrl;
}

async function assertPublishedMediaReference(
  reference: PublishedMediaReference,
) {
  const supabase = createPublicClient();
  const ownerId =
    "ownerId" in reference
      ? requireUuid(reference.ownerId, "ownerId")
      : undefined;
  assertCanonicalReferencePath(reference, ownerId);
  let found = false;

  switch (reference.kind) {
    case "branding": {
      const { data, error } = await supabase
        .from("site_settings")
        .select("singleton")
        .or(
          [
            `primary_logo_path.eq.${reference.objectPath}`,
            `secondary_logo_path.eq.${reference.objectPath}`,
            `favicon_path.eq.${reference.objectPath}`,
            `seal_path.eq.${reference.objectPath}`,
            `default_og_image_path.eq.${reference.objectPath}`,
          ].join(","),
        )
        .maybeSingle();
      if (error) throw databaseError("media.verify.branding", error);
      found = Boolean(data);
      break;
    }
    case "page":
      found = await exactPublicReference(
        await supabase
          .from("site_pages")
          .select("id")
          .eq("id", ownerId!)
          .eq("og_image_path", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "section":
      found = await exactPublicReference(
        await supabase
          .from("site_sections")
          .select("id")
          .eq("id", ownerId!)
          .eq("media_path", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "team":
      found = await exactPublicReference(
        await supabase
          .from("team_members")
          .select("id")
          .eq("id", ownerId!)
          .eq("photo_path", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "partner":
      found = await exactPublicReference(
        await supabase
          .from("partners")
          .select("id")
          .eq("id", ownerId!)
          .eq("logo_path", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "testimonial":
      found = await exactPublicReference(
        await supabase
          .from("testimonials")
          .select("id")
          .eq("id", ownerId!)
          .eq("photo_path", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "featured_programme":
      found = await exactPublicReference(
        await supabase
          .from("homepage_featured_programmes")
          .select("id")
          .eq("id", ownerId!)
          .eq("image_override_path", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "featured_scholarship":
      found = await exactPublicReference(
        await supabase
          .from("homepage_featured_scholarships")
          .select("id")
          .eq("id", ownerId!)
          .eq("image_override_path", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "featured_story":
      found = await exactPublicReference(
        await supabase
          .from("homepage_featured_stories")
          .select("id")
          .eq("id", ownerId!)
          .eq("image_override_path", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "programme":
      found = await exactPublicReference(
        await supabase
          .from("programmes")
          .select("id")
          .eq("id", ownerId!)
          .eq("featured_image_path", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "scholarship":
      found = await exactPublicReference(
        await supabase
          .from("scholarships")
          .select("id")
          .eq("id", ownerId!)
          .eq("cover_image_url", reference.objectPath)
          .maybeSingle(),
      );
      break;
    case "success_story": {
      const { data, error } = await supabase
        .from("success_stories")
        .select("id")
        .eq("id", ownerId!)
        .or(
          `profile_image_path.eq.${reference.objectPath},cover_image_path.eq.${reference.objectPath}`,
        )
        .maybeSingle();
      if (error) throw databaseError("media.verify.successStory", error);
      found = Boolean(data);
      break;
    }
  }

  if (!found) {
    throw new CmsError("not_found", {
      operation: "media.verifyPublishedReference",
    });
  }
}

function assertCanonicalReferencePath(
  reference: PublishedMediaReference,
  ownerId: string | undefined,
) {
  const root = KIND_ROOTS[reference.kind];
  const owner = reference.kind === "branding" ? "global" : ownerId;
  const escapedRoot = root.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const escapedOwner = (owner ?? "").replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  const uuid =
    "[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}";
  const pattern = new RegExp(
    `^${escapedRoot}/${escapedOwner}/${uuid}/[A-Za-z0-9][A-Za-z0-9._-]{0,254}$`,
    "i",
  );
  if (!pattern.test(reference.objectPath)) {
    throw new CmsError("validation", {
      safeDetails: { field: "objectPath" },
    });
  }
}

async function exactPublicReference(
  result: {
    data: unknown;
    error: PostgrestError | null;
  },
) {
  const { data, error } = result;
  if (error) throw databaseError("media.verifyReference", error);
  return Boolean(data);
}

export type PrepareMediaUploadInput = {
  mediaKind: CmsMediaKind;
  ownerId?: string;
  originalFilename: string;
  mimeType: CmsMediaMimeType;
  fileSizeBytes: number;
};

export async function prepareMediaUpload(input: PrepareMediaUploadInput) {
  const { supabase } = await requireAdmin();
  const mimeType = requireMimeType(input.mimeType);
  requireFileSize(input.fileSizeBytes);
  validateOriginalFilename(input.originalFilename);
  const objectPath = generateCanonicalMediaPath({ ...input, mimeType });
  const { data, error } = await supabase.storage
    .from(CMS_MEDIA_BUCKET)
    .createSignedUploadUrl(objectPath, { upsert: false });
  if (error) throw storageError("media.prepareUpload", error);
  return {
    bucketId: CMS_MEDIA_BUCKET,
    objectPath,
    token: data.token,
    signedUrl: data.signedUrl,
  };
}

export type RegisterUploadedMediaInput = PrepareMediaUploadInput & {
  objectPath: string;
  width?: number | null;
  height?: number | null;
  altText?: string | null;
  caption?: string | null;
  credit?: string | null;
  copyrightNotice?: string | null;
  metadata?: Json;
};

export async function registerUploadedMedia(input: RegisterUploadedMediaInput) {
  const { supabase } = await requireAdmin();
  const expectedPath = input.objectPath;
  const expectedMime = requireMimeType(input.mimeType);
  requireFileSize(input.fileSizeBytes);
  validateOriginalFilename(input.originalFilename);
  validateDimensions(input.width, input.height);
  if (
    input.metadata !== undefined &&
    (input.metadata === null ||
      Array.isArray(input.metadata) ||
      typeof input.metadata !== "object")
  ) {
    throw new CmsError("validation", {
      safeDetails: { field: "metadata" },
    });
  }

  const kind = requireMediaKind(input.mediaKind);
  const expectedPrefix = `${KIND_ROOTS[kind]}/`;
  if (!expectedPath.startsWith(expectedPrefix)) {
    throw new CmsError("validation", {
      safeDetails: { field: "objectPath" },
    });
  }
  const remainder = expectedPath.slice(expectedPrefix.length).split("/");
  const expectedOwner =
    input.ownerId ?? (kind === "branding" || kind === "general" ? "global" : "");
  if (
    remainder.length !== 3 ||
    remainder[0] !== expectedOwner ||
    remainder[2] !== sanitizeMediaFilename(input.originalFilename, expectedMime)
  ) {
    throw new CmsError("validation", {
      safeDetails: { field: "objectPath" },
    });
  }
  const { data: pathIsValid, error: pathError } = await supabase.rpc(
    "cms_media_path_is_valid",
    { value: expectedPath, requested_media_kind: kind },
  );
  if (pathError) throw databaseError("media.validatePath", pathError);
  if (!pathIsValid) {
    throw new CmsError("validation", {
      safeDetails: { field: "objectPath" },
    });
  }

  const { data: blob, error: downloadError } = await supabase.storage
    .from(CMS_MEDIA_BUCKET)
    .download(expectedPath);
  if (downloadError) throw storageError("media.verifyUpload", downloadError);

  const bytes = new Uint8Array(await blob.arrayBuffer());
  if (bytes.byteLength !== input.fileSizeBytes || !matchesMime(bytes, expectedMime)) {
    await supabase.storage.from(CMS_MEDIA_BUCKET).remove([expectedPath]);
    throw new CmsError("validation", {
      operation: "media.verifyUpload",
      safeDetails: { field: "file" },
    });
  }

  const insert: TablesInsert<"cms_media"> = {
    bucket_id: CMS_MEDIA_BUCKET,
    object_path: expectedPath,
    original_filename: input.originalFilename.trim(),
    media_kind: input.mediaKind,
    mime_type: expectedMime,
    file_size_bytes: input.fileSizeBytes,
    width: input.width ?? null,
    height: input.height ?? null,
    alt_text: input.altText ?? null,
    caption: input.caption ?? null,
    credit: input.credit ?? null,
    copyright_notice: input.copyrightNotice ?? null,
    metadata: input.metadata ?? {},
  };
  const { data, error } = await supabase
    .from("cms_media")
    .insert(insert)
    .select("*")
    .single();
  if (error) {
    await supabase.storage.from(CMS_MEDIA_BUCKET).remove([expectedPath]);
    throw databaseError("media.register", error);
  }
  return data;
}

function validateDimensions(
  width: number | null | undefined,
  height: number | null | undefined,
) {
  if ((width == null) !== (height == null)) {
    throw new CmsError("validation", {
      safeDetails: { field: "dimensions" },
    });
  }
  if (
    width != null &&
    (!Number.isSafeInteger(width) ||
      !Number.isSafeInteger(height) ||
      width <= 0 ||
      height! <= 0)
  ) {
    throw new CmsError("validation", {
      safeDetails: { field: "dimensions" },
    });
  }
}

function validateOriginalFilename(value: string) {
  if (
    value !== value.trim() ||
    value.length < 1 ||
    value.length > 255 ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw new CmsError("validation", {
      safeDetails: { field: "originalFilename" },
    });
  }
}

export function matchesMime(bytes: Uint8Array, mime: CmsMediaMimeType) {
  if (mime === "image/jpeg") {
    return bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff;
  }
  if (mime === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }
  if (mime === "image/webp") {
    return (
      bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
    );
  }
  return (
    bytes.length >= 12 &&
    String.fromCharCode(...bytes.slice(4, 8)) === "ftyp" &&
    ["avif", "avis"].includes(String.fromCharCode(...bytes.slice(8, 12)))
  );
}

export async function listAdminMedia(
  input: PaginationInput & { mediaKind?: CmsMediaKind; active?: boolean } = {},
) {
  const { supabase } = await requireAdmin();
  const pagination = normalizePagination(input);
  let query = supabase
    .from("cms_media")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id")
    .range(pagination.from, pagination.to);
  if (input.mediaKind) {
    query = query.eq("media_kind", requireMediaKind(input.mediaKind));
  }
  if (input.active !== undefined) query = query.eq("is_active", input.active);
  const { data, error, count } = await query;
  if (error) throw databaseError("media.admin.list", error);
  return pageResult(data, count ?? 0, pagination);
}

export async function listAdminMediaWithSignedUrls(
  input: PaginationInput & { mediaKind?: CmsMediaKind; active?: boolean } = {},
) {
  const result = await listAdminMedia(input);
  const signedUrls = await createAdminMediaSignedUrls(
    result.items.map((item) => item.object_path),
  );
  return {
    ...result,
    items: result.items.map(
      (item): MediaWithSignedUrl => ({
        ...item,
        signedUrl: signedUrls.get(item.object_path) ?? null,
      }),
    ),
  };
}

export async function getAdminMediaPickerOptions(mediaKinds: CmsMediaKind[]) {
  const { supabase } = await requireAdmin();
  const kinds = [...new Set(mediaKinds.map(requireMediaKind))];
  if (kinds.length === 0) return [];
  const { data, error } = await supabase
    .from("cms_media")
    .select(
      "id,object_path,original_filename,media_kind,alt_text,created_at",
    )
    .eq("is_active", true)
    .in("media_kind", kinds)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw databaseError("media.picker.list", error);
  const signed = await createAdminMediaSignedUrls(
    data.map((item) => item.object_path),
  );
  return data.map((item) => ({
    id: item.id,
    objectPath: item.object_path,
    filename: item.original_filename,
    mediaKind: item.media_kind,
    altText: item.alt_text,
    signedUrl: signed.get(item.object_path) ?? null,
  }));
}

export async function deactivateMedia(id: string) {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("cms_media")
    .update({ is_active: false })
    .eq("id", requireUuid(id))
    .select("*")
    .maybeSingle();
  if (error) throw databaseError("media.deactivate", error);
  if (!data) {
    throw new CmsError("not_found", { operation: "media.deactivate" });
  }
  return data;
}

export async function deleteConfirmedOrphan(id: string, confirmed: boolean) {
  if (!confirmed) {
    throw new CmsError("validation", {
      safeDetails: { field: "confirmed" },
    });
  }
  const { supabase } = await requireAdmin();
  const { data: media, error } = await supabase
    .from("cms_media")
    .select("id,bucket_id,object_path")
    .eq("id", requireUuid(id))
    .maybeSingle();
  if (error) throw databaseError("media.orphan.get", error);
  if (!media) {
    throw new CmsError("not_found", { operation: "media.orphan.get" });
  }
  if (await isKnownReference(media.object_path, supabase)) {
    throw new CmsError("conflict", {
      operation: "media.orphan.delete",
      message: "The media object is still referenced by content.",
    });
  }

  const { error: removeError } = await supabase.storage
    .from(CMS_MEDIA_BUCKET)
    .remove([media.object_path]);
  if (removeError) throw storageError("media.orphan.removeObject", removeError);

  const { error: deleteError } = await supabase
    .from("cms_media")
    .delete()
    .eq("id", media.id);
  if (deleteError) throw databaseError("media.orphan.deleteRegistry", deleteError);
}

async function isKnownReference(
  path: string,
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
) {
  const checks = [
    supabase.from("site_pages").select("id", { head: true, count: "exact" }).eq("og_image_path", path),
    supabase.from("site_sections").select("id", { head: true, count: "exact" }).eq("media_path", path),
    supabase.from("team_members").select("id", { head: true, count: "exact" }).eq("photo_path", path),
    supabase.from("partners").select("id", { head: true, count: "exact" }).eq("logo_path", path),
    supabase.from("testimonials").select("id", { head: true, count: "exact" }).eq("photo_path", path),
    supabase.from("homepage_featured_programmes").select("id", { head: true, count: "exact" }).eq("image_override_path", path),
    supabase.from("homepage_featured_scholarships").select("id", { head: true, count: "exact" }).eq("image_override_path", path),
    supabase.from("homepage_featured_stories").select("id", { head: true, count: "exact" }).eq("image_override_path", path),
    supabase.from("programmes").select("id", { head: true, count: "exact" }).eq("featured_image_path", path),
    supabase.from("scholarships").select("id", { head: true, count: "exact" }).eq("cover_image_url", path),
    supabase.from("success_stories").select("id", { head: true, count: "exact" }).or(`profile_image_path.eq.${path},cover_image_path.eq.${path}`),
    supabase.from("site_settings").select("singleton", { head: true, count: "exact" }).or(
      `primary_logo_path.eq.${path},secondary_logo_path.eq.${path},favicon_path.eq.${path},seal_path.eq.${path},default_og_image_path.eq.${path}`,
    ),
  ];
  const results = await Promise.all(checks);
  for (const result of results) {
    if (result.error) throw databaseError("media.orphan.check", result.error);
    if ((result.count ?? 0) > 0) return true;
  }
  return false;
}
