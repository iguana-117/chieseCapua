# Dati: coordinate delle chiese di Capua

Raccolti il 4 novembre 2026 a partire dal report *Chiese di Capua esistenti e scomparse* (sigle E1–E32 per le esistenti, S… per le scomparse) e aggiornati il 25 novembre 2026 con le schede CEI di [BeWeB](https://www.beweb.chiesacattolica.it) e [Chiese Italiane](https://chieseitaliane.chiesacattolica.it/chieseitaliane/index.jsp) (E33–E43).

## File

| File | Contenuto |
|---|---|
| `chiese.geojson` | 54 punti (WGS84): 42 chiese esistenti e 12 chiese scomparse con tracce visibili o sito noto |
| `chiese.csv` | Gli stessi dati in tabella, con `lat` e `lon` |
| `schede.json` | Testi delle schede; contiene anche le chiese senza posizione (tra cui San Bartolomeo ad Arco Aloisio, E43) |

Le 11 chiese che erano in `altre_chiese_da_valutare.csv` (presenti in Wikidata/OSM ma assenti dal report) sono state confermate da BeWeB e sono ora E33–E43; il file è stato rimosso.

## Campi principali

- `precisione`
  - `edificio`: poligono o nodo OSM della chiesa, oppure punto Wikidata coerente con la mappa Pro Loco (entro circa 50 m);
  - `approssimata`: posizione letta sulla mappa turistica Pro Loco e georeferenziata (errore stimato 20–60 m), oppure punto Wikidata non verificato su OSM né sulla mappa;
  - `strada`: centro della via o piazza indicata dalle fonti, quando l'edificio non è noto;
  - `sito`: chiesa scomparsa sul cui sito sorge oggi un'altra chiesa (stesse coordinate).
- `fonte_coord`: da dove viene il punto (OSM, Wikidata, mappa Pro Loco, BeWeB).
- `beweb`: identificativo della scheda nel censimento CEI dei beni architettonici; la scheda è su `https://www.beweb.chiesacattolica.it/edificidiculto/edificio/<beweb>/`. Solo per le 23 chiese con scheda pubblica.
- `osm_id`, `wikidata`, `commons_categoria`: identificativi nelle banche dati aperte.
- `mappa_proloco_n`: numero della chiesa nella mappa turistica Pro Loco (solo come riferimento di controllo).
- `immagine_*`: una foto con licenza, autore e pagina di origine. Di norma viene da Wikimedia Commons; quando Commons non ha foto viene da BeWeB, e `immagine_fonte` vale `BeWeB (CEI)`. Chi riusa la foto deve citare autore e licenza.

## Metodo

1. **OpenStreetMap**: scaricato l'API 0.6 (`/map?bbox=…`) per il centro, i borghi fuori le mura e Sant'Angelo in Formis. Overpass non rispondeva dall'ambiente di lavoro. Per i poligoni la coordinata è il baricentro dei vertici.
2. **Wikidata**: elementi con P131 = Capua (Q58477) o con coordinate nel riquadro del comune. Nota: il codice ISTAT di Capua è **061015** (061017 è Carinola).
3. **Wikimedia Commons**: `Category:Churches in Capua` e sottocategorie; licenze lette dalla pagina di ogni file.
4. **BeWeB e Chiese Italiane (CEI)**: le 25 schede pubbliche del comune di Capua nel censimento dei beni architettonici della diocesi (le stesse sui due siti), più 17 schede «in lavorazione» con solo nome, tipo e indirizzo. Da qui vengono le coordinate di Santa Placida e di Santa Maria in Abate, le date e le notizie storiche citate con la fonte `BW`, le foto BeWeB. Il confronto completo è nella cartella del progetto, `ricerca/fonti_cei/`.
5. **Mappa Pro Loco**: georeferenziata con 16 punti di controllo (chiese con coordinate OSM certe), trasformazione affine più correzione locale dei residui. È servita per controllare tutti i punti e per collocare le chiese assenti da OSM e Wikidata. Dalla mappa non è stato copiato né testo né immagine.

## Punti da verificare

- **Concezione (E21)**: la mappa Pro Loco e Wikidata distano circa 110 m.
- **Gesù Gonfalone (E16)**: le coordinate Wikidata sono sbagliate (circa 800 m).
- **San Leonardo (E10)** e **Santa Margherita (E27)**: posizioni solo dalla mappa Pro Loco. San Leonardo potrebbe coincidere con **Santa Maria in Abate (E33)**, a circa 30 m e con una storia molto simile.
- **Ave Gratia Plena, San Girolamo, La Santella, Madonna della Scafa (E38–E40, E42)**: punti Wikidata da verificare; San Girolamo ha le stesse coordinate di San Raffaele.
- **San Bartolomeo ad Arco Aloisio (E43)**: BeWeB la pone in corso Gran Priorato di Malta, ma il punto Wikidata (Q55385441) è presso San Lazzaro: per ora è senza posizione.
- **San Martino alla Giudea (E18)**: il report la dava per sconsacrata, BeWeB la elenca come chiesa sussidiaria.
- **San Benedetto (E11)**: il catalogo SIGEC e BeWeB la identificano con l'attuale chiesa dei Santi Filippo e Giacomo.
- **Carmine (S20)**: localizzato grazie alla mappa Pro Loco (ex convento del Carmine, n. 44).

## Licenze dei dati

- Coordinate e identificativi OSM: © contributori di OpenStreetMap, licenza [ODbL](https://opendatacommons.org/licenses/odbl/). Sul sito va indicata l'attribuzione "© OpenStreetMap contributors".
- Wikidata: CC0.
- Foto Commons: licenza indicata riga per riga.
- Foto BeWeB: © Diocesi di Capua, licenza [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it). Si possono usare solo senza scopo commerciale, citando la fonte.
