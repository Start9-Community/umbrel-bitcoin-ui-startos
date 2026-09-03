import { sdk } from './sdk'
import { uiPort } from './utils'
import { i18n } from './i18n'
import { manifest } from 'bitcoin-core-startos/startos/manifest'
import {
  rpcHostId,
  rpcPort,
  zmqHostId,
  zmqPortBlock,
  zmqPortTransaction,
} from 'bitcoin-core-startos/startos/utils'

const bridgePort = (address: string | null) => address?.split(':')[1]

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Umbrel UI.'))

  // Every bridge address is the OS gateway plus the port StartOS assigned to
  // that binding, which only prefers — never guarantees — Bitcoin's own port
  // number, so each one has to be carried through. RPC, ZMQ block and ZMQ tx are
  // three separate bindings sharing the one gateway host. `ssl: false` takes the
  // plaintext leg of the RPC binding, which is `protocol: 'http'` and so
  // publishes both; the ZMQ bindings publish a single plaintext leg each.
  const bridge = (hostId: string, internalPort: number, ssl?: boolean) =>
    sdk.host.getBridgeAddress(effects, {
      packageId: 'bitcoind',
      hostId,
      internalPort,
      ssl,
    })

  const rpcAddress = await bridge(rpcHostId, rpcPort, false).const()
  const zmqBlockAddress = await bridge(zmqHostId, zmqPortBlock).const()
  const zmqTxAddress = await bridge(zmqHostId, zmqPortTransaction).const()

  const [bitcoindIp, bitcoindRpcPort] = rpcAddress?.split(':') ?? []

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
        ...(bitcoindIp
          ? [`BITCOIND_IP=${bitcoindIp}`, `RPC_PORT=${bitcoindRpcPort}`]
          : []),
        ...(zmqBlockAddress
          ? [`ZMQ_HASHBLOCK_PORT=${bridgePort(zmqBlockAddress)}`]
          : []),
        ...(zmqTxAddress
          ? [`ZMQ_HASHTX_PORT=${bridgePort(zmqTxAddress)}`]
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
