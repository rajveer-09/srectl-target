# srectl-target

A deliberately small TypeScript library. It exists to be reviewed, indexed, and
tested by [SREctl](https://github.com/rajveer-09) — not to be useful.

## Shape

| Module | Depends on | Test coverage |
|---|---|---|
| `src/money.ts` | — | partial |
| `src/invoice.ts` | `money` | none |
| `src/parse-duration.ts` | — | none |
| `src/retry.ts` | `parse-duration` | none |
| `src/slug.ts` | — | full |

The uneven coverage is intentional. Phase 2 of SREctl selects targets by
uncovered lines weighted by import-graph centrality, and `money.ts` having a
caller (`invoice.ts`) while `slug.ts` has none is the distinction that ranking
is supposed to notice.

## Commands

```bash
npm ci
npm test
npm run test:coverage
```
