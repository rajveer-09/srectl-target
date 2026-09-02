/** URL-safe slugs. Fully covered by tests - the control case for coverage ranking. */

export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncateSlug(slug: string, maxLength: number): string {
  if (maxLength <= 0) throw new RangeError("maxLength must be positive");
  if (slug.length <= maxLength) return slug;
  return slug.slice(0, maxLength).replace(/-+$/, "");
}
