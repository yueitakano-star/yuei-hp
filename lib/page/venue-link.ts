import type { Venue } from "@/lib/content";

/** C-girl has a dedicated storefront; its listing cards open it directly. */
export function venueCardHref(venue: Pick<Venue, "business" | "slug" | "siteUrl">): string {
  if (venue.business === "nightlife" && venue.slug === "c-girl" && venue.siteUrl) return venue.siteUrl;
  return `/business/${venue.business}/${venue.slug}`;
}
