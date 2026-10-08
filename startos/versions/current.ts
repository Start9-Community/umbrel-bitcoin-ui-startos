import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const current = VersionInfo.of({
  version: '1.1.0:15',
  releaseNotes: {
    en_US: `- Bitcoin must be at least 28.4:29, 29.4:16, 30.3:16 or 31.1:16, depending on its major version. Bitcoin Knots (pre-RDTS) 29.3:29 or later also works.
- The network interface left behind by the StartOS 0.3.5 version of this package is removed and its port freed. A domain or .onion address you had added to it no longer reaches Umbrel Bitcoin UI; add one to the Web UI interface instead.`,
    es_ES: `- Bitcoin debe ser al menos la versión 28.4:29, 29.4:16, 30.3:16 o 31.1:16, según su versión principal. También funciona Bitcoin Knots (pre-RDTS) 29.3:29 o posterior.
- Se elimina la interfaz de red que dejó la versión de este paquete para StartOS 0.3.5 y se libera su puerto. Un dominio o una dirección .onion que hubieras añadido a ella ya no lleva a Umbrel Bitcoin UI; añade uno a la interfaz web en su lugar.`,
    de_DE: `- Bitcoin muss je nach Hauptversion mindestens 28.4:29, 29.4:16, 30.3:16 oder 31.1:16 sein. Bitcoin Knots (pre-RDTS) ab 29.3:29 funktioniert ebenfalls.
- Die Netzwerkschnittstelle, die die StartOS-0.3.5-Version dieses Pakets hinterlassen hatte, wird entfernt und ihr Port freigegeben. Eine Domain oder .onion-Adresse, die du ihr hinzugefügt hattest, führt nicht mehr zu Umbrel Bitcoin UI; füge stattdessen eine der Weboberfläche hinzu.`,
    pl_PL: `- Bitcoin musi być co najmniej w wersji 28.4:29, 29.4:16, 30.3:16 lub 31.1:16, zależnie od wersji głównej. Działa też Bitcoin Knots (pre-RDTS) 29.3:29 lub nowszy.
- Interfejs sieciowy pozostawiony przez wersję tego pakietu dla StartOS 0.3.5 zostaje usunięty, a jego port zwolniony. Domena lub adres .onion dodany do niego nie prowadzi już do Umbrel Bitcoin UI; zamiast tego dodaj go do interfejsu webowego.`,
    fr_FR: `- Bitcoin doit être au moins en version 28.4:29, 29.4:16, 30.3:16 ou 31.1:16, selon sa version majeure. Bitcoin Knots (pre-RDTS) 29.3:29 ou plus récent fonctionne aussi.
- L'interface réseau laissée par la version de ce paquet pour StartOS 0.3.5 est supprimée et son port libéré. Un domaine ou une adresse .onion que vous y aviez ajouté ne mène plus à Umbrel Bitcoin UI ; ajoutez-en un à l'interface web à la place.`,
  },
  migrations: {
    up: async ({ effects }) => {
      await sdk.MultiHost.of(effects, 'main').retire()
      // replay keys abandoned when bitcoind renamed its config action; no-op where absent
      await sdk.action.clearTask(
        effects,
        'bitcoind:config',
        'bitcoind:other-config',
      )
    },
    down: IMPOSSIBLE,
  },
})
