import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { databaseError } from "@/lib/cms/errors";
import { getPublicSettings } from "@/lib/cms/settings";
import { safeLegacyPublicImageUrl } from "@/lib/public-image";

const PAGE_SIZE = 9;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STATUS_FILTERS = new Set(["registration-open", "upcoming", "past"]);
const PUBLIC_EVENT_COLUMNS =
  "id,title,slug,description,event_date,location,registration_open,cover_image_url";

export type EventFilters = {
  search: string;
  status: "" | "registration-open" | "upcoming" | "past";
  page: number;
};

export type EventLifecycle = "registration_open" | "upcoming" | "completed";
export type EventRegistrationStatus =
  | "open_internal"
  | "open_legacy"
  | "closed"
  | "disabled";

export function parseEventFilters(
  values: Record<string, string | string[] | undefined>,
): EventFilters {
  const first = (name: string) => {
    const value = values[name];
    return (Array.isArray(value) ? value[0] : value ?? "").trim();
  };
  const rawPage = Number(first("page"));
  const status = first("status").toLowerCase();
  return {
    search: first("search")
      .replace(/[^\p{L}\p{N}\s.'-]/gu, " ")
      .replace(/\s+/g, " ")
      .slice(0, 100)
      .trim(),
    status: STATUS_FILTERS.has(status)
      ? (status as EventFilters["status"])
      : "",
    page:
      Number.isSafeInteger(rawPage) && rawPage > 0
        ? Math.min(rawPage, 10_000)
        : 1,
  };
}

export async function listPublicEvents(filters: EventFilters) {
  await connection();
  const nowIso = new Date().toISOString();
  const supabase = createPublicClient();
  const from = (filters.page - 1) * PAGE_SIZE;
  let query = supabase
    .from("events")
    .select(PUBLIC_EVENT_COLUMNS, { count: "exact" })
    .order("event_date", {
      ascending: filters.status !== "past",
      nullsFirst: false,
    })
    .order("id")
    .range(from, from + PAGE_SIZE - 1);

  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`,
    );
  }
  if (filters.status === "registration-open") {
    query = query.eq("registration_open", true);
  }
  if (filters.status === "upcoming") {
    query = query
      .not("registration_open", "eq", true)
      .or(`event_date.gte.${nowIso},event_date.is.null`);
  }
  if (filters.status === "past") {
    query = query
      .not("registration_open", "eq", true)
      .lt("event_date", nowIso);
  }

  const { data, error, count } = await query;
  if (error) throw databaseError("events.public.list", error);

  let formOwners = new Set<string>();
  let formAvailabilityConfirmed = true;
  if (data.length) {
    const forms = await supabase
      .from("forms")
      .select("event_id")
      .in("event_id", data.map((event) => event.id))
      .eq("purpose", "registration")
      .eq("is_active", true)
      .eq("is_public", true)
      .limit(PAGE_SIZE);
    if (forms.error) {
      formAvailabilityConfirmed = false;
      console.error("Public Event form availability unavailable", {
        operation: "events.public.registrationForms",
        code: "database",
      });
    } else {
      formOwners = new Set(
        forms.data.flatMap((form) => (form.event_id ? [form.event_id] : [])),
      );
    }
  }

  const total = count ?? 0;
  return {
    items: data.map((event) => ({
      ...event,
      lifecycle: getEventLifecycle(event, nowIso),
      registrationStatus: getEventRegistrationStatus(
        event,
        formOwners.has(event.id),
        nowIso,
        formAvailabilityConfirmed,
      ),
      coverImageUrl: safeLegacyPublicImageUrl(event.cover_image_url),
    })),
    page: filters.page,
    pageSize: PAGE_SIZE,
    total,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    evaluatedAt: nowIso,
  };
}

export const getPublicEvent = cache(async (slug: string) => {
  if (!isValidEventSlug(slug)) return null;
  await connection();
  const nowIso = new Date().toISOString();
  const supabase = createPublicClient();
  const { data: event, error } = await supabase
    .from("events")
    .select(PUBLIC_EVENT_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw databaseError("events.public.detail", error);
  if (!event || !isValidEventSlug(event.slug)) return null;

  const [photos, form] = await Promise.all([
    supabase
      .from("event_photos")
      .select("id,photo_url,caption,created_at")
      .eq("event_id", event.id)
      .order("created_at")
      .order("id")
      .limit(60),
    supabase
      .from("forms")
      .select("id")
      .eq("event_id", event.id)
      .eq("purpose", "registration")
      .eq("is_active", true)
      .eq("is_public", true)
      .limit(1)
      .maybeSingle(),
  ]);
  if (photos.error) {
    console.error("Public Event gallery unavailable", {
      operation: "events.public.photos",
      code: "database",
    });
  }
  if (form.error) {
    console.error("Public Event form availability unavailable", {
      operation: "events.public.registrationForm",
      code: "database",
    });
  }
  const hasActiveRegistrationForm = !form.error && Boolean(form.data);
  return {
    event,
    photos: (photos.data ?? []).flatMap((photo) => {
      const photoUrl = safeLegacyPublicImageUrl(photo.photo_url);
      return photoUrl ? [{ ...photo, photoUrl }] : [];
    }),
    lifecycle: getEventLifecycle(event, nowIso),
    registrationStatus: getEventRegistrationStatus(
      event,
      hasActiveRegistrationForm,
      nowIso,
      !form.error,
    ),
    hasActiveRegistrationForm,
    coverImageUrl: safeLegacyPublicImageUrl(event.cover_image_url),
    evaluatedAt: nowIso,
  };
});

export const getEventMetadataDefaults = cache(getPublicSettings);

export function isValidEventSlug(slug: string) {
  return slug.length <= 160 && SLUG_PATTERN.test(slug);
}

export function getEventLifecycle(
  event: { event_date: string | null; registration_open: boolean | null },
  now = new Date().toISOString(),
): EventLifecycle {
  if (event.registration_open) return "registration_open";
  if (!event.event_date) return "upcoming";
  return new Date(now).getTime() <= new Date(event.event_date).getTime()
    ? "upcoming"
    : "completed";
}

export function getEventRegistrationStatus(
  event: { event_date: string | null; registration_open: boolean | null },
  hasActiveForm: boolean,
  now = new Date().toISOString(),
  availabilityConfirmed = true,
): EventRegistrationStatus {
  if (!event.registration_open) return "disabled";
  if (!availabilityConfirmed) return "disabled";
  return hasActiveForm ? "open_internal" : "open_legacy";
}
