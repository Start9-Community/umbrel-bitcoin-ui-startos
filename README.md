<p align="center">
  <img src="icon.png" alt="Umbrel Bitcoin UI Logo" width="21%">
</p>

# Umbrel Bitcoin UI on StartOS

> Everything not listed in this document should behave the same as upstream
> Umbrel Bitcoin UI. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Umbrel Bitcoin UI is a dashboard for a Bitcoin node — blocks, peers, mempool, and live activity — originally written for Umbrel. This package runs **only the interface**: the node it displays is the Bitcoin service you already run on StartOS.

- **Upstream repo:** <https://github.com/Retropex/umbrel-bitcoin>
- **Wrapper repo:** <https://github.com/Start9-Community/umbrel-bitcoin-ui-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built here from a vendored fork.

| Property      | Value                                                       |
| ------------- | ----------------------------------------------------------- |
| Image         | Built from this repo's `Dockerfile`                         |
| Architectures | x86_64, aarch64                                             |
| Command       | The application's server, with node settings as environment |

| Subcontainer            | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `umbrel-bitcoin-ui-sub` | The only daemon — the one to `attach` to |

**The vendored source is a Start9-Community fork**, not the upstream repository directly. The fork exists so the application's RPC client and both of its subscribers take the node's address from the environment rather than from a hostname built into the code; anything sent back upstream should be mirrored here, and the submodule can point back at upstream once it carries the same change.

**The application is run in external-node mode**, which is what stops it trying to manage a bitcoind of its own.

## Volume and Data Layout

One volume, plus a read-only view of the node's.

| Volume                | Mount Point  | Purpose                           |
| --------------------- | ------------ | --------------------------------- |
| `main`                | `/root`      | Whatever the application persists |
| Bitcoin's `main` (ro) | `/mnt/knots` | The node's RPC cookie             |

**The only thing read from the node's volume is its RPC cookie**, straight off the mount rather than copied — so a cookie regenerated on the node's next start is picked up without anything going stale.

There is very little in the package's own volume: the chain, the mempool and the peers all belong to the node.

## File Models

**None.** The package manages no configuration file. Everything the application needs is passed as environment at start, and everything the user configures is in the node itself.

Four of those values are **resolved at start rather than fixed**: the node's address and RPC port, and the two ZeroMQ ports.

**Every one of those ports has to be carried through, and that is the subtle part.** All three bindings resolve to the same host — the OS bridge gateway, shared by every container, not the node's own address — and the port StartOS assigned to that binding. A binding only _asks_ for the node's conventional port number; when it is taken, the allocator gives it something else entirely. So pairing the gateway with a port taken from Bitcoin's own configuration produces an address the OS never published, and earlier revisions of this package did exactly that.

**While the node is absent the values are simply omitted** rather than defaulted, and the reads are reactive: installing or removing Bitcoin heals the interface with one restart, while a Bitcoin _update_ causes none.

## Dependencies

One, and it is required.

| Dependency | Required | Health checks required | Mounted                           | Why                    |
| ---------- | -------- | ---------------------- | --------------------------------- | ---------------------- |
| Bitcoin    | Yes      | `bitcoind`             | `main`, read-only at `/mnt/knots` | Everything it displays |

**This package also configures the node on your behalf.** The live block and transaction updates depend on ZeroMQ, which Bitcoin does not enable by default — so the package raises a `critical` task **on the Bitcoin package**, pre-filled to turn ZeroMQ on and locked to that single change.

That task is **recurring, not one-shot**: it re-raises whenever Bitcoin's configuration stops matching, so turning ZeroMQ off later brings the prompt back rather than silently leaving this dashboard without live updates.

Only the RPC cookie is used for authentication — no separate RPC user is created.

## Network Access and Interfaces

One interface.

| Interface | Id   | Type | Port | Description   |
| --------- | ---- | ---- | ---- | ------------- |
| Web UI    | `ui` | ui   | 3000 | The dashboard |

Bound on the `ui-multi` MultiHost over HTTP and not masked.

**There is no login of any kind** — not the application's, and none added by StartOS. Anyone who can reach the address sees your node's state. The dashboard is read-only with respect to the chain, but it does hold RPC access to your node.

## Installation and First-Run Flow

Install declares the dependency and raises the ZeroMQ task on Bitcoin. There is nothing to configure here and no credential to record.

**Bitcoin must be installed and running**, and its ZeroMQ enabled, before the dashboard shows live data. Completing the task on Bitcoin restarts _that_ service, not this one.

Once both are up, the dashboard connects over the internal bridge and populates. Installing this before Bitcoin is fine — the addresses resolve and this service restarts on its own when they appear.

## Actions

**None.** The package ships an empty action set: it displays a node it does not configure, and the one configuration change it needs is requested from Bitcoin rather than made here.

## Tasks

One, and it is raised on **another** package.

| Task           | Raised on  | Severity   | Raised when                             | Cleared when             |
| -------------- | ---------- | ---------- | --------------------------------------- | ------------------------ |
| Auto-Configure | `bitcoind` | `critical` | Bitcoin's ZeroMQ setting does not match | Bitcoin's config matches |

It is pre-filled and **locked to enabling ZeroMQ** — it cannot be used to change anything else about Bitcoin — and it recurs rather than firing once.

## Health Checks

One check, on the only daemon.

| Check     | Displayed as    | Method                 |
| --------- | --------------- | ---------------------- |
| `primary` | "Web Interface" | Port 3000 is listening |

It reports that the dashboard is serving. **It says nothing about the node**: an unresolved address, ZeroMQ disabled, or a node that is still syncing all show a green check and an empty or stale dashboard.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`.

**There is nothing important in it.** Everything shown is read from the node, so a restore brings back a dashboard, not data. The node's own backup is what matters.

A restored instance re-resolves Bitcoin's addresses on the new server and reconnects.

## Limitations and Differences

1. **It is a dashboard, not a node.** It ships no bitcoind and manages none.
2. **No authentication at all**, and it holds RPC access to your node.
3. **ZeroMQ must be enabled on Bitcoin** for live updates; the package asks for that with a recurring task on Bitcoin.
4. **No configuration surface** — no actions, no file models.
5. **The licence is non-commercial.** PolyForm Noncommercial permits personal and non-commercial use only.
6. **The source is a fork**, carrying a change not yet in upstream.
7. **The backup restores nothing of value**, since all state belongs to the node.

---

## Quick Reference for AI Consumers

```yaml
package_id: umbrel-bitcoin-ui
image: built from ./Dockerfile # vendored Start9-Community fork of Retropex/umbrel-bitcoin
architectures:
  - x86_64
  - aarch64
subcontainers:
  - umbrel-bitcoin-ui-sub
volumes:
  main: /root # little state; bitcoind's main is read-only at /mnt/knots for the cookie
file_models: [] # everything is environment, composed at start
startos_managed_env_vars:
  - BITCOIND_EXTERNAL_MODE
  - BITCOIND_IP # bridge gateway, not bitcoind's own address
  - RPC_PORT # the port StartOS ASSIGNED, not bitcoind's configured one
  - ZMQ_HASHBLOCK_PORT
  - ZMQ_HASHTX_PORT
  - RPC_COOKIE
dependencies:
  - bitcoind # required, kind: running, healthChecks: [bitcoind], cookie via a read-only mount
interfaces:
  ui: { type: ui, port: 3000 } # no authentication of any kind
actions: []
tasks:
  - action: autoconfig # raised on bitcoind, not on this package
    severity: critical
    when: { condition: input-not-matches, once: false } # recurring
    locked_to: { zmqEnabled: true }
health_checks:
  - primary # displayed "Web Interface"; says nothing about the node
```
