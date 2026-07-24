import "server-only";

import { cache } from "react";
import { getPublishedPage, getOrderedPublishedSections } from "@/lib/cms/pages";
import { getPublicSettings } from "@/lib/cms/settings";
import { getPublicContactFormSettings } from "@/lib/cms/contact";
import { listPublicOffices } from "@/lib/cms/offices";
import { listPublicTeam } from "@/lib/cms/team";
import { listPublicPartners } from "@/lib/cms/partners";
import { listGlobalFaqs, listPageFaqs } from "@/lib/cms/faqs";
import {
  createPublishedMediaSignedUrl,
  type PublishedMediaReference,
} from "@/lib/cms/media";
import { getPublicShellData } from "@/lib/cms/public-site";

export type InstitutionalPageKey = "about" | "contact";

async function optional<T>(
  operation: string,
  loader: () => Promise<T>,
  fallback: T,
) {
  try {
    return await loader();
  } catch (error) {
    console.error("Public institutional module unavailable", {
      operation,
      code: error instanceof Error ? error.name : "unknown",
    });
    return fallback;
  }
}

async function sign(reference: PublishedMediaReference | null) {
  if (!reference) return null;
  return optional(
    "institutional.media.sign",
    () => createPublishedMediaSignedUrl(reference),
    null,
  );
}

export const getPublicInstitutionalPage = cache(
  async (pageKey: InstitutionalPageKey) => {
    const [page, settings, offices, team, partners, globalFaqs, contactForm, shell] =
      await Promise.all([
        optional(`institutional.${pageKey}.page`, () => getPublishedPage(pageKey), null),
        optional("institutional.settings", getPublicSettings, null),
        optional("institutional.offices", listPublicOffices, []),
        optional("institutional.team", listPublicTeam, []),
        optional("institutional.partners", listPublicPartners, []),
        optional("institutional.faqs.global", listGlobalFaqs, []),
        pageKey === "contact"
          ? optional("institutional.contact.form", getPublicContactFormSettings, null)
          : Promise.resolve(null),
        optional("institutional.shell", getPublicShellData, null),
      ]);
    const [sections, pageFaqs] = page
      ? await Promise.all([
          optional(
            `institutional.${pageKey}.sections`,
            () => getOrderedPublishedSections(page.id),
            [],
          ),
          optional(
            `institutional.${pageKey}.faqs`,
            () => listPageFaqs(page.id),
            [],
          ),
        ])
      : [[], []];

    const [sectionImages, teamImages, partnerImages] = await Promise.all([
      Promise.all(
        sections.map((section) =>
          section.media_path
            ? sign({
                kind: "section",
                ownerId: section.id,
                objectPath: section.media_path,
              })
            : null,
        ),
      ),
      Promise.all(
        team.slice(0, 48).map((member) =>
          member.photo_path
            ? sign({
                kind: "team",
                ownerId: member.id,
                objectPath: member.photo_path,
              })
            : null,
        ),
      ),
      Promise.all(
        partners.slice(0, 48).map((partner) =>
          partner.logo_path
            ? sign({
                kind: "partner",
                ownerId: partner.id,
                objectPath: partner.logo_path,
              })
            : null,
        ),
      ),
    ]);

    const faqMap = new Map<string, (typeof globalFaqs)[number]>();
    [...globalFaqs, ...pageFaqs].forEach((faq) => {
      const key = faq.question.trim().toLocaleLowerCase();
      if (!faqMap.has(key)) faqMap.set(key, faq);
    });

    return {
      page,
      settings,
      contactForm,
      socialLinks: shell?.socialLinks ?? [],
      sections: sections.map((section, index) => ({
        ...section,
        imageUrl: sectionImages[index],
      })),
      offices: offices.slice(0, 24),
      team: team.slice(0, 48).map((member, index) => ({
        ...member,
        imageUrl: teamImages[index],
      })),
      partners: partners.slice(0, 48).map((partner, index) => ({
        ...partner,
        imageUrl: partnerImages[index],
      })),
      faqs: [...faqMap.values()].slice(0, 40),
    };
  },
);

export type InstitutionalPageData = Awaited<
  ReturnType<typeof getPublicInstitutionalPage>
>;
