# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/). See
[VERSIONING.md](VERSIONING.md) for the full policy and the checklist AI agents
must follow when cutting a release.

## [Unreleased]

## [1.3.0] - 2026-08-25

### Added
- Redesigned the mobile hamburger nav drawer to match Coursera's mobile
  menu: fixed logo/close header, plain divided list rows with chevrons,
  and a pinned footer with a solid "Daftar" CTA above an outline "Masuk"
  button. Dropped the search field from the mobile drawer. (#21)

### Fixed
- Course thumbnail video-preview play icon was invisible on mobile,
  desktop, and tablet until hover; now always visible on every device.
  (#19, #20)
- GitHub Actions deploy could fail with a Docker container name
  conflict on redeploy due to a stale container not being fully
  removed. (#18)

## [1.2.0] - 2026-08-25

### Added
- Self-hosted Mona Sans as the site-wide font, replacing a long-standing
  bug where `--font-sans` was never actually defined for the default or
  light admin theme, so the app silently fell back to the browser
  default font everywhere. (#15)

### Fixed
- 12 files used a responsive `grid` pattern with no base `grid-cols-1`,
  letting CSS Grid auto-size mobile columns to content width instead of
  the viewport and causing text/cards to overflow off-screen on phones.
  Also fixed clipped course-detail CTA buttons and an oversized sticky
  syllabus sidebar on the course learning page at mobile widths. (#15)
- New users signing up via Google never saw the "What is your primary
  goal?" onboarding modal, because `/auth/callback` called `setAuth()`
  without forwarding `onboarding_required` from the profile response.
  Now consistent with manual registration. (#16)
- `/verify-email` and `/reset-password` could be hijacked mid-flow:
  `rehydrate()`'s OAuth token handshake read the `token` query param on
  every route, not just `/auth/callback`, so it mistook those pages'
  unrelated single-use tokens for a JWT access token, corrupted the
  session, and stripped the token from the URL. (#17)

## [1.1.0] - 2026-08-25

### Added
- "Continue with Google" button on the `/register` page, matching the existing
  option on `/login`, using the same OAuth redirect flow. (#14)

## [1.0.0] - 2026-08-25

### Added
- Baseline release. This is the first tagged version of the client; all
  history before this point was not tracked with SemVer tags or a changelog.
