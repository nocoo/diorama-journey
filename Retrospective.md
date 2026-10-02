# Retrospective

Accident narratives for this repo.

Routing: narrative stays here. A project-specific rule that will recur may become one line in `AGENTS.md`. Cross-project lessons go to nmem or a global rule. If it can be checked by a machine, add a hook or test instead of prose.


## 2026-10-02 — Keep starter lockfile registry-portable

The starter lockfile pinned corporate feed tarball URLs, so an explicit alternate registry could not be used: npm refused those entries as remote packages. Canonicalize only the resolved registry URLs while preserving every version and integrity value. Installs select the permitted mirror temporarily; never disable the remote-source restriction or force downstream users to use a private feed.

A scoped Vite/esbuild override was recognized as invalid by npm ls but npm install/update retained the old nested package. The lockfile-diff guard prevented committing a manifest-only fix. An exact root esbuild override matches Remotion's already-installed0.28.1 and lets Vite deduplicate onto that patched version. Verify both npm ls and the lockfile/OSV result; a declaration or successful installer exit does not prove the effective dependency changed.
