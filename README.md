# ⚒️ Mestieri di Arcamis

**Un archivio interattivo delle professioni, delle ricette e dei sistemi di creazione del mondo di Arcamis.**

Mestieri di Arcamis è un progetto web dedicato alla consultazione delle professioni e dei relativi sistemi di crafting, pensato per rendere le informazioni accessibili e organizzate in un'unica interfaccia.

Il progetto utilizza un'interfaccia a tema fantasy, con navigazione per professione, sezioni dedicate ai livelli e tabelle per consultare ricette, materiali e costi.

## ✨ Funzionalità

- **Professioni:** navigazione tra i diversi mestieri disponibili.
- **Progressione:** consultazione delle informazioni organizzate per livello.
- **Ricette di crafting:** tabelle con ingredienti, materiali, descrizioni, tempi e costi di produzione e vendita.
- **Materiali speciali:** schede dedicate ai materiali, con informazioni e proprietà.
- **Guida:** sezione dedicata alle informazioni di supporto.
- **Interfaccia responsive:** layout progettato per adattarsi a diverse dimensioni dello schermo.
- **Test automatizzati:** configurazione di test end-to-end con Playwright.

## 🛠️ Tecnologie

| Tecnologia | Utilizzo |
|---|---|
| HTML5 | Struttura dell'applicazione |
| CSS3 | Stile, layout e adattabilità |
| JavaScript | Interattività dell'interfaccia |
| Node.js e npm | Ambiente per eseguire i test |
| Playwright | Test end-to-end |

Il sito è realizzato principalmente in HTML, CSS e JavaScript. Node.js e npm sono utilizzati per gli strumenti di sviluppo e per i test automatizzati.

## 🚀 Avvio del progetto

### Prerequisiti

Per visualizzare il sito è sufficiente un browser moderno.

Per eseguire i test servono:

- [Node.js](https://nodejs.org/)
- npm, incluso con Node.js

### Clonare il repository

```bash
git clone https://github.com/DarkLionMoon/Mestieri-arcamis-test.git
cd Mestieri-arcamis-test
```

### Visualizzare il sito

Apri il file `index.html` direttamente nel browser.

In alternativa, puoi utilizzare un server HTTP locale. Se hai Python installato:

```bash
python -m http.server 8000
```

Apri quindi [http://localhost:8000](http://localhost:8000) nel browser.

### Installare le dipendenze per i test

```bash
npm install
npx playwright install
```

### Eseguire i test

Per avviare la suite di test end-to-end:

```bash
npm run test:e2e
```

Per utilizzare l'interfaccia interattiva di Playwright:

```bash
npm run test:e2e:ui
```

## 📁 Struttura del repository

```text
Mestieri-arcamis-test/
├── .github/
│   └── workflows/          # Workflow automatizzati
├── assets/
│   └── professions/        # Risorse delle professioni
├── scripts/                # Script di supporto
├── tests/                  # Test automatizzati
├── _headers                # Configurazione degli header
├── favicon.svg             # Icona del sito
├── index.html              # Applicazione web
├── package.json            # Script e dipendenze npm
└── playwright.config.js    # Configurazione Playwright
```

## 🧪 Test e sviluppo

Il progetto include una configurazione dedicata ai test end-to-end, con script npm per l'esecuzione standard e per la modalità interattiva.

Prima di proporre modifiche, è consigliabile verificare che il sito continui a funzionare correttamente e che i test disponibili vengano superati.

## 🤝 Contribuire

Vuoi contribuire allo sviluppo di Mestieri di Arcamis?

1. Crea un fork del repository.
2. Crea un branch per le tue modifiche.
3. Implementa e verifica le modifiche.
4. Apri una Pull Request descrivendo chiaramente gli interventi effettuati.

Quando modifichi professioni, ricette o materiali, mantieni coerenti la struttura dei dati, la formattazione e le regole del sistema di crafting.

## 📜 Licenza

Consulta il repository per verificare le condizioni di utilizzo e distribuzione del codice e dei materiali.

---

*Progetto dedicato al mondo di Arcamis.*

**Repository:** [DarkLionMoon/Mestieri-arcamis-test](https://github.com/DarkLionMoon/Mestieri-arcamis-test)
