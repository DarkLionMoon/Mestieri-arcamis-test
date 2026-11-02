# Ricerca nel catalogo — 2 novembre 2026

Obiettivo: rendere coerenti suggerimenti e risultati e permettere di ampliare la ricerca senza abbandonare la professione.

La direzione mantiene il sito esistente come riferimento: grafite e oro, pannelli sottili, controlli compatti, nessuna nuova immagine o dipendenza. La guida Refero `craft-details.md` informa focus visibile e bersagli di almeno 44 px; il servizio Refero ha restituito NO_SUBSCRIPTION.

Decisioni:

- Esporre il numero di ricette e l'ambito sopra i risultati: chiarisce cosa viene cercato.
- Offrire due pulsanti con stato premuto per professione corrente e catalogo completo: controllo esplicito, utilizzabile da tastiera e su telefono.
- Filtrare i suggerimenti nello stesso ambito dei risultati: elimina promesse di risultati non disponibili.
- Ricordare la sezione prima della ricerca e ripristinarla quando si cancella: preserva il contesto di consultazione.
- Offrire un messaggio utile e un pulsante di azzeramento in assenza di risultati.

Verifica: test browser desktop/mobile per ambito, conteggio, suggerimenti, nessun risultato e ritorno al livello; suite di regressione completa; schermate a 390 e 1440 px. Dati e regole del catalogo invariati.

## Correzioni successive all'analisi con Graphify

- Ogni coppia mestiere/livello conserva filtri indipendenti; invio, azzeramento e rimozione dei singoli filtri agiscono sul pannello corretto.
- Elenco delle ricette e conteggio complessivo condividono gli stessi criteri di filtro.
- I messaggi dei pannelli hanno identificatori distinti nei risultati di ricerca e il focus torna al pannello utilizzato.
- Ricerca, suggerimenti ed evidenziazione ignorano gli accenti, preservando testo originale e protezione del markup.
- Nuovi test riproducono i difetti prima della correzione. Prezzi e file del catalogo non sono modificati.

Graphify è stato consultato per i test associati a `index.html`; l'indice `dede807` non copre adeguatamente le funzioni inline, quindi la verifica delle modifiche si basa anche sul codice locale e sui test reali nel browser.
