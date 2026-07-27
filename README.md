<p align="center">
  <img src="icon.png" alt="Umbrel Bitcoin UI Logo" width="21%">
</p>

# Umbrel Bitcoin UI on StartOS

> **Upstream repo:** <https://github.com/Retropex/umbrel-bitcoin>

A StartOS package that runs the [Umbrel Bitcoin](https://github.com/Retropex/umbrel-bitcoin) web dashboard as a front end for a Bitcoin node (Bitcoin Knots or Bitcoin Core) installed on the same server. It ships no node of its own — it connects to the StartOS-managed `bitcoind` over the local network using that node's RPC cookie.

## Getting Started

Build and development workflow follow the StartOS packaging guide: <https://docs.start9.com/packaging>. Keep `README.md`, `instructions.md`, and `AGENTS.md` in sync with any change to user-visible behavior or package structure. See [UPDATING.md](UPDATING.md) for bumping the vendored UI source.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------- |
| Image         | `umbrel-bitcoin-ui` — built locally from [`Dockerfile`](./Dockerfile)                               |
| Source        | git submodule [`umbrel-bitcoin/`](./umbrel-bitcoin) (`startos` branch of `Retropex/umbrel-bitcoin`) |
| Architectures | x86_64, aarch64                                                                                     |
| Command       | `node /app/dist/server.js`                                                                          |

The daemon runs with these environment variables set, wiring it to the StartOS-managed node:

| Env var                  | Value                    | Purpose                                                                                  |
| ------------------------ | ------------------------ | ---------------------------------------------------------------------------------------- |
| `BITCOIND_EXTERNAL_MODE` | `true`                   | Connect to an external node, don't spawn one                                             |
| `BITCOIND_IP`            | OS bridge gateway IPv4   | Host half of the node's RPC bridge address, resolved from bitcoind's RPC host at startup |
| `RPC_PORT`               | node's assigned RPC port | Port half of that same address — the external port StartOS published the RPC binding on  |
| `RPC_COOKIE`             | `/mnt/knots/.cookie`     | RPC cookie read from the node's volume                                                   |
| `ZMQ_HASHBLOCK_PORT`     | `28332`                  | ZMQ block notifications, on the node's own port                                          |
| `ZMQ_HASHTX_PORT`        | `28333`                  | ZMQ transaction notifications, on the node's own port                                    |

RPC and ZMQ take different routes to the node. RPC goes over the LXC bridge, where the OS DNATs `<bridge gateway>:<assigned external port>` to the node's container — so the assigned port must be carried through, not assumed to equal the node's own `8332`. The UI's ZMQ subscribers ignore `BITCOIND_IP` and dial `bitcoind.startos` directly, reaching the container itself, where the node's own ZMQ ports apply.

---

## Volume and Data Layout

| Volume           | Mount Point  | Mode      | Purpose                         |
| ---------------- | ------------ | --------- | ------------------------------- |
| `main`           | `/root`      | rw        | Persistent UI data              |
| `bitcoind` (dep) | `/mnt/knots` | read-only | Access the node's RPC `.cookie` |

---

## Installation and First-Run Flow

No setup wizard. On install, StartOS enforces the `bitcoind` dependency and applies the ZMQ requirement to it (see [Dependencies](#dependencies)). Once the node is running and reachable, the UI starts serving.

---

## Configuration Management

No user-facing configuration. All runtime wiring is fixed in the daemon's environment; node-level settings live in the Bitcoin node's own config.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose                  |
| --------- | ---- | -------- | ------------------------ |
| Web UI    | 3000 | HTTP     | Umbrel Bitcoin dashboard |

**Access methods:**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

---

## Actions (StartOS UI)

None.

---

## Backups and Restore

**Included in backup:**

- `main` volume

**Restore behavior:** Volume is fully restored before the service starts.

---

## Health Checks

| Check         | Method                | Messages                                                                        |
| ------------- | --------------------- | ------------------------------------------------------------------------------- |
| Web Interface | Port listening (3000) | Success: "The web interface is ready" / Error: "The web interface is not ready" |

---

## Dependencies

| Dependency | Requirement                                                     |
| ---------- | --------------------------------------------------------------- |
| `bitcoind` | Running and healthy. Provided by Bitcoin Knots or Bitcoin Core. |

On install/update the package creates a **critical** task on the node to enable **ZMQ** (`zmqEnabled: true`) — the UI needs ZMQ (ports 28332/28333) for live block and transaction updates. It also reads the node's RPC cookie at `/mnt/knots/.cookie`.

---

## Limitations and Differences

1. **Front end only** — it surfaces an existing node; it does not run or fully reconfigure one.
2. **Local node only** — connects to the `bitcoind` on this StartOS server, not a remote node.

---

## Contributing

Build and development workflow follow the StartOS packaging guide: <https://docs.start9.com/packaging>. Keep `README.md`, `instructions.md`, and `AGENTS.md` in sync with any change to user-visible behavior or package structure.

---

## Quick Reference for AI Consumers

```yaml
package_id: umbrel-bitcoin-ui
image: umbrel-bitcoin-ui # built from ./Dockerfile
upstream: https://github.com/Retropex/umbrel-bitcoin # vendored as git submodule (startos branch)
architectures: [x86_64, aarch64]
volumes:
  main: /root
  bitcoind: /mnt/knots # dependency volume, read-only (RPC cookie)
ports:
  ui: 3000
dependencies:
  bitcoind:
    health_checks: [bitcoind]
    auto_config: { zmqEnabled: true } # critical task on the node
startos_managed_env_vars:
  - BITCOIND_EXTERNAL_MODE=true
  - BITCOIND_IP=<host half of the node's RPC bridge address, resolved at startup>
  - RPC_PORT=<port half of that address, i.e. the node's assigned external RPC port>
  - RPC_COOKIE=/mnt/knots/.cookie
  - ZMQ_HASHBLOCK_PORT=28332 # the node's own port, reached at bitcoind.startos
  - ZMQ_HASHTX_PORT=28333 # the node's own port, reached at bitcoind.startos
actions: none
```
