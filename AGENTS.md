# LittlePlay repository instructions

Read docs/BRANCHING_AND_RELEASE.md before changing branch refs or synchronizing source.

- Workflow: develop -> release-X.Y.Z -> transition -> master.
- develop is the Sites/Cloudflare development and sync target. Never copy raw Sites source into transition or master.
- Preserve GitHub-owned AGENTS.md, docs/BRANCHING_AND_RELEASE.md, and vercel.json when syncing develop from Sites. Commit the sync; do not reset or force-push its history.
- release-* branches are frozen source snapshots. Do not edit or re-sync an existing release branch. Create the next version from a reviewed develop commit.
- transition is persistent. Incorporate a named release snapshot, preserving native Next.js, Postgres, Blob, and verified Google authentication. Record its exact source commit in docs/MIGRATION_STATUS.md.
- Never reset transition to a release/develop snapshot or merge hosting changes back into develop. Port shared fixes separately.
- Keep the existing design, routes, nine games, localization, themes, sound behavior, and owner-only editing.
- master accepts release PRs from transition in this same repository only. Do not push production feature fixes directly to master.
- Before creating/updating master, pass check:vercel, lint, typecheck, test, build, and test:e2e. Do not skip or weaken failing checks.
- Live OAuth, database, storage, and migrated content must be verified before an actual production release. A build without credentials only verifies code readiness.
- Store secrets only in ignored local environment files or provider settings. Never commit credentials, fake production credentials, or authentication bypasses.
- Do not deploy, provision cloud resources, or change repository administration unless the user authorizes that action. This migration is preparation only.
