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
    const l = String(left[key]);
    const r = String(right[key]);
    if (l !== r) return l < r ? -1 : 1;
  }

  if (left.prerelease === right.prerelease) return 0;
  if (!left.prerelease) return 1;
  if (!right.prerelease) return -1;
  return left.prerelease < right.prerelease ? -1 : 1;
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
