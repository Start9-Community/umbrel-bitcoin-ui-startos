# Updating the upstream version

This package builds the UI from [`Retropex/umbrel-bitcoin`](https://github.com/Retropex/umbrel-bitcoin), a fork of Umbrel's Bitcoin app adapted to run against a StartOS-managed Bitcoin node. The source is vendored as a git submodule at [`umbrel-bitcoin/`](./umbrel-bitcoin), pinned to the fork's **`start-os-next`** branch. "Upstream" here means that fork.

> [!WARNING]
> **The tracked branch is `start-os-next`, not `startos`.** The fork carries both, and `start-os-next` is the one ahead — it is where the StartOS-targeted work actually lands (the vendored commit `f21b1c3` is its head, two commits ahead of `startos`). Querying `origin/startos` returns an *older* commit, so treating it as the tracked branch reads as a new version and silently proposes a **downgrade**. `.gitmodules` names `start-os-next`; keep any command you run consistent with it.

## Determining the upstream version

- **umbrel-bitcoin** ([Retropex/umbrel-bitcoin](https://github.com/Retropex/umbrel-bitcoin), branch `start-os-next`) — check the latest commit or tag on the tracked branch:

  ```sh
  git -C umbrel-bitcoin fetch origin start-os-next
  git -C umbrel-bitcoin log --oneline origin/start-os-next -1
  ```

  The currently vendored commit is whatever the `umbrel-bitcoin` submodule points at (`git submodule status`). The `Dockerfile` builds the backend and UI from that checkout.

## Applying the bump

1. Advance the submodule to the desired upstream commit:

   ```sh
   git -C umbrel-bitcoin fetch origin start-os-next
   git -C umbrel-bitcoin checkout origin/start-os-next   # or a specific tag/commit
   git add umbrel-bitcoin
   ```

2. Rebuild (`make`) and verify the UI starts and reaches the bitcoind dependency.
3. Bump `version` / `releaseNotes` in `startos/versions/current.ts` per [CONTRIBUTING.md](./CONTRIBUTING.md).
