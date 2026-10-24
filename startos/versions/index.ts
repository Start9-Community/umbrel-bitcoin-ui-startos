import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_1_1_0_15 } from './v1.1.0_15'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_1_1_0_15],
})
