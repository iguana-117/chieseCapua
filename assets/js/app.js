/* Chiese di Capua: mappa e schede.
 * Legge data/chiese.geojson (coordinate, stato, foto) e data/schede.json
 * (storia, periodo, fonti), li unisce per id e costruisce mappa ed elenco.
 * Per aggiornare il sito basta sostituire i due file di dati. */
(function () {
  "use strict";

  var VISTE = {
    centro: { centro: [41.1075, 14.2135], zoom: 16 },
    formis: { centro: [41.1165, 14.2505], zoom: 15 }
  };
  var PRECISIONE = {
    edificio: "Posizione dell'edificio",
    approssimata: "Posizione approssimata (errore stimato 20–60 m)",
    strada: "Posizione indicativa: centro della via o della piazza citata dalle fonti",
    sito: "Sullo stesso sito sorge oggi un'altra chiesa"
  };

  var stato = {
    chiese: [],          // tutte le voci, con o senza coordinate
    perId: {},
    epoche: {},
    fonti: {},
    filtroTipi: { esistente: true, scomparsa: true },
    filtroEpoche: {},
    testo: "",
    attiva: null
  };

  var mappa, livello;
  var el = function (id) { return document.getElementById(id); };

  /* ---------- utilità ---------- */

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function normalizza(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function numeroId(id) { return parseInt(id.slice(1), 10); }

  // Riduce lo stato libero del CSV a una categoria per il colore del badge.
  function categoriaStato(c) {
    var s = normalizza(c.stato);
    if (c.tipo === "scomparsa") return { cls: "scomparsa", label: "Scomparsa" };
    if (s.indexOf("rudere") === 0) return { cls: "rudere", label: "Rudere" };
    if (s.indexOf("sconsacrata") === 0) return { cls: "sconsacrata", label: "Sconsacrata" };
    if (s.indexOf("chiusa") === 0) return { cls: "chiusa", label: "Chiusa" };
    if (s.indexOf("attiva") === 0) return { cls: "attiva", label: "Aperta al culto" };
    return { cls: "verificare", label: "Stato da verificare" };
  }

  function immagine(c, larghezza) {
    if (!c.immagine_url) return null;
    return c.immagine_url.replace(/width=\d+/, "width=" + larghezza);
  }

  /* ---------- dati ---------- */

  function carica() {
    return Promise.all([
      fetch("data/chiese.geojson").then(function (r) { return r.json(); }),
      fetch("data/schede.json").then(function (r) { return r.json(); })
    ]).then(function (ris) { unisci(ris[0], ris[1]); });
  }

  function unisci(geo, testi) {
    stato.epoche = testi.epoche || {};
    stato.fonti = testi.fonti || {};
    var schede = testi.schede || {};
    var visti = {};

    geo.features.forEach(function (f) {
      var p = f.properties;
      var c = Object.assign({}, p, schede[p.id] || {});
      c.nome = p.nome; // il nome del GeoJSON ha la precedenza
      c.lat = f.geometry.coordinates[1];
      c.lon = f.geometry.coordinates[0];
      c.localizzata = true;
      stato.chiese.push(c);
      visti[p.id] = true;
    });

    // Chiese scomparse senza coordinate: solo nell'elenco.
    Object.keys(schede).forEach(function (id) {
      if (visti[id] || id.charAt(0) === "_") return;
      var c = Object.assign({ id: id, tipo: id.charAt(0) === "S" ? "scomparsa" : "esistente", stato: "scomparsa" }, schede[id]);
      c.localizzata = false;
      stato.chiese.push(c);
    });

    stato.chiese.forEach(function (c) {
      if (!c.epoca || !stato.epoche[c.epoca]) c.epoca = "ignota";
      c._cerca = normalizza([c.nome, c.indirizzo, c.luogo, c.periodo, c.frazione].join(" "));
      stato.perId[c.id] = c;
    });

    // Strati: una chiesa scomparsa sullo stesso punto di una esistente.
    stato.chiese.forEach(function (c) {
      if (c.precisione !== "sito") return;
      stato.chiese.forEach(function (e) {
        if (e.tipo === "esistente" && e.lat === c.lat && e.lon === c.lon) {
          c.sostituitaDa = e.id;
          (e.sitoDi = e.sitoDi || []).push(c.id);
        }
      });
    });

    Object.keys(stato.epoche).forEach(function (k) { stato.filtroEpoche[k] = true; });
  }

  /* ---------- mappa ---------- */

  function creaMappa() {
    mappa = L.map("mappa", { zoomControl: true, attributionControl: true })
      .setView(VISTE.centro.centro, VISTE.centro.zoom);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">contributori di OpenStreetMap</a>'
    }).addTo(mappa);
    mappa.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    livello = L.layerGroup().addTo(mappa);

    // Più chiese sullo stesso punto: le dispongo a raggiera di qualche pixel.
    var gruppi = {};
    stato.chiese.forEach(function (c) {
      if (!c.localizzata) return;
      var k = c.lat + "," + c.lon;
      (gruppi[k] = gruppi[k] || []).push(c);
    });
    Object.keys(gruppi).forEach(function (k) {
      var g = gruppi[k].sort(function (a, b) { return a.tipo === b.tipo ? 0 : a.tipo === "esistente" ? -1 : 1; });
      g.forEach(function (c, i) {
        var dx = 0, dy = 0;
        if (i > 0) {
          var ang = (Math.PI / 4) + (i - 1) * (Math.PI / 2);
          dx = Math.round(Math.cos(ang) * 18);
          dy = Math.round(-Math.sin(ang) * 18);
        }
        c.marker = creaMarker(c, dx, dy);
      });
    });
  }

  function creaMarker(c, dx, dy) {
    var approx = c.precisione === "approssimata" || c.precisione === "strada";
    var html = '<span class="pin pin-' + c.tipo + (approx ? " approx" : "") + '"></span>';
    var icon = L.divIcon({
      className: "marker-chiesa",
      html: html,
      iconSize: [18, 18],
      iconAnchor: [9 - dx, 9 - dy]
    });
    var m = L.marker([c.lat, c.lon], {
      icon: icon,
      title: c.nome,
      alt: c.nome,
      riseOnHover: true,
      zIndexOffset: c.tipo === "esistente" ? 100 : 0
    });
    m.bindTooltip(c.nome, { className: "etichetta", direction: "top", offset: [dx, dy - 10] });
    m.on("click", function () { apri(c.id, { daMappa: true }); });
    return m;
  }

  function evidenzia(id) {
    stato.chiese.forEach(function (c) {
      if (!c.marker) return;
      var nodo = c.marker.getElement();
      if (nodo) nodo.classList.toggle("attivo", c.id === id);
      c.marker.setZIndexOffset(c.id === id ? 1000 : (c.tipo === "esistente" ? 100 : 0));
    });
  }

  /* ---------- filtri ed elenco ---------- */

  function visibile(c) {
    if (!stato.filtroTipi[c.tipo]) return false;
    if (!stato.filtroEpoche[c.epoca]) return false;
    if (stato.testo && c._cerca.indexOf(stato.testo) === -1) return false;
    return true;
  }

  function creaFiltri() {
    var box = el("filtro-epoca");
    Object.keys(stato.epoche).forEach(function (k) {
      var n = stato.chiese.filter(function (c) { return c.epoca === k; }).length;
      var lab = document.createElement("label");
      lab.className = "chip";
      lab.innerHTML = '<input type="checkbox" value="' + esc(k) + '" checked><span>' +
        esc(stato.epoche[k]) + " · " + n + "</span>";
      box.appendChild(lab);
    });
    box.addEventListener("change", function (e) {
      stato.filtroEpoche[e.target.value] = e.target.checked;
      aggiorna();
    });
    el("filtro-tipo").addEventListener("change", function (e) {
      stato.filtroTipi[e.target.value] = e.target.checked;
      aggiorna();
    });
    el("cerca").addEventListener("input", function (e) {
      stato.testo = normalizza(e.target.value.trim());
      aggiorna();
    });
  }

  function voceHtml(c) {
    var approx = c.precisione === "approssimata" || c.precisione === "strada";
    var cls = c.localizzata ? "pin-" + c.tipo + (approx ? " approx" : "") : "pin-nonloc";
    var meta = [c.indirizzo || c.luogo, c.periodo].filter(Boolean).join(" · ");
    return '<button type="button" class="voce" data-id="' + esc(c.id) + '">' +
      '<span class="pin ' + cls + '"></span>' +
      '<span class="voce-testo"><span class="voce-nome">' + esc(c.nome) + "</span>" +
      '<span class="voce-meta">' + esc(meta) + "</span></span></button>";
  }

  function aggiorna() {
    var vis = stato.chiese.filter(visibile);
    var ordina = function (a, b) { return numeroId(a.id) - numeroId(b.id); };
    var gruppi = [
      { titolo: "Chiese esistenti", voci: vis.filter(function (c) { return c.tipo === "esistente"; }) },
      { titolo: "Chiese scomparse", voci: vis.filter(function (c) { return c.tipo === "scomparsa" && c.localizzata; }) },
      {
        titolo: "Scomparse, posizione ignota",
        nota: "Note dalle fonti ma non ancora collocate sulla mappa.",
        voci: vis.filter(function (c) { return !c.localizzata; })
      }
    ];
    var html = "";
    gruppi.forEach(function (g) {
      if (!g.voci.length) return;
      html += '<section class="gruppo"><h2>' + esc(g.titolo) + " (" + g.voci.length + ")</h2>" +
        (g.nota ? '<p class="nota">' + esc(g.nota) + "</p>" : "") +
        g.voci.sort(ordina).map(voceHtml).join("") + "</section>";
    });
    el("elenco").innerHTML = html || '<p class="vuoto">Nessuna chiesa corrisponde ai filtri.</p>';

    livello.clearLayers();
    var sullaMappa = 0;
    vis.forEach(function (c) {
      if (c.marker) { livello.addLayer(c.marker); sullaMappa++; }
    });
    el("conteggio").textContent = vis.length + (vis.length === 1 ? " chiesa" : " chiese") +
      ", " + sullaMappa + " sulla mappa";
    evidenzia(stato.attiva);
  }

  /* ---------- scheda ---------- */

  function schedaHtml(c) {
    var h = "";
    var img = immagine(c, 800);
    if (img) {
      h += '<figure><img src="' + esc(img) + '" alt="' + esc(c.nome) + '" loading="lazy">' +
        '<figcaption>Foto: <a href="' + esc(c.immagine_pagina) + '" target="_blank" rel="noopener">' +
        esc(c.immagine_autore || "autore su Commons") + "</a>, " + esc(c.immagine_licenza) +
        ", via Wikimedia Commons</figcaption></figure>";
    }

    var cat = categoriaStato(c);
    h += "<h2>" + esc(c.nome) + "</h2>";
    h += '<div class="badge-riga">' +
      '<span class="badge badge-' + c.tipo + '">' + (c.tipo === "esistente" ? "Esistente" : "Scomparsa") + "</span>" +
      (c.tipo === "esistente" ? '<span class="badge badge-' + cat.cls + '">' + esc(cat.label) + "</span>" : "") +
      '<span class="badge">' + esc(stato.epoche[c.epoca]) + "</span>" +
      (c.frazione ? '<span class="badge">' + esc(c.frazione) + "</span>" : "") +
      "</div>";

    h += '<dl class="dati">';
    if (c.indirizzo || c.luogo) h += "<dt>Dove</dt><dd>" + esc(c.indirizzo || c.luogo) + "</dd>";
    if (c.periodo) h += "<dt>Periodo</dt><dd>" + esc(c.periodo) + "</dd>";
    if (c.stato) h += "<dt>Stato</dt><dd>" + esc(c.stato) + "</dd>";
    h += "</dl>";

    if (c.storia && c.storia.length) {
      h += '<div class="storia">' + c.storia.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div>";
    }

    if (c.sostituitaDa || (c.sitoDi && c.sitoDi.length)) {
      h += '<div class="strati">';
      if (c.sostituitaDa) {
        h += "<p>Sul suo sito sorge oggi " + linkChiesa(c.sostituitaDa) + ".</p>";
      }
      (c.sitoDi || []).forEach(function (id) {
        h += "<p>Sorge sul sito della scomparsa " + linkChiesa(id) + ".</p>";
      });
      h += "</div>";
    }

    if (!c.localizzata) {
      h += '<p class="avviso">Questa chiesa non è sulla mappa: le fonti non permettono ancora di collocarla.</p>';
    } else if (c.precisione && c.precisione !== "edificio") {
      h += '<p class="avviso">' + esc(PRECISIONE[c.precisione] || c.precisione) + ".</p>";
    }

    var link = [];
    if (c.osm_id) link.push(['https://www.openstreetmap.org/' + c.osm_id, "OpenStreetMap"]);
    if (c.wikidata) link.push(["https://www.wikidata.org/wiki/" + c.wikidata, "Wikidata"]);
    if (c.commons_categoria) link.push(["https://commons.wikimedia.org/wiki/Category:" + encodeURIComponent(c.commons_categoria.replace(/ /g, "_")), "Foto su Commons"]);
    if (c.localizzata) link.push(["https://www.openstreetmap.org/?mlat=" + c.lat + "&mlon=" + c.lon + "#map=19/" + c.lat + "/" + c.lon, "Apri la posizione"]);
    if (link.length) {
      h += "<h3>Collegamenti</h3><ul class=\"link\">" + link.map(function (l) {
        return '<li><a href="' + esc(l[0]) + '" target="_blank" rel="noopener">' + esc(l[1]) + "</a></li>";
      }).join("") + "</ul>";
    }

    if (c.fonti && c.fonti.length) {
      h += '<h3>Fonti</h3><ul class="fonti">' + c.fonti.map(function (k) {
        var f = stato.fonti[k];
        return f ? '<li><a href="' + esc(f.url) + '" target="_blank" rel="noopener">' + esc(f.nome) + "</a></li>" : "";
      }).join("") + "</ul>";
    }

    if (c.note) {
      h += "<details><summary>Note sui dati</summary><p>" + esc(c.note) + "</p></details>";
    }
    return h;
  }

  function linkChiesa(id) {
    var c = stato.perId[id];
    return '<button type="button" data-vai="' + esc(id) + '">' + esc(c ? c.nome : id) + "</button>";
  }

  function apri(id, opz) {
    var c = stato.perId[id];
    if (!c) return;
    opz = opz || {};
    stato.attiva = id;
    el("scheda").innerHTML = schedaHtml(c);
    el("vista-elenco").hidden = true;
    el("vista-scheda").hidden = false;
    el("pannello").scrollTop = 0;
    if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    evidenzia(id);
    if (c.localizzata && !opz.daMappa) {
      mappa.flyTo([c.lat, c.lon], Math.max(mappa.getZoom(), 17), { duration: 0.6 });
    }
    if (window.matchMedia("(max-width: 760px)").matches && opz.daMappa) {
      el("pannello").scrollIntoView({ behavior: "smooth" });
    } else if (window.matchMedia("(max-width: 760px)").matches && c.localizzata) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    el("indietro").focus({ preventScroll: true });
  }

  function chiudi() {
    stato.attiva = null;
    el("vista-scheda").hidden = true;
    el("vista-elenco").hidden = false;
    history.replaceState(null, "", location.pathname + location.search);
    evidenzia(null);
  }

  /* ---------- avvio ---------- */

  function collega() {
    el("elenco").addEventListener("click", function (e) {
      var b = e.target.closest(".voce");
      if (b) apri(b.getAttribute("data-id"));
    });
    el("scheda").addEventListener("click", function (e) {
      var b = e.target.closest("[data-vai]");
      if (b) apri(b.getAttribute("data-vai"));
    });
    el("indietro").addEventListener("click", chiudi);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && stato.attiva && !el("info").open) chiudi();
    });
    document.querySelectorAll("[data-vista]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = VISTE[b.getAttribute("data-vista")];
        mappa.flyTo(v.centro, v.zoom, { duration: 0.8 });
        if (window.matchMedia("(max-width: 760px)").matches) window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
    el("apri-info").addEventListener("click", function () { el("info").showModal(); });
    window.addEventListener("hashchange", function () {
      var id = location.hash.slice(1);
      if (stato.perId[id] && id !== stato.attiva) apri(id);
    });
  }

  carica().then(function () {
    creaMappa();
    creaFiltri();
    collega();
    aggiorna();
    var id = decodeURIComponent(location.hash.slice(1));
    if (stato.perId[id]) apri(id);
  }).catch(function (err) {
    console.error(err);
    el("elenco").innerHTML = '<p class="vuoto">Non riesco a caricare i dati. Se hai aperto il file direttamente dal disco, ' +
      "avvia un piccolo server nella cartella del sito (per esempio <code>python3 -m http.server</code>).</p>";
  });
})();
