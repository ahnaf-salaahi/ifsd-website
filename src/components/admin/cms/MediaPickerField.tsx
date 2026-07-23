"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MediaUpload from "./MediaUpload";

export type MediaPickerOption = {
  id: string;
  objectPath: string;
  filename: string;
  mediaKind: string;
  signedUrl: string | null;
  altText: string | null;
};

export default function MediaPickerField({
  name,
  label,
  value,
  options,
  compatibleKinds,
  ownerId,
  uploadKind,
}: {
  name: string;
  label: string;
  value?: string | null;
  options: MediaPickerOption[];
  compatibleKinds: string[];
  ownerId?: string;
  uploadKind?: string;
}) {
  const [selected, setSelected] = useState(value ?? "");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const filtered = options.filter(
    (item) =>
      compatibleKinds.includes(item.mediaKind) || item.mediaKind === "general",
  );
  const selectedItem = options.find((item) => item.objectPath === selected);
  const pageSize = 9;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    if (!open) return;
    dialogRef.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input type="hidden" name={name} value={selected} />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {selectedItem?.signedUrl ? (
          // Short-lived administrator preview; it is never persisted.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedItem.signedUrl}
            alt={selectedItem.altText || selectedItem.filename}
            className="h-20 w-28 rounded-lg border object-cover"
          />
        ) : (
          <div className="flex h-20 w-28 items-center justify-center rounded-lg border bg-gray-50 text-xs text-gray-400">
            No media
          </div>
        )}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50"
        >
          Choose media
        </button>
        {selected && (
          <button
            type="button"
            onClick={() => setSelected("")}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Remove relationship
          </button>
        )}
      </div>
      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setOpen(false);
              triggerRef.current?.focus();
            }
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Choose ${label}`}
            tabIndex={-1}
            className="max-h-[85vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl outline-none sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Choose media
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Showing compatible registered media. Uploads are available in
                  the Media Library.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close media picker"
                onClick={() => {
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                className="rounded-lg border px-3 py-1.5 text-sm"
              >
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setSelected(item.objectPath);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={`rounded-xl border p-3 text-left ${
                    selected === item.objectPath
                      ? "border-rose-500 ring-2 ring-rose-100"
                      : "border-gray-200 hover:border-rose-300"
                  }`}
                >
                  {item.signedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.signedUrl}
                      alt={item.altText || item.filename}
                      className="h-28 w-full rounded-lg bg-gray-50 object-cover"
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-400">
                      Preview unavailable
                    </div>
                  )}
                  <span className="mt-2 block truncate text-sm font-medium">
                    {item.filename}
                  </span>
                  <span className="text-xs text-gray-500">{item.mediaKind}</span>
                </button>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <button type="button" disabled={page === 0} onClick={() => setPage((value) => Math.max(0, value - 1))} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button>
                <span>Page {page + 1} of {totalPages}</span>
                <button type="button" disabled={page >= totalPages - 1} onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button>
              </div>
            )}
            {filtered.length === 0 && (
              <div className="mt-6 rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No compatible media is registered.
              </div>
            )}
            <Link
              href="/admin/cms/media"
              className="mt-5 inline-flex text-sm font-medium text-rose-600"
            >
              Open Media Library
            </Link>
            <MediaUpload
              compact
              fixedKind
              defaultKind={uploadKind ?? compatibleKinds[0] ?? "general"}
              ownerId={ownerId}
            />
          </div>
        </div>
      )}
    </div>
  );
}
