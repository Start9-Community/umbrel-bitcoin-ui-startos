import { sdk } from './sdk'
import { bridgeAddress, uiPort } from './utils'
import { i18n } from './i18n'
import { manifest } from 'bitcoin-knots-startos/startos/manifest'
import { rpcHostId, rpcPort } from 'bitcoin-knots-startos/startos/utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Umbrel UI.'))

  // Knots' RPC and both ZMQ interfaces share one container, so the host of its
  // RPC bridge address is the single IP the UI dials for RPC (8332) and the two
  // ZMQ ports (28332/28333) — replaces the removed `bitcoind.startos` DNS name.
  // Reading the RPC binding's assigned port (never addressInfo, which empties
  // on a disabled binding) keeps this .const() reactive to Knots
  // install/uninstall — one healing restart each — while never restarting on a
  // Knots update. Loopback placeholder until Knots binds; the .const() heals
  // when it appears.
  const bitcoindAddress = await bridgeAddress(effects, {
    packageId: 'bitcoind',
    hostId: rpcHostId,
    internalPort: rpcPort,
  }).const()
  const bitcoindIp = bitcoindAddress?.split(':')[0] ?? '127.0.0.1'

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
