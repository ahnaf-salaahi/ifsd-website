"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { SuccessStoryRecord } from "@/lib/success-stories";

type Filter = "all" | "published" | "draft" | "featured";

export default function SuccessStoriesAdminClient({
  initialStories,
}: {
  initialStories: SuccessStoryRecord[];
}) {
  const [stories, setStories] = useState(initialStories);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const warning = sessionStorage.getItem("success-story-admin-warning");
      if (warning) {
        setError(warning);
        sessionStorage.removeItem("success-story-admin-warning");
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return stories.filter((story) => {
      if (
        query &&
        !story.person_name.toLowerCase().includes(query) &&
        !story.story_title.toLowerCase().includes(query)
      ) {
        return false;
      }
      if (filter === "published" && !story.published) return false;
      if (filter === "draft" && story.published) return false;
      if (filter === "featured" && !story.featured) return false;
      return true;
    });
  }, [filter, search, stories]);

  async function updateFlag(
    story: SuccessStoryRecord,
    changes:
      | Pick<SuccessStoryRecord, "published">
      | Pick<SuccessStoryRecord, "featured">
  ) {
    if (busyId) return;
    setBusyId(story.id);
    setError("");
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("success_stories")
      .update(changes)
      .eq("id", story.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setStories((current) =>
        current.map((item) =>
          item.id === story.id ? { ...item, ...changes } : item
        )
      );
    }
    setBusyId("");
  }

  async function deleteStory(story: SuccessStoryRecord) {
    if (busyId) return;
    if (
      !confirm(
        `Delete "${story.story_title}" for ${story.person_name}? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusyId(story.id);
    setError("");
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("success_stories")
      .delete()
      .eq("id", story.id);

    if (deleteError) {
      setError(deleteError.message);
      setBusyId("");
      return;
    }

    const paths = [story.profile_image_path, story.cover_image_path].filter(
      (path): path is string => Boolean(path)
    );
    if (paths.length) {
      const { error: imageError } = await supabase.storage
        .from("content-images")
        .remove(paths);
      if (imageError) {
        setError(
          `Story deleted, but one or more images could not be removed: ${imageError.message}`
        );
      }
    }

    setStories((current) => current.filter((item) => item.id !== story.id));
    setBusyId("");
  }

  const filters: Array<{ value: Filter; label: string }> = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "draft", label: "Drafts" },
    { value: "featured", label: "Featured" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Success Stories
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage testimonials, achievements, and alumni stories.
          </p>
        </div>
        <Link
          href="/admin/success-stories/new"
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-rose-700"
        >
          <Plus size={18} /> New Success Story
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-sm">
            <span className="sr-only">
              Search by person name or story title
            </span>
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search person or story"
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            {filters.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-3 py-2 text-xs font-medium ${
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

      <div className="mt-6 grid gap-4 md:hidden">
        {filtered.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            busy={busyId === story.id}
            onPublished={() =>
              updateFlag(story, { published: !story.published })
            }
            onFeatured={() =>
              updateFlag(story, { featured: !story.featured })
            }
            onDelete={() => deleteStory(story)}
          />
        ))}
      </div>

      <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white md:block">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-gray-50 text-left text-gray-500">
            <tr>
              <th className="px-6 py-3 font-medium">Story</th>
              <th className="px-6 py-3 font-medium">Person</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Featured</th>
              <th className="px-6 py-3 font-medium">Order</th>
              <th className="px-6 py-3 font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((story) => (
              <tr key={story.id} className="border-t border-gray-100">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">
                    {story.story_title}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">/{story.slug}</p>
                </td>
                <td className="px-6 py-4 text-gray-700">
                  {story.person_name}
                </td>
                <td className="px-6 py-4">
                  <StatusButton
                    active={story.published}
                    activeLabel="Published"
                    inactiveLabel="Draft"
                    disabled={Boolean(busyId)}
                    onClick={() =>
                      updateFlag(story, { published: !story.published })
                    }
                  />
                </td>
                <td className="px-6 py-4">
                  <StatusButton
                    active={story.featured}
                    activeLabel="Featured"
                    inactiveLabel="Standard"
                    featured
                    disabled={Boolean(busyId)}
                    onClick={() =>
                      updateFlag(story, { featured: !story.featured })
                    }
                  />
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {story.display_order}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    {busyId === story.id ? (
                      <LoaderCircle
                        size={17}
                        className="animate-spin text-gray-400"
                      />
                    ) : (
                      <>
                        <Link
                          href={`/admin/success-stories/${story.id}/edit`}
                          className="inline-flex items-center gap-1 text-rose-700 hover:underline"
                        >
                          <Pencil size={14} /> Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteStory(story)}
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

      {filtered.length === 0 && (
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white px-6 py-10 text-center text-sm text-gray-500">
          {stories.length === 0
            ? "No Success Stories yet."
            : "No stories match this search and filter."}
        </div>
      )}
    </div>
  );
}

function StatusButton({
  active,
  activeLabel,
  inactiveLabel,
  featured,
  disabled,
  onClick,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
  featured?: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${
        active
          ? featured
            ? "bg-amber-50 text-amber-700"
            : "bg-green-50 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {featured && (
        <Star size={13} fill={active ? "currentColor" : "none"} />
      )}
      {active ? activeLabel : inactiveLabel}
    </button>
  );
}

function StoryCard({
  story,
  busy,
  onPublished,
  onFeatured,
  onDelete,
}: {
  story: SuccessStoryRecord;
  busy: boolean;
  onPublished: () => void;
  onFeatured: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">{story.story_title}</h2>
          <p className="mt-1 text-sm text-gray-600">{story.person_name}</p>
        </div>
        {busy && <LoaderCircle size={18} className="animate-spin text-gray-400" />}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusButton
          active={story.published}
          activeLabel="Published"
          inactiveLabel="Draft"
          disabled={busy}
          onClick={onPublished}
        />
        <StatusButton
          active={story.featured}
          activeLabel="Featured"
          inactiveLabel="Standard"
          featured
          disabled={busy}
          onClick={onFeatured}
        />
      </div>
      <div className="mt-5 flex gap-4 border-t border-gray-100 pt-4 text-sm">
        <Link
          href={`/admin/success-stories/${story.id}/edit`}
          className="inline-flex items-center gap-1 font-medium text-rose-700"
        >
          <Pencil size={14} /> Edit
        </Link>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          className="inline-flex items-center gap-1 font-medium text-red-600 disabled:opacity-50"
        >
          <Trash2 size={14} /> Delete
        </button>
      </div>
    </article>
  );
}
