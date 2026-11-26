# Dati: coordinate delle chiese di Capua

Raccolti il 4 novembre 2026 a partire dal report *Chiese di Capua esistenti e scomparse* (sigle E1–E32 per le esistenti, S… per le scomparse) e aggiornati il 25 novembre 2026 con le schede CEI di [BeWeB](https://www.beweb.chiesacattolica.it) e [Chiese Italiane](https://chieseitaliane.chiesacattolica.it/chieseitaliane/index.jsp) (E33–E43). Il 26 novembre 2026 sono state confrontate e integrate le schede «[Capua sacra](https://www.capuailluogodellalingua.it/capua-sacra/)» del festival Capua il Luogo della Lingua.

## File

| File | Contenuto |
|---|---|
| `chiese.geojson` | 54 punti (WGS84): 43 chiese esistenti (compresa San Lorenzo ad Crucem, S4, sconsacrata ma conservata) e 11 chiese scomparse con tracce visibili o sito noto |
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
- `beweb`: identificativo della scheda nel censimento CEI dei beni architettonici; la scheda è su `https://www.beweb.chiesacattolica.it/edificidiculto/edificio/<beweb>/`. Solo per le 23 chiese con scheda pubblica. Lo stesso identificativo apre la scheda completa del censimento su Chiese Italiane: `https://chieseitaliane.chiesacattolica.it/chieseitaliane/schedacc.jsp?sinteticabool=true&sintetica=false&sercd=<beweb>`.
- `osm_id`, `wikidata`, `commons_categoria`: identificativi nelle banche dati aperte.
- `mappa_proloco_n`: numero della chiesa nella mappa turistica Pro Loco (solo come riferimento di controllo).
- `immagine_*`: una foto con licenza, autore e pagina di origine. Di norma viene da Wikimedia Commons; quando Commons non ha foto viene da BeWeB, e `immagine_fonte` vale `BeWeB (CEI)`; l'autrice e l'anno vengono dalla scheda completa del censimento. Chi riusa la foto deve citare autore e licenza.

## Metodo

1. **OpenStreetMap**: scaricato l'API 0.6 (`/map?bbox=…`) per il centro, i borghi fuori le mura e Sant'Angelo in Formis. Overpass non rispondeva dall'ambiente di lavoro. Per i poligoni la coordinata è il baricentro dei vertici.
2. **Wikidata**: elementi con P131 = Capua (Q58477) o con coordinate nel riquadro del comune. Nota: il codice ISTAT di Capua è **061015** (061017 è Carinola).
3. **Wikimedia Commons**: `Category:Churches in Capua` e sottocategorie; licenze lette dalla pagina di ogni file.
4. **BeWeB e Chiese Italiane (CEI)**: le 25 schede pubbliche del comune di Capua nel censimento dei beni architettonici della diocesi (le stesse sui due siti), più 17 schede «in lavorazione» con solo nome, tipo e indirizzo. Da qui vengono le coordinate di Santa Placida e di Santa Maria in Abate, le date e le notizie storiche citate con la fonte `BW`, le foto BeWeB. BeWeB e Chiese Italiane non si copiano: sono due vetrine dello stesso censimento, ma Chiese Italiane mostra la scheda intera, da cui vengono gli autori delle foto e la bibliografia (`bibliografia` in `schede.json`). Il confronto completo è nella cartella del progetto, `ricerca/fonti_cei/`.
5. **Capua sacra** ([capuailluogodellalingua.it/capua-sacra](https://www.capuailluogodellalingua.it/capua-sacra/)): 22 schede di chiese del centro, scritte per il festival Capua il Luogo della Lingua, più due articoli dello stesso sito su Sant'Eligio (`CSE`) e sull'itinerario del Touring Club in riviera (`CST`). Le notizie nuove sono citate con la fonte `CS`; le date diverse da quelle delle altre fonti sono riportate entrambe, senza scegliere. Il sito non dà coordinate. Il confronto completo è nella cartella del progetto, `ricerca/fonti_capua_sacra/`.
6. **Mappa Pro Loco**: georeferenziata con 16 punti di controllo (chiese con coordinate OSM certe), trasformazione affine più correzione locale dei residui. È servita per controllare tutti i punti e per collocare le chiese assenti da OSM e Wikidata. Dalla mappa non è stato copiato né testo né immagine.

## Punti da verificare

- **Concezione (E21)**: la mappa Pro Loco e Wikidata distano circa 110 m.
- **Gesù Gonfalone (E16)**: le coordinate Wikidata sono sbagliate (circa 800 m).
- **San Leonardo (E10)** e **Santa Margherita (E27)**: posizioni solo dalla mappa Pro Loco. San Leonardo potrebbe coincidere con **Santa Maria in Abate (E33)**, a circa 30 m e con una storia molto simile. Capua sacra descrive Santa Maria in Abate senza nominare San Leonardo, e San Leonardo non compare tra le sue schede: il dubbio resta aperto.
- **Ave Gratia Plena, San Girolamo, La Santella, Madonna della Scafa (E38–E40, E42)**: punti Wikidata da verificare; San Girolamo ha le stesse coordinate di San Raffaele. Capua sacra identifica San Girolamo con l'antica chiesa dei Santi Nazario e Celso, ma senza indirizzo.
- **La Santella (E40) e Santa Maria delle Grazie (E24)**: BeWeB le elenca come due chiese, ma Capua sacra e l'itinerario del Touring Club chiamano «Santa Maria delle Grazie, vulgo la Santella» la chiesa accanto al fiume, di fronte a Montevergine, cioè E24. E40 è quindi probabilmente un doppione: per ora resta sulla mappa, segnalata come da verificare.
- **San Bartolomeo ad Arco Aloisio (E43)**: BeWeB la pone in corso Gran Priorato di Malta, ma il punto Wikidata (Q55385441) è presso San Lazzaro: per ora è senza posizione. Capua sacra non ne parla.
- **San Martino alla Giudea (E18)**: il report la dava per sconsacrata, BeWeB la elenca come chiesa sussidiaria. Capua sacra la data al VI secolo, le altre fonti alla fine del XIV.
- **San Lorenzo ad Crucem (S4)**: le fonti del report la davano per distrutta nel 1594; secondo Capua sacra fu solo sconsacrata e l'aula si conserva nel Museo Campano. Ora è tra le esistenti (`tipo` = `esistente`), ma tiene la sigla S4 per non cambiare i collegamenti.
- **San Benedetto (E11)**: il catalogo SIGEC e BeWeB la identificano con l'attuale chiesa dei Santi Filippo e Giacomo. Capua sacra ne attribuisce la fondazione all'abate Giovanni di Cassino, non a Desiderio, e data la riapertura al 1905 (non al 1904).
- **Carmine (S20)**: localizzato grazie alla mappa Pro Loco (ex convento del Carmine, n. 44).

## Licenze dei dati

- Coordinate e identificativi OSM: © contributori di OpenStreetMap, licenza [ODbL](https://opendatacommons.org/licenses/odbl/). Sul sito va indicata l'attribuzione "© OpenStreetMap contributors".
- Wikidata: CC0.
- Foto Commons: licenza indicata riga per riga.
- Foto BeWeB: Rosaria Barone per la diocesi di Capua (censimento CEI, 2016–2018), licenza [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.it). Si possono usare solo senza scopo commerciale, citando la fonte.
