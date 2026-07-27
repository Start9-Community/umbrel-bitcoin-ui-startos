# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (architecture, for developers and LLMs) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **Package id is `umbrel-bitcoin-ui`.** UI-only package: it ships no bitcoind of its own but hard-depends on Bitcoin (dependency packageId `bitcoind`) for RPC + ZMQ. The UI source is vendored as a git submodule at `umbrel-bitcoin/`.
- **RPC reaches the node over the LXC bridge; ZMQ reaches it over `.startos` DNS.** `main.ts` resolves bitcoind's IPv4 bridge address with `sdk.host.getBridgeAddress` against its **RPC host** and splits it into `BITCOIND_IP` and `RPC_PORT`. Both halves matter: the host is the OS bridge gateway (`10.0.3.1`) shared by every container, not bitcoind's own IP, and the port is the external port StartOS assigned — `preferredExternalPort` only asks for the node's `8332` and falls back to a random port at or above 49152 when it is taken, so the gateway paired with the node's internal port is an address the OS never published. 1.1.0:10 through :13 paired exactly that way, keeping only `.split(':')[0]`. `ssl: false` selects the plaintext address — Bitcoin binds RPC as `protocol: 'http'`, which publishes both a plaintext and a TLS address, and the SDK's `ssl` filter applies only to that case. The `.const()` re-runs `main` only when the resolved address changes, so the UI heals on Bitcoin install/uninstall — one restart each — with zero restarts on Bitcoin updates; while the node is absent the address is null and both vars are omitted. ZMQ is not on the bridge at all: the vendored subscribers hardcode `tcp://bitcoind.startos:<port>`, which resolves to the node's own container IP, so `ZMQ_HASHBLOCK_PORT`/`ZMQ_HASHTX_PORT` are the node's **internal** ports. The `rpcHostId`/`rpcPort`/`zmqPortBlock`/`zmqPortTransaction` constants are imported from `bitcoin-knots-startos/startos/utils`, not hardcoded.

## Inspecting a running install

To run a command inside the service's container (read its generated config, grep app logs), use `start-cli package attach umbrel-bitcoin-ui -n umbrel-bitcoin-ui-sub -- <cmd>`. Select the subcontainer by **name** with `-n` (the name passed to `SubContainer.of` in `main.ts` — here `umbrel-bitcoin-ui-sub`) or by image with `-i`. Note: `-s/--subcontainer` matches the internal **Guid**, not the name, so passing a name to `-s` fails with "no matching subcontainers".
