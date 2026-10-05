# Branching and release policy

## Branch roles

| Branch | Runtime | Purpose |
| --- | --- | --- |
| develop | Sites / Cloudflare | Active development and source sync |
| release-X.Y.Z | Sites / Cloudflare snapshot | Frozen input for that version's migration |
| transition | Native Next.js / Vercel | Persistent adaptation and validation branch |
| master | Native Next.js / Vercel | Validated production-target code |
| main | Legacy | Preserved; excluded from the new release path |

## Prepare a version

1. Sync Sites source into develop only. Preserve GitHub-owned policy and vercel.json files. Review the diff and commit it without force-pushing or replacing history.
2. Create release-X.Y.Z from the reviewed develop SHA. Treat the branch as frozen; later changes require another release snapshot.
3. For the initial migration, create transition from the release snapshot. For subsequent versions keep transition and integrate the changes since the previously incorporated release. Never replace its entire tree with source from Sites.
4. Resolve runtime-specific conflicts deliberately: native build scripts, Google auth, Postgres schema/queries and Blob storage must survive. Check interface parity after integration.
5. Record the release branch and exact source SHA in MIGRATION_STATUS.md.
6. Run `pnpm install --frozen-lockfile`, `pnpm check:vercel`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and `pnpm test:e2e`.
7. On first setup create master from the validated transition SHA. Later use a PR from transition to master. Preserve merge ancestry: use a merge commit rather than repeatedly squash/rebase-merging the persistent transition branch.

## Code readiness versus production release

master can hold validated deployment-target code before services exist. Do not call the app production verified until OAuth, database migrations, uploads, live content, and owner-only editing have passed with real configuration. See VERCEL_SETUP.md.

Once Vercel Git integration is enabled, merging into master normally deploys production. Keep integration disconnected until deployment is authorized. For a separate manual release step, set git.deploymentEnabled to false in vercel.json before connecting the repo.

After a successful actual release, create a version tag from the master commit. A source snapshot release-1.0.0 is not a GitHub Release or a production deployment.

## Repository settings to apply manually

The connected GitHub tools cannot change administrative rules. In GitHub Settings -> Rules -> Rulesets, create an active branch ruleset for master:

- Require a pull request before merging. With one maintainer, required approvals = 0.
- Require checks named `release-source` and `vercel-ready`, with branches up to date.
- Block force pushes and restrict deletion. Avoid routine bypasses.
- Allow merge commits; do not require linear history for the persistent branch flow.

The workflow's release-source check permits only transition from the same repository. Documentation alone does not enforce this rule: the required-check ruleset must be enabled.

For transition, block force pushes/deletion and require vercel-ready on PRs, while allowing approved migration commits. For release-* restrict updates/deletion after the branch is created; the owner manages exceptional corrections explicitly.

Do not require the Vercel deployment check before the services/project exist, or every PR will be blocked. Changing GitHub's default branch from main is optional and was not performed.
