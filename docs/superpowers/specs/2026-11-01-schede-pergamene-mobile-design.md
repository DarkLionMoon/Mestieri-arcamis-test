# Schede pergamene per mobile

## Intento

Rendere leggibile da telefono la tabella delle pergamene magiche dell’Artista, che oggi comprime otto colonne e manda a capo i costi.

## Approcci

- Mantenere la tabella e renderla scorrevole orizzontalmente: conserva l’aspetto, ma costringe a spostarsi tra le colonne per confrontare i cinque livelli.
- Usare schede sotto il breakpoint mobile e mantenere la tabella su desktop: mostra livello e costi sopra una griglia `LV1`–`LV5`. È l’approccio scelto dall’utente perché rende i valori confrontabili senza colonne strette.

## Decisioni e vincoli

- Le schede compaiono solo a larghezza telefono; la tabella desktop resta invariata.
- Schede e tabella derivano dallo stesso array `PERGAMENE` dentro `renderPergamene()`.
- Ogni scheda mostra livello incantesimo, costo carta, costo inchiostro e i cinque numeri di Downtime con etichette `LV1`–`LV5`.
- Nessuna descrizione aggiuntiva, dipendenza o modifica ai valori.
- Lavorare su `codex/mobile-parchment-cards`; `main` richiede approvazione separata.

## Verifica

- Test mobile: 10 schede, tutti i costi e cinque valori presenti, nessun overflow orizzontale.
- Test desktop: tabella presente, schede nascoste.
- Suite completa e verifica visiva a 390 px.
