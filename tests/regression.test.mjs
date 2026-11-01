import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { runInNewContext } from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const catalogSource = readFileSync(new URL('../data/mestieri.js', import.meta.url), 'utf8');
const lines = html.split('\n');

function extractFunction(name) {
  const start = lines.findIndex(line => new RegExp('^function\\s+' + name + '\\b').test(line));
  assert.notEqual(start, -1, `Function ${name} must exist in index.html`);

  let end = start + 1;
  while (end < lines.length && !/^function\s+[A-Za-z_$][\w$]*\s*\(/.test(lines[end])) end++;
  return lines.slice(start, end).join('\n');
}

function loadFunction(name, dependencies = {}) {
  const names = Object.keys(dependencies);
  const values = Object.values(dependencies);
  return new Function(...names, `return (${extractFunction(name)});`)(...values);
}

const escapeHTMLSource = extractFunction('escapeHTML');
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
})[char]);
const safeExternalUrl = loadFunction('safeExternalUrl');
const matches = loadFunction('matches');
const infoResa = loadFunction('infoResa', { escapeHTML });
const catalogLiteral = catalogSource.match(/const MESTIERI = ([\s\S]*?)\r?\n\];/)?.[1];
assert.ok(catalogLiteral, 'Catalog data must be available in its dedicated data file');
const catalog = runInNewContext(`${catalogLiteral}\n]`);

test('la pagina carica il catalogo esterno prima dello script applicativo', () => {
  const dataScript = html.indexOf('<script src="/data/mestieri.js"></script>');
  const appScript = html.indexOf('<script>', dataScript);
  assert.notEqual(dataScript, -1);
  assert.ok(appScript > dataScript);
  assert.ok(!html.includes('const MESTIERI ='));
  assert.ok(catalog.length > 0);
});

test('escapeHTML neutralizza markup e caratteri speciali', () => {
  assert.ok(escapeHTMLSource.includes("return String(value).replace"));
  assert.match(escapeHTMLSource, /&#39;/);
  assert.equal(escapeHTML('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;');
  assert.equal(escapeHTML('A & B "test"'), 'A &amp; B &quot;test&quot;');
  assert.equal(escapeHTML("l'oste"), 'l&#39;oste');
});

test('safeExternalUrl consente solo HTTPS sul dominio 5e.tools esatto', () => {
  assert.equal(safeExternalUrl('https://5e.tools/items.html#foo'), 'https://5e.tools/items.html#foo');
  for (const url of [
    'javascript:alert(1)',
    'http://5e.tools/path',
    'https://evil.example/',
    'https://5e.tools.evil.example/',
    'https://user@5e.tools/path',
    'https://5e.tools:443/path'
  ]) assert.equal(safeExternalUrl(url), null, url);
});

test('matches cerca in nome e descrizione e restituisce false senza corrispondenze', () => {
  const item = { n: 'Spada Lunare', desc: 'Forgiata in acciaio antico' };
  assert.equal(matches(item, 'lunare'), true);
  assert.equal(matches(item, 'ACCIAIO'), true);
  assert.equal(matches(item, 'inesistente'), false);
  assert.equal(matches(item, ''), true);
});

test('infoResa calcola boccali, prezzo proporzionale e residui', () => {
  const birra = infoResa({
    n: 'Birra normale',
    resa: { litri: 60, formato: 'Barile da 60 L' },
    costo: 120,
    vend: 360
  });
  assert.match(birra, /120 unità/);
  assert.match(birra, /60 L/);
  assert.match(birra, /3,00 MO/);
  assert.match(birra, /3 SP per un boccale da 0,5 L/);

  const residuo = infoResa({
    n: 'Birra normale',
    resa: { litri: 1.2, formato: 'Birra 1,2 L' },
    costo: 6,
    vend: 12
  });
  assert.match(residuo, /2 unità/);
  assert.match(residuo, /0,2 L residui/);
});

test('infoResa rifiuta rese e costi non validi', () => {
  assert.equal(infoResa({ n: 'Birra', resa: { litri: 0 }, costo: 1, vend: 2 }), '');
  assert.equal(infoResa({ n: 'Birra', resa: { litri: 1 }, costo: 'no', vend: 2 }), '');
});

test('HTML collega una favicon SVG locale valida', () => {
  assert.ok(html.includes('<link rel="icon" type="image/svg+xml" href="/favicon.svg">'));
  const favicon = readFileSync(new URL('../favicon.svg', import.meta.url), 'utf8');
  assert.ok(favicon.includes('<svg'));
  assert.ok(favicon.includes('viewBox="0 0 32 32"'));
});

test('HTML mantiene etichetta accessibile, tipi dei pulsanti e movimento ridotto', () => {
  assert.match(html, /<label class="sr-only" for="searchInput">/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
  const buttonsWithoutType = html.match(/<button\b(?![^>]*\btype=)[^>]*>/gi) || [];
  assert.deepEqual(buttonsWithoutType, []);
});

test('i totali materiali coincidono con il costo, salvo le due voci escluse', () => {
  const esclusi = new Set(['architetto:Laboratorio Alchemico Integrato', 'sarto:Serpent Scale Armor']);
  const valoreInMO = new Map([['MO', 1], ['MA', 0.1], ['MR', 0.01]]);
  for (const mestiere of catalog) {
    for (const livello of mestiere.livelli) {
      for (const oggetto of livello.items) {
        if (esclusi.has(`${mestiere.id}:${oggetto.n}`)) continue;
        const totale = [oggetto.mp, oggetto.ms]
          .filter(Boolean)
          .flatMap(materiale => [...materiale.matchAll(/([0-9]+(?:[.,][0-9]+)?)\s*(MO|MA|MR)\b/gi)])
          .reduce((somma, match) => somma + Number(match[1].replace(',', '.')) * valoreInMO.get(match[2].toUpperCase()), 0);
        assert.ok(Math.abs(totale - oggetto.costo) < 0.001, `${mestiere.nome} LV${livello.lv} — ${oggetto.n}: materiali ${totale} MO, costo ${oggetto.costo} MO`);
      }
    }
  }
});

test('il costo finale delle sette voci corrette è il doppio dei materiali', () => {
  const daVerificare = new Set([
    'architetto:Torre Difensiva',
    'artigiano:Ioun Stone of Greater Absorption',
    'metallurgo:Chakram',
    'metallurgo:Mithral Armor',
    'oste:Pezzetti di Kaskadeur',
    'artista:Spellwrought Tattoo (4° Livello)',
    'artista:Spellwrought Tattoo (6°-9° Livello)'
  ]);
  for (const mestiere of catalog) {
    for (const livello of mestiere.livelli) {
      for (const oggetto of livello.items) {
        if (!daVerificare.has(`${mestiere.id}:${oggetto.n}`)) continue;
        assert.equal(oggetto.vend, oggetto.costo * 2, `${mestiere.nome} LV${livello.lv} — ${oggetto.n}`);
      }
    }
  }
});
