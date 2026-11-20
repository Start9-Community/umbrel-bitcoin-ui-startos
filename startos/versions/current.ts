import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.1.0:17',
  releaseNotes: {
    en_US: `Requires StartOS 0.4.2 or later.

- Umbrel Bitcoin UI's access to Bitcoin's data is limited to its RPC credentials.
- Bitcoin must be at least 28.4:42, 29.5:4, 30.4:4 or 31.2:4, depending on its major version. Bitcoin Knots (pre-RDTS) 29.3:33 or later also works. Update Bitcoin when StartOS asks.
- With an older Bitcoin, Umbrel Bitcoin UI no longer fails to start: it waits and tells you to update Bitcoin.`,
    es_ES: `Requiere StartOS 0.4.2 o posterior.

- El acceso de Umbrel Bitcoin UI a los datos de Bitcoin se limita a sus credenciales RPC.
- Bitcoin debe ser al menos la versión 28.4:42, 29.5:4, 30.4:4 o 31.2:4, según su versión principal. También funciona Bitcoin Knots (pre-RDTS) 29.3:33 o posterior. Actualiza Bitcoin cuando StartOS lo pida.
- Con un Bitcoin más antiguo, Umbrel Bitcoin UI ya no falla al iniciarse: espera y te indica que actualices Bitcoin.`,
    de_DE: `Erfordert StartOS 0.4.2 oder neuer.

- Der Zugriff von Umbrel Bitcoin UI auf die Daten von Bitcoin ist auf dessen RPC-Zugangsdaten beschränkt.
- Bitcoin muss je nach Hauptversion mindestens 28.4:42, 29.5:4, 30.4:4 oder 31.2:4 sein. Bitcoin Knots (pre-RDTS) ab 29.3:33 funktioniert ebenfalls. Aktualisiere Bitcoin, sobald StartOS dazu auffordert.
- Mit einem älteren Bitcoin startet Umbrel Bitcoin UI nicht mehr fehlerhaft: Es wartet und fordert dich auf, Bitcoin zu aktualisieren.`,
    pl_PL: `Wymaga StartOS 0.4.2 lub nowszego.

- Dostęp Umbrel Bitcoin UI do danych Bitcoina ogranicza się do jego danych uwierzytelniających RPC.
- Bitcoin musi być co najmniej w wersji 28.4:42, 29.5:4, 30.4:4 lub 31.2:4, zależnie od wersji głównej. Działa też Bitcoin Knots (pre-RDTS) 29.3:33 lub nowszy. Zaktualizuj Bitcoina, gdy StartOS o to poprosi.
- Ze starszym Bitcoinem Umbrel Bitcoin UI nie kończy już uruchamiania błędem: czeka i prosi o aktualizację Bitcoina.`,
    fr_FR: `Nécessite StartOS 0.4.2 ou une version ultérieure.

- L’accès d’Umbrel Bitcoin UI aux données de Bitcoin se limite à ses identifiants RPC.
- Bitcoin doit être au moins en version 28.4:42, 29.5:4, 30.4:4 ou 31.2:4, selon sa version majeure. Bitcoin Knots (pre-RDTS) 29.3:33 ou plus récent fonctionne aussi. Mettez Bitcoin à jour lorsque StartOS le demande.
- Avec un Bitcoin plus ancien, Umbrel Bitcoin UI n’échoue plus au démarrage : il attend et vous invite à mettre Bitcoin à jour.`,
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
