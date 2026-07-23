"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
  LoaderCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteEmbedding, syncEmbedding } from "@/lib/syncEmbedding";
import type { ProgrammeRecord } from "@/lib/programmes";

type StatusFilter = "all" | "published" | "draft" | "featured";

export default function ProgrammesAdminClient({
  initialProgrammes,
}: {
  initialProgrammes: ProgrammeRecord[];
}) {
  const [programmes, setProgrammes] = useState(initialProgrammes);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const warning = sessionStorage.getItem("programme-admin-warning");
      if (warning) {
        setError(warning);
        sessionStorage.removeItem("programme-admin-warning");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const filteredProgrammes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return programmes.filter((programme) => {
      if (query && !programme.title.toLowerCase().includes(query)) return false;
      if (filter === "published" && !programme.published) return false;
      if (filter === "draft" && programme.published) return false;
      if (filter === "featured" && !programme.featured) return false;
      return true;
    });
  }, [filter, programmes, search]);

  async function updateFlags(
    programme: ProgrammeRecord,
    changes: Pick<ProgrammeRecord, "published"> | Pick<ProgrammeRecord, "featured">
  ) {
    if (busyId) return;
    setBusyId(programme.id);
    setError("");

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("programmes")
      .update(changes)
      .eq("id", programme.id);

    if (updateError) {
      setError(updateError.message);
      setBusyId("");
      return;
    }

    setProgrammes((current) =>
      current.map((item) =>
        item.id === programme.id ? { ...item, ...changes } : item
      )
    );

    if ("published" in changes) {
      if (changes.published) {
        const searchableText = [
          `Programme: ${programme.title}`,
          programme.short_summary,
          programme.full_description || programme.description,
          programme.category && `Category: ${programme.category}`,
          programme.delivery_mode &&
            `Delivery mode: ${programme.delivery_mode}`,
          programme.eligibility &&
            `Eligibility: ${programme.eligibility}`,
        ]
          .filter(Boolean)
          .join("\n");
        syncEmbedding("programme", programme.id, searchableText);
      } else {
        deleteEmbedding("programme", programme.id);
      }
    }

    setBusyId("");
  }

  async function deleteProgramme(programme: ProgrammeRecord) {
    if (busyId) return;
    if (
      !confirm(
        `Delete "${programme.title}"? Its modules and learning outcomes will also be deleted. This cannot be undone.`
      )
    ) {
      return;
    }

    setBusyId(programme.id);
    setError("");
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("programmes")
      .delete()
      .eq("id", programme.id);

    if (deleteError) {
      setError(deleteError.message);
      setBusyId("");
      return;
    }

    let cleanupWarning = "";
    if (programme.featured_image_path) {
      const { error: storageError } = await supabase.storage
        .from("content-images")
        .remove([programme.featured_image_path]);
      if (storageError) {
        cleanupWarning =
          " The database record was deleted, but its image could not be removed from Storage.";
      }
    }

    deleteEmbedding("programme", programme.id);
    setProgrammes((current) =>
      current.filter((item) => item.id !== programme.id)
    );
    setError(cleanupWarning.trim());
    setBusyId("");
  }

  const filters: Array<{ value: StatusFilter; label: string }> = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Drafts" },
    { value: "featured", label: "Featured" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Programmes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, organise, and publish programme content.
          </p>
        </div>
        <Link
          href="/admin/programmes/new"
          className="flex shrink-0 items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700"
        >
          <Plus size={18} /> New Programme
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">Search programmes by title</span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </label>

          <div className="flex flex-wrap gap-2" aria-label="Programme filters">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-3 py-2 text-xs font-medium transition-colors ${
                  filter === item.value
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-rose-700"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
      </div>

      <div className="mt-6 space-y-4 md:hidden">
        {filteredProgrammes.map((programme) => (
          <ProgrammeCard
            key={programme.id}
            programme={programme}
            busy={busyId === programme.id}
            onPublished={() =>
              updateFlags(programme, { published: !programme.published })
            }
            onFeatured={() =>
              updateFlags(programme, { featured: !programme.featured })
            }
            onDelete={() => deleteProgramme(programme)}
          />
        ))}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white md:block">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Featured</th>
              <th className="px-6 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProgrammes.map((programme) => (
              <tr key={programme.id} className="border-t border-gray-100">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{programme.title}</p>
                  <p className="mt-1 text-xs text-gray-500">/{programme.slug}</p>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {programme.category || "—"}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {programme.display_order}
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onClick={() =>
                      updateFlags(programme, {
                        published: !programme.published,
                      })
                    }
                    className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                      programme.published
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {programme.published ? "Published" : "Draft"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    type="button"
                    disabled={Boolean(busyId)}
                    onClick={() =>
                      updateFlags(programme, {
                        featured: !programme.featured,
                      })
                    }
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
                      programme.featured
                        ? "bg-amber-50 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Star
                      size={13}
                      fill={programme.featured ? "currentColor" : "none"}
                    />
                    {programme.featured ? "Featured" : "Standard"}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    {busyId === programme.id ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin text-gray-400"
                      />
                    ) : (
                      <>
                        <Link
                          href={`/admin/programmes/${programme.id}/edit`}
                          className="inline-flex items-center gap-1 text-rose-700 hover:underline"
                        >
                          <Pencil size={14} /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteProgramme(programme)}
                          disabled={Boolean(busyId)}
                          className="inline-flex items-center gap-1 text-red-600 hover:underline disabled:opacity-50"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredProgrammes.length === 0 && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500">
          {programmes.length === 0
            ? "No programmes yet."
            : "No programmes match this search and filter."}
        </div>
      )}
    </div>
  );
}

function ProgrammeCard({
  programme,
  busy,
  onPublished,
  onFeatured,
  onDelete,
}: {
  programme: ProgrammeRecord;
  busy: boolean;
  onPublished: () => void;
  onFeatured: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold text-gray-900">{programme.title}</h2>
          <p className="mt-1 truncate text-xs text-gray-500">
            /{programme.slug}
          </p>
        </div>
        {busy && (
          <LoaderCircle size={18} className="shrink-0 animate-spin text-gray-400" />
        )}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs text-gray-500">Category</dt>
          <dd className="mt-1 text-gray-800">{programme.category || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Display order</dt>
          <dd className="mt-1 text-gray-800">{programme.display_order}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onPublished}
          className={`rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
            programme.published
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {programme.published ? "Published" : "Draft"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onFeatured}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${
            programme.featured
              ? "bg-amber-50 text-amber-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          <Star
            size={13}
            fill={programme.featured ? "currentColor" : "none"}
          />
          {programme.featured ? "Featured" : "Standard"}
        </button>
      </div>
      <div className="mt-5 flex items-center gap-4 border-t border-gray-100 pt-4 text-sm">
        <Link
          href={`/admin/programmes/${programme.id}/edit`}
          className="inline-flex items-center gap-1 font-medium text-rose-700"
        >
          <Pencil size={14} /> Edit
        </Link>
        <button
          type="button"
          disabled={busy}
          onClick={onDelete}
          className="inline-flex items-center gap-1 font-medium text-red-600 disabled:opacity-50"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </article>
  );
}
