# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `umbrel-bitcoin-ui`.** UI-only package: it ships no bitcoind of its own but hard-depends on Bitcoin (dependency packageId `bitcoind`) for RPC + ZMQ. The UI source is vendored as a git submodule at `umbrel-bitcoin/`.
- **Everything reaches the node over the LXC bridge. `.startos` DNS is deprecated — never reintroduce it.** `main.ts` resolves three bridge addresses with `sdk.host.getBridgeAddress` — bitcoind's **RPC host**, and its **ZMQ host** once per binding (block and transaction are separate bindings on distinct ports) — and passes `BITCOIND_IP` + `RPC_PORT` + `ZMQ_HASHBLOCK_PORT` + `ZMQ_HASHTX_PORT`. Every port must be carried through: the host is the OS bridge gateway (`10.0.3.1`) shared by every container, not bitcoind's own IP, and `preferredExternalPort` only _asks_ for the node's own number, falling back to a random port at or above 49152 when it is taken — so the gateway paired with a node-internal port is an address the OS never published. 1.1.0:10 through :13 paired exactly that way for RPC, keeping only `.split(':')[0]`. `ssl: false` selects the plaintext RPC address, since Bitcoin binds RPC as `protocol: 'http'` and so publishes both a plaintext and a TLS address; the ZMQ bindings publish one plaintext leg each, where passing `ssl` would be wrong. The `.const()`s re-run `main` only when a resolved address changes, so the UI heals on Bitcoin install/uninstall — one restart each — with zero restarts on Bitcoin updates; while the node is absent the addresses are null and the corresponding vars are omitted. Host ids and internal ports are imported from `bitcoin-knots-startos/startos/utils`, not hardcoded.
- **The vendored app is the Start9-Community fork** (`Start9-Community/umbrel-bitcoin`, branch `start-os-next`), forked from `Retropex/umbrel-bitcoin` so the `.startos` removal could ship. Its RPC client and both ZMQ subscribers now take their host from `BITCOIND_IP`. Anything sent upstream to Retropex should be mirrored here, and the submodule url can move back once upstream carries the same change.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach umbrel-bitcoin-ui -n umbrel-bitcoin-ui-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `umbrel-bitcoin-ui-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
