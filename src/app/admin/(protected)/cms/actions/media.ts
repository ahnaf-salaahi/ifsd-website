"use server";

import { revalidatePath } from "next/cache";
import type { ActionResult } from "@/lib/cms/action-types";
import {
  deactivateMedia,
  deleteConfirmedOrphan,
  prepareMediaUpload,
  registerUploadedMedia,
} from "@/lib/cms/media";
import type { Json } from "@/types/database.types";
import {
  ActionValidationError,
  executeAdminAction,
  formInteger,
  formText,
  formUuid,
} from "./shared";
import {
  requireFileSize,
  requireMediaKind,
  requireMimeType,
} from "@/lib/cms/validation";

export async function prepareMediaUploadAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult<{
  bucketId: string;
  objectPath: string;
  token: string;
  signedUrl: string;
}>> {
  return executeAdminAction("cms.media.prepare", async () => {
    const mediaKind = requireMediaKind(
      await formText(formData, "media_kind"),
    );
    const ownerId = await formUuid(formData, "owner_id", true);
    const originalFilename = await formText(formData, "original_filename", {
      required: true,
      max: 255,
    });
    const mimeType = requireMimeType(await formText(formData, "mime_type"));
    const fileSizeBytes = requireFileSize(
      await formInteger(formData, "file_size_bytes", 1),
    );
    return prepareMediaUpload({
      mediaKind,
      ownerId: ownerId ?? undefined,
      originalFilename,
      mimeType,
      fileSizeBytes,
    });
  });
}

export async function finalizeMediaUploadAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult<{ id: string; objectPath: string }>> {
  return executeAdminAction("cms.media.finalize", async () => {
    const widthRaw = await formText(formData, "width");
    const heightRaw = await formText(formData, "height");
    let metadata: Json = {};
    const rawMetadata = await formText(formData, "metadata", { max: 65536 });
    if (rawMetadata) {
      try {
        metadata = JSON.parse(rawMetadata) as Json;
      } catch {
        throw new ActionValidationError({
          metadata: ["Enter a valid JSON object."],
        });
      }
    }
    const media = await registerUploadedMedia({
      mediaKind: requireMediaKind(await formText(formData, "media_kind")),
      ownerId:
        (await formUuid(formData, "owner_id", true)) ?? undefined,
      originalFilename: await formText(formData, "original_filename", {
        required: true,
        max: 255,
      }),
      mimeType: requireMimeType(await formText(formData, "mime_type")),
      fileSizeBytes: requireFileSize(
        await formInteger(formData, "file_size_bytes", 1),
      ),
      objectPath: await formText(formData, "object_path", {
        required: true,
        max: 1024,
      }),
      width: widthRaw ? Number(widthRaw) : null,
      height: heightRaw ? Number(heightRaw) : null,
      altText: (await formText(formData, "alt_text", { max: 1000 })) || null,
      caption: (await formText(formData, "caption", { max: 5000 })) || null,
      credit: (await formText(formData, "credit", { max: 1000 })) || null,
      copyrightNotice:
        (await formText(formData, "copyright_notice", { max: 2000 })) || null,
      metadata,
    });
    revalidatePath("/admin/cms/media");
    revalidatePath("/admin/cms");
    return { id: media.id, objectPath: media.object_path };
  });
}

export async function deactivateMediaAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.media.deactivate", async () => {
    await deactivateMedia(await formUuid(formData, "id"));
    revalidatePath("/admin/cms/media");
    revalidatePath("/admin/cms");
  });
}

export async function deleteOrphanMediaAction(
  _state: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  return executeAdminAction("cms.media.deleteOrphan", async () => {
    await deleteConfirmedOrphan(await formUuid(formData, "id"), true);
    revalidatePath("/admin/cms/media");
    revalidatePath("/admin/cms");
  });
}
