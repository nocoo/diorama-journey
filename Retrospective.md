# Retrospective

Accident narratives for this repo.

Routing: narrative stays here. A project-specific rule that will recur may become one line in `AGENTS.md`. Cross-project lessons go to nmem or a global rule. If it can be checked by a machine, add a hook or test instead of prose.


## 2026-10-02 — Keep starter lockfile registry-portable

The starter lockfile pinned corporate feed tarball URLs, so an explicit alternate registry could not be used: npm refused those entries as remote packages. Canonicalize only the resolved registry URLs while preserving every version and integrity value. Installs select the permitted mirror temporarily; never disable the remote-source restriction or force downstream users to use a private feed.
