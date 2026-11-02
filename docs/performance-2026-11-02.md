# Prestazioni — 2 novembre 2026

Confronto con commit `ebc22c2`, stesso server locale, Chromium, viewport 390×844, processore rallentato 4 volte, tre nuove sessioni per versione. Nessun rallentamento di rete artificiale. Le misure sono di laboratorio: non sono dati dei visitatori né un punteggio Lighthouse.

| Misura | Prima | Dopo |
| --- | ---: | ---: |
| Suggerimenti in Alchimista, mediana query da 2 a 6 caratteri | 27,5 ms | 0,4 ms |
| Ricerca completa in Alchimista, stesse query | 40,2 ms | 15,3 ms |
| LCP, mediana delle tre sessioni | 860 ms | 792 ms |
| Spostamenti iniziali (CLS), mediana | 0,143 | 0,090 |

La riduzione ripetibile più netta è nei suggerimenti: non vengono più cercate ripetutamente le appartenenze di ciascun suggerimento dentro tutto il catalogo. Un indice per professione e uno globale vengono costruiti al primo uso, normalizzati e ordinati una volta. Gli aggiornamenti successivi eseguono un passaggio sull'indice senza ripetere normalizzazione e ordinamento. Ricerca, ordine dei suggerimenti e gestione degli accenti rimangono coperti dai test esistenti.

Gli spostamenti iniziali osservati provenivano dalla barra di navigazione vuota prima del download del catalogo e dalla sostituzione tardiva dei caratteri. La pagina include ora Home e Guida e il layout iniziale corretto già nel markup. Il contributo dei caratteri resta presente: la prova con `display=optional` eliminava gli spostamenti, ma poteva conservare per l'intera visita il carattere di riserva. Dopo verifica visiva è stato mantenuto `display=swap`, per conservare la tipografia originale. Riferimento: [Best practices for fonts](https://web.dev/articles/font-best-practices). La differenza LCP è modesta e soggetta a variabilità: non va interpretata come un guadagno garantito per ogni visitatore.

Per ripetere le misure usare `node scripts/performance-audit.cjs URL`. Per il confronto della versione precedente sul medesimo server, impostare `PERF_BASELINE_REF=ebc22c2`. Il file HTML del commit viene intercettato nel browser senza modificare il checkout. Dati grezzi: `perf-before.json` e `perf-after.json`.

Graphify è stato consultato per i test collegati a `index.html`. Il suo indice fermo a `dede807` non copre adeguatamente le funzioni inline: la valutazione delle prestazioni viene quindi confermata nel browser e sul codice corrente.

Prezzi e dati del catalogo invariati. Nessun intervento su collegamenti tra ricette, navigazione con URL o finestre informative.
