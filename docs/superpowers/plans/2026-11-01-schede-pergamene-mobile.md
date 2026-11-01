# Schede pergamene mobile — Piano di implementazione

> **Per chi implementa:** usare `superpowers:executing-plans` per eseguire il piano. I passaggi sono tracciabili con checkbox.

**Obiettivo:** Rendere leggibile su telefono la tabella delle pergamene dell’Artista senza alterare la tabella desktop.

**Architettura:** `renderPergamene()` genera tabella e schede dallo stesso array `PERGAMENE`. CSS mostra una sola versione in base alla larghezza dello schermo.

**Stack:** HTML, CSS, JavaScript esistente, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-01-schede-pergamene-mobile-design.md`

## Vincoli globali

- Conservare valori, prezzi, ordine dei livelli e gerarchia cromatica.
- Mostrare le schede sotto 600 px; mostrare la tabella da 601 px in su.
- Non aggiungere descrizioni o dipendenze.
- Lavorare su `codex/mobile-parchment-cards`; non integrare in `main`.

## Review focus

- Ogni livello deve mostrare i due costi e tutti i cinque tempi: testare il primo e l’ultimo livello.
- Nessun contenuto duplicato nei dati: generare entrambi i layout dall’array esistente.
- La larghezza 600/601 px deve mostrare esattamente un layout alla volta.
- Le schede mobile non devono causare scorrimento orizzontale a 390 px.
- Il livello leggendario deve restare distinguibile in entrambi i layout.

---

### Task 1: Rendere adattiva la tabella delle pergamene

**File:**
- Modifica: `index.html`, funzione `renderPergamene()` e CSS responsive
- Test: `tests/e2e/site.spec.js`

- [ ] Scrivere un test Playwright desktop/mobile: 10 schede a 390 px, cinque colonne LV e costi per scheda; tabella desktop visibile da 1440 px e schede nascoste.
- [ ] Eseguire il test e confermare il fallimento prima dell’implementazione.
- [ ] Generare le schede con i dati `PERGAMENE`; applicare il layout a griglia solo sotto 600 px.
- [ ] Rieseguire il test mirato e poi `npm test`.
- [ ] Controllare visivamente il mobile a 390 px e il desktop a 1440 px.

## Revisione

- I test coprono entrambe le varianti responsive, prezzi e completezza dei tempi.
- Non ci sono cambi dati, regressioni alle ricette o nuove dipendenze previste.
