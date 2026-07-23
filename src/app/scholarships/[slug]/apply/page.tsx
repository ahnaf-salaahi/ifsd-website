import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DynamicRegistrationForm from "@/components/DynamicRegistrationForm";
import { getActiveRegistrationForm } from "@/lib/registration/server";
import { getPublicScholarship } from "@/lib/scholarships-public";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicScholarship(slug);
  if (!result) {
    return {
      title: "Scholarship Application Unavailable",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `Apply for ${result.scholarship.title}`,
    description: `Application form for ${result.scholarship.title}.`,
    robots: { index: false, follow: false },
    alternates: { canonical: `/scholarships/${slug}/apply` },
    openGraph: { images: ["/logo-v2.png"] },
  };
}

export default async function ScholarshipApplicationPage({
  params,
}: PageProps) {
  const { slug } = await params;
  const result = await getPublicScholarship(slug);
  if (!result) notFound();

  if (!result.applicationAvailable) {
    return (
      <ApplicationUnavailable
        title={result.scholarship.title}
        status={result.deadlineStatus}
      />
    );
  }

  const form = await getActiveRegistrationForm(
    "scholarship",
    result.scholarship.id,
  );
  if (!form || form.id !== result.formId) {
    return (
      <ApplicationUnavailable
        title={result.scholarship.title}
        status="form_unavailable"
      />
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-16">
      <p className="text-sm font-medium text-rose-700">
        Scholarship application
      </p>
      <h1 className="mt-2 text-3xl font-semibold text-gray-900">
        {result.scholarship.title}
      </h1>
      {result.scholarship.deadline && (
        <p className="mt-3 text-sm text-gray-600">
          Applications close at the end of{" "}
          <time dateTime={result.scholarship.deadline}>
            {formatDate(result.scholarship.deadline)}
          </time>
          , Sri Lanka time.
        </p>
      )}
      <div className="mt-8">
        <DynamicRegistrationForm
          form={form}
          ownerTitle={result.scholarship.title}
          submitLabel="Submit Application"
        />
      </div>
    </main>
  );
}

function ApplicationUnavailable({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  const message =
    status === "closed"
      ? "The application deadline has passed."
      : status === "form_unavailable"
        ? "The application form is not currently available."
        : "Applications are not currently available for this Scholarship.";
  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-rose-600">
        Application unavailable
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-gray-900">{title}</h1>
      <p className="mt-4 text-gray-600">{message}</p>
      <Link
        href="/scholarships"
        className="mt-8 inline-flex rounded-full bg-rose-600 px-6 py-3 text-sm font-medium text-white hover:bg-rose-700"
      >
        View Scholarships
      </Link>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Colombo",
  }).format(new Date(`${value}T12:00:00+05:30`));
}
