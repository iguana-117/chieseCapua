# Chiese di Capua

Sito web per esplorare le chiese di Capua, esistenti e scomparse, su una mappa interattiva.

È un sito statico (HTML, CSS e JavaScript, senza passaggi di build) che usa [Leaflet](https://leafletjs.com) e le mappe di [OpenStreetMap](https://www.openstreetmap.org).

## Struttura

| Percorso | Contenuto |
|---|---|
| `index.html` | La pagina |
| `assets/css/style.css` | Lo stile |
| `assets/js/app.js` | Mappa, filtri, elenco e schede |
| `data/chiese.geojson` | Coordinate, stato, identificativi e foto (vedi `data/README.md`) |
| `data/schede.json` | Storia, periodo, epoca e fonti di ogni chiesa |
| `vendor/leaflet-1.9.4/` | Copia di Leaflet (licenza BSD-2) |

Il sito unisce i due file di dati per `id` (E1–E32 per le esistenti, S1–S25 per le scomparse).

## Aggiornare i dati

- **Coordinate, stato o foto**: modificare `data/chiese.geojson`. Il CSV `data/chiese.csv` è la stessa tabella e non viene letto dal sito: se si lavora sul CSV, va riconvertito in GeoJSON.
- **Testi**: modificare `data/schede.json`. Ogni scheda ha `indirizzo`, `periodo`, `epoca` (una delle chiavi di `epoche`), `storia` (un paragrafo per elemento) e `fonti` (chiavi di `fonti`).
- **Nuova chiesa sulla mappa**: aggiungere il punto nel GeoJSON e la scheda con lo stesso `id`.
- **Chiesa scomparsa senza posizione**: basta la scheda in `schede.json` con `nome` e `luogo`; compare nell'elenco ma non sulla mappa.
- Una chiesa scomparsa con `precisione: "sito"` e le stesse coordinate di una chiesa esistente viene collegata automaticamente ("sorge sul sito di…").

## Provarlo in locale

Il browser non carica i file di dati se la pagina è aperta direttamente dal disco. Dalla cartella del progetto:

```
python3 -m http.server 8000
```

e poi aprire <http://localhost:8000>.

## Pubblicazione su GitHub Pages

In *Settings → Pages* del repository scegliere *Deploy from a branch*, ramo `main`, cartella `/ (root)`. Il sito sarà su `https://iguana-117.github.io/chieseCapua/`.

## Licenze e crediti

- Mappa di base e coordinate da OSM: © contributori di OpenStreetMap, [ODbL](https://opendatacommons.org/licenses/odbl/).
- Dati Wikidata: CC0.
- Foto: Wikimedia Commons, con autore e licenza indicati in ogni scheda.
- Testi delle schede: riassunti a partire dalle fonti citate in ogni scheda. Testi e immagini della mappa turistica Pro Loco non sono stati riprodotti.
