"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { INITIAL_ACTION_RESULT } from "@/lib/cms/action-types";
import {
  finalizeMediaUploadAction,
  prepareMediaUploadAction,
} from "@/app/admin/(protected)/cms/actions/media";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_SIZE = 10_485_760;

export default function MediaUpload({
  defaultKind = "general",
  ownerId,
  fixedKind = false,
  compact = false,
}: {
  defaultKind?: string;
  ownerId?: string;
  fixedKind?: boolean;
  compact?: boolean;
}) {
  const router = useRouter();
  const controlId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<
    "idle" | "preparing" | "uploading" | "finalizing" | "complete"
  >("idle");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status !== "idle" && status !== "complete") return;
    setError("");
    const form = event.currentTarget;
    const fileInput = form.elements.namedItem("file") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) return setError("Choose an image.");
    if (!ALLOWED_TYPES.includes(file.type)) {
      return setError("Use JPEG, PNG, WebP, or AVIF.");
    }
    if (file.size < 1 || file.size > MAX_SIZE) {
      return setError("Images must be 10 MiB or smaller.");
    }
    const kind = String(new FormData(form).get("media_kind") || defaultKind);
    const preparation = new FormData();
    preparation.set("media_kind", kind);
    preparation.set("owner_id", ownerId ?? String(new FormData(form).get("owner_id") ?? ""));
    preparation.set("original_filename", file.name);
    preparation.set("mime_type", file.type);
    preparation.set("file_size_bytes", String(file.size));

    try {
      setStatus("preparing");
      const prepared = await prepareMediaUploadAction(
        INITIAL_ACTION_RESULT,
        preparation,
      );
      if (!prepared.ok || !prepared.data) {
        setStatus("idle");
        return setError(prepared.ok ? "Upload could not be prepared." : prepared.message);
      }
      setStatus("uploading");
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(prepared.data.bucketId)
        .uploadToSignedUrl(
          prepared.data.objectPath,
          prepared.data.token,
          file,
          { contentType: file.type },
        );
      if (uploadError) {
        setStatus("idle");
        return setError("The image transfer failed.");
      }
      const dimensions = await imageDimensions(file);
      const finalization = new FormData(form);
      finalization.set("media_kind", kind);
      finalization.set("owner_id", ownerId ?? String(finalization.get("owner_id") ?? ""));
      finalization.set("original_filename", file.name);
      finalization.set("mime_type", file.type);
      finalization.set("file_size_bytes", String(file.size));
      finalization.set("object_path", prepared.data.objectPath);
      finalization.set("width", dimensions ? String(dimensions.width) : "");
      finalization.set("height", dimensions ? String(dimensions.height) : "");
      setStatus("finalizing");
      const finalized = await finalizeMediaUploadAction(
        INITIAL_ACTION_RESULT,
        finalization,
      );
      if (!finalized.ok) {
        setStatus("idle");
        return setError(finalized.message);
      }
      setStatus("complete");
      formRef.current?.reset();
      router.refresh();
    } catch {
      setStatus("idle");
      setError("The upload could not be completed.");
    }
  }

  const busy = !["idle", "complete"].includes(status);
  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className={compact ? "mt-5 rounded-xl bg-gray-50 p-4" : "rounded-2xl border border-gray-100 bg-white p-5 sm:p-7"}
    >
      {!compact && <h2 className="text-lg font-semibold">Upload media</h2>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`media-file-${controlId}`} className="block text-sm font-medium">Image file</label>
          <input id={`media-file-${controlId}`} type="file" name="file" accept={ALLOWED_TYPES.join(",")} required className="mt-1 block w-full text-sm" />
        </div>
        <div>
          <label htmlFor={`media-kind-${controlId}`} className="block text-sm font-medium">Media kind</label>
          <select id={`media-kind-${controlId}`} name="media_kind" defaultValue={defaultKind} disabled={fixedKind} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
            {["branding","page","section","team","partner","testimonial","featured_programme","featured_scholarship","featured_story","programme","scholarship","success_story","gallery","general"].map((kind) => <option key={kind} value={kind}>{kind.replaceAll("_", " ")}</option>)}
          </select>
          {fixedKind && <input type="hidden" name="media_kind" value={defaultKind} />}
        </div>
        {!ownerId && (
          <div>
            <label htmlFor={`media-owner-${controlId}`} className="block text-sm font-medium">Owner UUID</label>
            <input id={`media-owner-${controlId}`} name="owner_id" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-gray-500">Required except for branding and general assets.</p>
          </div>
        )}
        <div><label htmlFor={`media-alt-${controlId}`} className="block text-sm font-medium">Alt text</label><input id={`media-alt-${controlId}`} name="alt_text" maxLength={1000} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
        <div><label htmlFor={`media-caption-${controlId}`} className="block text-sm font-medium">Caption</label><input id={`media-caption-${controlId}`} name="caption" maxLength={5000} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
        <div><label htmlFor={`media-credit-${controlId}`} className="block text-sm font-medium">Credit</label><input id={`media-credit-${controlId}`} name="credit" maxLength={1000} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" /></div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      {status === "complete" && <p role="status" className="mt-3 text-sm text-emerald-700">Media registered successfully.</p>}
      <button disabled={busy} className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
        {status === "preparing" ? "Preparing…" : status === "uploading" ? "Uploading…" : status === "finalizing" ? "Verifying…" : "Upload image"}
      </button>
    </form>
  );
}

async function imageDimensions(file: File) {
  return new Promise<{ width: number; height: number } | null>((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}
