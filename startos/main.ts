import { sdk } from './sdk'
import { uiPort } from './utils'
import { i18n } from './i18n'
import { manifest } from 'bitcoin-knots-startos/startos/manifest'
import { rpcHostId, rpcInterfaceId } from 'bitcoin-knots-startos/startos/utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Umbrel UI.'))

  // Knots' RPC and both ZMQ interfaces share one container, so its RPC host's
  // IPv4 bridge address is the single IP the UI needs for RPC and the two ZMQ
  // ports — replaces the removed `bitcoind.startos` DNS name.
  const bitcoindIp = await sdk.host
    .get(effects, { hostId: rpcHostId, packageId: 'bitcoind' }, (host) => {
      const iface =
        host &&
        Object.values(host.bindings)
          .flatMap((b) => Object.values(b.interfaces))
          .find((i) => i.id === rpcInterfaceId)
      return iface?.addressInfo
        .filter({ kind: 'bridge', predicate: (h) => h.metadata.kind === 'ipv4' })
        .hostnames[0]?.hostname
    })
    .const()

  if (!bitcoindIp)
    throw new Error(
      i18n('Bitcoin Knots is not yet reachable on the internal network.'),
    )

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'umbrel-bitcoin-ui' },
      sdk.Mounts.of()
        .mountVolume({
          volumeId: 'main',
          subpath: null,
          mountpoint: '/root',
          readonly: false,
        })
        .mountDependency<typeof manifest>({
          dependencyId: 'bitcoind',
          volumeId: 'main',
          subpath: null,
          mountpoint: '/mnt/knots',
          readonly: true,
        }),
      'umbrel-bitcoin-ui-sub',
    ),
    exec: {
      command: [
        'env',
        'BITCOIND_EXTERNAL_MODE=true',
        'ZMQ_HASHTX_PORT=28333',
        'ZMQ_HASHBLOCK_PORT=28332',
        `BITCOIND_IP=${bitcoindIp}`,
        'RPC_COOKIE=/mnt/knots/.cookie',
        'node',
        '/app/dist/server.js',
      ],
    },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkPortListening(effects, uiPort, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})
