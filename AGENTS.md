# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **UI only.** It ships no bitcoind and hard-depends on `bitcoind` for RPC + ZMQ. `BITCOIND_EXTERNAL_MODE=true` is what stops the app trying to manage a node.
- **`ssl: false` on the RPC lookup only.** Bitcoin binds RPC as `protocol: 'http'`, which publishes both a plaintext and a TLS address; the ZMQ bindings publish a single plaintext leg each, where passing `ssl` selects nothing.
- **`.startos` DNS is deprecated — never reintroduce it.** Host ids and internal ports come from `bitcoin-knots-startos/startos/utils`, not literals.
- **Omit an env var when its address is null.** The `.const()`s heal the UI with one restart on Bitcoin install/uninstall and cause none on a Bitcoin update; a fabricated address would defeat both.
- **The ZMQ task is raised on `bitcoind`, not here**, pre-filled and `accept`-locked to `{ zmqEnabled: true }`, with `once: false` so it re-raises if ZMQ is later turned off. Live block and tx updates depend on it.
- **The fork exists so the `.startos` removal could ship.** Its RPC client and both ZMQ subscribers take the host from `BITCOIND_IP` rather than the deprecated overlay DNS name. Mirror anything sent to Retropex into our fork.
- **The licence is PolyForm Noncommercial**, not an OSI licence — keep that accurate in the manifest and the docs.
