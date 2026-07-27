import { sdk } from './sdk'
import { uiPort } from './utils'
import { i18n } from './i18n'
import { manifest } from 'bitcoin-knots-startos/startos/manifest'
import {
  rpcHostId,
  rpcPort,
  zmqPortBlock,
  zmqPortTransaction,
} from 'bitcoin-knots-startos/startos/utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Umbrel UI.'))

  // The bridge address is the OS gateway plus the port StartOS assigned to the
  // binding, which only prefers — never guarantees — Bitcoin's own 8332, so both
  // halves have to be carried through. `ssl: false` takes the plaintext leg of
  // the RPC binding, which is `protocol: 'http'` and so publishes both.
  const bitcoindAddress = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId: rpcHostId,
      internalPort: rpcPort,
      ssl: false,
    })
    .const()
  const [bitcoindIp, bitcoindRpcPort] = bitcoindAddress?.split(':') ?? []

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
        // The ZMQ subscribers dial `bitcoind.startos` rather than BITCOIND_IP,
        // so they reach the container directly and take Bitcoin's own ports.
        `ZMQ_HASHTX_PORT=${zmqPortTransaction}`,
        `ZMQ_HASHBLOCK_PORT=${zmqPortBlock}`,
        ...(bitcoindIp
          ? [`BITCOIND_IP=${bitcoindIp}`, `RPC_PORT=${bitcoindRpcPort}`]
          : []),
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
