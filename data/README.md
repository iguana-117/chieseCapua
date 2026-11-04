# Dati: coordinate delle chiese di Capua

Raccolti il 4 novembre 2026 a partire dal report *Chiese di Capua esistenti e scomparse* (sigle E1–E32 per le esistenti, S… per le scomparse).

## File

| File | Contenuto |
|---|---|
| `chiese.geojson` | 44 punti (WGS84): le 32 chiese esistenti e 12 chiese scomparse con tracce visibili o sito noto |
| `chiese.csv` | Gli stessi dati in tabella, con `lat` e `lon` |
| `altre_chiese_da_valutare.csv` | 11 chiese e cappelle presenti in Wikidata/OSM ma assenti dal report |

## Campi principali

- `precisione`
  - `edificio`: poligono o nodo OSM della chiesa, oppure punto Wikidata coerente con la mappa Pro Loco (entro circa 50 m);
  - `approssimata`: posizione letta sulla mappa turistica Pro Loco e georeferenziata (errore stimato 20–60 m);
  - `strada`: centro della via o piazza indicata dalle fonti, quando l'edificio non è noto;
  - `sito`: chiesa scomparsa sul cui sito sorge oggi un'altra chiesa (stesse coordinate).
- `fonte_coord`: da dove viene il punto (OSM, Wikidata, mappa Pro Loco).
- `osm_id`, `wikidata`, `commons_categoria`: identificativi nelle banche dati aperte.
- `mappa_proloco_n`: numero della chiesa nella mappa turistica Pro Loco (solo come riferimento di controllo).
- `immagine_*`: una foto da Wikimedia Commons con licenza libera, autore e pagina del file. Chi riusa la foto deve citare autore e licenza.

## Metodo

1. **OpenStreetMap**: scaricato l'API 0.6 (`/map?bbox=…`) per il centro, i borghi fuori le mura e Sant'Angelo in Formis. Overpass non rispondeva dall'ambiente di lavoro. Per i poligoni la coordinata è il baricentro dei vertici.
2. **Wikidata**: elementi con P131 = Capua (Q58477) o con coordinate nel riquadro del comune. Nota: il codice ISTAT di Capua è **061015** (061017 è Carinola).
3. **Wikimedia Commons**: `Category:Churches in Capua` e sottocategorie; licenze lette dalla pagina di ogni file.
4. **Mappa Pro Loco**: georeferenziata con 16 punti di controllo (chiese con coordinate OSM certe), trasformazione affine più correzione locale dei residui. È servita per controllare tutti i punti e per collocare le chiese assenti da OSM e Wikidata. Dalla mappa non è stato copiato né testo né immagine.

## Punti da verificare

- **Concezione (E21)**: la mappa Pro Loco e Wikidata distano circa 110 m.
- **Gesù Gonfalone (E16)**: le coordinate Wikidata sono sbagliate (circa 800 m).
- **Santa Placida (E23)**, **San Leonardo (E10)** e **Santa Margherita (E27)**: posizioni solo dalla mappa Pro Loco.
- **San Benedetto (E11)**: il catalogo SIGEC la identifica con l'attuale chiesa dei Santi Filippo e Giacomo.
- **Carmine (S20)**: localizzato grazie alla mappa Pro Loco (ex convento del Carmine, n. 44).

## Licenze dei dati

- Coordinate e identificativi OSM: © contributori di OpenStreetMap, licenza [ODbL](https://opendatacommons.org/licenses/odbl/). Sul sito va indicata l'attribuzione "© OpenStreetMap contributors".
- Wikidata: CC0.
- Foto Commons: licenza indicata riga per riga.
