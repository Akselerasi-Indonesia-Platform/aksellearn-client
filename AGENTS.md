# Agent Instructions — aksellearn-client

This file is read by AI coding agents (Claude Code, Cursor, GitHub Copilot,
etc.) working in this repository.

## Versioning & releases

**Read [VERSIONING.md](VERSIONING.md) before merging anything to `main` or
creating a git tag.** It defines the SemVer policy, commit message conventions,
tagging rules, and a step-by-step checklist for cutting a release. The current
version is tracked in `package.json`'s `"version"` field; release notes are in
[CHANGELOG.md](CHANGELOG.md).

In short:
- Commit prefix decides the bump: `fix:` → patch, `feat:` → minor, breaking → major.
- Tags are annotated, formatted `vX.Y.Z`, matching `package.json`, and pushed with `git push origin vX.Y.Z`.
- Every tagged release updates `package.json`'s version and adds a `CHANGELOG.md` entry in the same commit.
- Tags do not trigger deploys — `deploy.yml` deploys on every push to `main`. Tags are release/rollback markers only.

## Related repository

The backend lives in a sibling repository, `aksellearn-api`
(Akselerasi-Indonesia-Platform/aksellearn-api), which has its own
`VERSIONING.md` following the same policy. Changes that span both repos
(e.g. a new API endpoint plus the UI that calls it) should be versioned and
tagged independently in each repo, but the changelog entries should
cross-reference each other's PR numbers where relevant.
