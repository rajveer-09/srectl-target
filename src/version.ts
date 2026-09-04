/**
 * Semantic version parsing and ordering.
 *
 * Used to decide whether a fetched manifest is newer than the cached one, so
 * the ordering has to match the registry's, not just be self-consistent.
 */
export interface Version {
  major: number;
  minor: number;
  patch: number;
  /** Dot-separated identifiers after `-`, e.g. "rc.1". Absent for a release. */
  prerelease?: string;
}

const PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

export function parseVersion(input: string): Version {
  const match = PATTERN.exec(input.trim());
  if (!match) throw new RangeError(`not a semantic version: ${input}`);

  const [, major, minor, patch, prerelease] = match;
  return {
    major: Number(major),
    minor: Number(minor),
    patch: Number(patch),
    ...(prerelease ? { prerelease } : {}),
  };
}

/** Negative when `a` sorts first, positive when `b` does, zero when equal. */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);

  for (const key of ["major", "minor", "patch"] as const) {
    if (left[key] !== right[key]) return left[key] < right[key] ? -1 : 1;
  }

  if (left.prerelease === right.prerelease) return 0;
  // A release outranks any prerelease of the same core version.
  if (!left.prerelease) return 1;
  if (!right.prerelease) return -1;
  return comparePrerelease(left.prerelease, right.prerelease);
}

/**
 * SemVer 2.0.0 prerelease precedence.
 *
 * Compared identifier by identifier: numeric ones numerically, everything else
 * by ASCII order, and a numeric identifier always ranks below an alphanumeric
 * one. When one side runs out of identifiers first it sorts lower, so
 * `1.0.0-rc` precedes `1.0.0-rc.1`.
 */
function comparePrerelease(a: string, b: string): number {
  const left = a.split(".");
  const right = b.split(".");

  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const l = left[i];
    const r = right[i];
    if (l === undefined) return -1;
    if (r === undefined) return 1;
    if (l === r) continue;

    const lNumeric = /^\d+$/.test(l);
    const rNumeric = /^\d+$/.test(r);
    if (lNumeric && rNumeric) return Number(l) < Number(r) ? -1 : 1;
    if (lNumeric !== rNumeric) return lNumeric ? -1 : 1;
    return l < r ? -1 : 1;
  }

  return 0;
}

/** The highest version in the list. Throws on an empty list. */
export function latest(versions: string[]): string {
  if (versions.length === 0) throw new RangeError("no versions given");
  return versions.reduce((best, v) => (compareVersions(v, best) > 0 ? v : best));
}

/** True when `version` is at least `minimum`. */
export function satisfiesMinimum(version: string, minimum: string): boolean {
  return compareVersions(version, minimum) >= 0;
}
