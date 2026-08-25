# Versioning & Release Policy — aksellearn-client

This document is the single source of truth for how this repository is versioned,
tagged, and released. It applies equally to human contributors and AI coding
agents (Claude Code, Cursor, Copilot, etc.) working in this repo. If you are an
AI agent about to merge a PR into `main`, read the "Agent checklist" section at
the bottom before you do anything else.

This repo follows the **same policy** as the sibling backend repo,
`aksellearn-api` (see its `VERSIONING.md`), adapted for a Node/Bun project.

## 1. Versioning scheme

We use [Semantic Versioning 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`.

| Bump  | When to use it                                                                 | Example                                                        |
|-------|-----------------------------------------------------------------------------------|-----------------------------------------------------------------|
| MAJOR | Breaking change: a route/URL contract break, a required env var renamed with no fallback, dropping support for a browser/runtime | Reworking the auth cookie contract in a way old sessions can't survive |
| MINOR | New backward-compatible feature: new page, new UI entry point, new optional prop/flag | Adding the "Continue with Google" button to `/register`         |
| PATCH | Backward-compatible bug fix, hotfix, styling fix, dependency bump with no behavior change | Fixing a broken proxy route or a layout bug                     |

The version number is tracked in **`package.json`'s `"version"` field**. This
is the source of truth — if it disagrees with the latest git tag, the git tag
wins and `package.json` must be corrected.

## 2. Commit message convention

We use [Conventional Commits](https://www.conventionalcommits.org/). This is
what maps a change to a version bump — get the prefix right:

- `fix: ...` → PATCH
- `feat: ...` → MINOR
- `feat!: ...` / `fix!: ...` / footer `BREAKING CHANGE: ...` → MAJOR
- `chore: `, `docs: `, `refactor: `, `test: `, `ci: `, `style: ` → no version bump by themselves (they ride along with the next real release)

## 3. Branch naming

- `feat/<short-description>` — new feature, merges as MINOR
- `fix/<short-description>` — bug fix, merges as PATCH
- `hotfix/<short-description>` — urgent PATCH shipped outside the normal cadence, same rules as `fix/*` but tagged and pushed immediately after merge (see §5)
- `chore/<short-description>` — no functional change

## 4. Tagging rules

- Tags live on `main` only, and always point at a commit that is actually on `main`
  (the merge commit, or a direct commit if the change was pushed straight to `main`).
- **Always use annotated tags**, never lightweight tags:
  ```bash
  git tag -a v1.1.0 -m "Release notes here"
  git push origin v1.1.0
  ```
- Tag format: `vMAJOR.MINOR.PATCH` — no `v1.1`, no `1.1.0`, no build metadata suffixes.
- The tag version must exactly match `package.json`'s `"version"` field at that
  commit (minus the `v` prefix).
- One tag per release. Do not move or force-push a tag once it has been pushed
  to `origin` — if a release was wrong, ship a new PATCH instead of rewriting
  history.
- The annotated tag message is a mini changelog: what changed, why, and the PR
  number(s) it came from. This is also copied into `CHANGELOG.md`.

## 5. Hotfix policy

A "hotfix" is an urgent PATCH release, usually a production bug found right
after deploy. Because this repo deploys directly on every push to `main` (see
§6), hotfixes don't need a separate release branch:

1. Branch from `main`: `hotfix/<short-description>` (or `fix/<short-description>`).
2. Open a PR, merge to `main` as usual.
3. Immediately bump `package.json`'s version, add a `CHANGELOG.md` entry, tag,
   and push the tag — don't let a hotfix sit untagged. See the checklist in §7.

## 6. Relationship to CI/CD

`/.github/workflows/deploy.yml` builds and deploys on **every push to `main`**,
independent of tags. Git tags in this repo are **release/rollback markers**,
not deploy triggers. Do not assume creating a tag deploys anything — the
deploy already happened when the PR was merged to `main`.

> Future improvement (not yet implemented): have the Docker image build also
> get tagged with the git tag value in addition to the current branch/sha
> tags, so a deployed image can be traced back to an exact release. If you
> implement this, update this section.

## 7. Agent checklist — do this every time you merge to `main`

After a PR is merged into `main` (by you or by a human), before you consider
the task done:

1. Determine the bump: look at the PR's commit prefixes (`fix:` → PATCH,
   `feat:` → MINOR, breaking → MAJOR). If multiple PRs are being released
   together, use the highest bump among them.
2. Bump `"version"` in `package.json` to the new version number (no `v`
   prefix, e.g. `"1.1.0"`).
3. Add an entry to `CHANGELOG.md` under a new `## [X.Y.Z] - YYYY-MM-DD`
   heading, in [Keep a Changelog](https://keepachangelog.com/) style
   (`### Added` / `### Fixed` / `### Changed` / `### Removed`), referencing
   the PR number(s).
4. Commit both files together: `chore: release vX.Y.Z`.
5. Tag that commit and push the tag:
   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z: <one-line summary>"
   git push origin main
   git push origin vX.Y.Z
   ```
6. Do **not** invent a version number that isn't the very next SemVer step
   from the latest existing tag (`git tag -l | sort -V | tail -1`) — always
   check first, and make sure it matches `package.json`.
