import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:14',
  releaseNotes: {
    en_US: `Connects to your Bitcoin node on the port StartOS actually published.

Umbrel Bitcoin UI resolved where to reach the node's RPC but then dialled Bitcoin's own port number instead of the one StartOS assigned to it. The two usually match, and where they don't the UI could not reach the node at all. It now uses the assigned port.`,
    es_ES: `Se conecta a tu nodo Bitcoin en el puerto que StartOS ha publicado realmente.

Umbrel Bitcoin UI localizaba el RPC del nodo, pero luego usaba el número de puerto propio de Bitcoin en lugar del que StartOS le había asignado. Normalmente coinciden, y cuando no, la interfaz no podía alcanzar el nodo. Ahora utiliza el puerto asignado.`,
    de_DE: `Verbindet sich mit deinem Bitcoin-Knoten über den Port, den StartOS tatsächlich veröffentlicht hat.

Umbrel Bitcoin UI ermittelte zwar die RPC-Adresse des Knotens, verwendete dann aber Bitcoins eigene Portnummer statt der von StartOS zugewiesenen. Beide stimmen meist überein; wo nicht, erreichte die Oberfläche den Knoten gar nicht. Jetzt wird der zugewiesene Port verwendet.`,
    pl_PL: `Łączy się z węzłem Bitcoin na porcie, który faktycznie opublikował StartOS.

Umbrel Bitcoin UI ustalał adres RPC węzła, ale następnie używał własnego numeru portu Bitcoina zamiast tego przypisanego przez StartOS. Zwykle są takie same, a gdy nie były, interfejs w ogóle nie mógł połączyć się z węzłem. Teraz używany jest port przypisany.`,
    fr_FR: `Se connecte à votre nœud Bitcoin sur le port réellement publié par StartOS.

Umbrel Bitcoin UI déterminait l'adresse RPC du nœud, puis utilisait le numéro de port propre à Bitcoin au lieu de celui attribué par StartOS. Les deux coïncident généralement ; sinon, l'interface ne pouvait pas joindre le nœud du tout. Le port attribué est désormais utilisé.`,
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
