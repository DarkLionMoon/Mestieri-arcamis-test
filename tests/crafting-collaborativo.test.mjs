import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../data/crafting-collaborativo.js',import.meta.url),'utf8');
const context={window:{}};vm.runInNewContext(source,context);
const recipes=context.window.CRAFTING_COLLABORATIVO;
test('78 ricette con codici unici e 6 categorie',()=>{
 assert.equal(recipes.length,78);
 assert.equal(new Set(recipes.map(r=>r.id)).size,78);
 assert.equal(new Set(recipes.map(r=>r.categoria)).size,6);
});
test('ogni ricetta ha almeno due mestieri e livelli validi',()=>{
 for(const r of recipes){assert.ok(r.mestieri.length>=2,r.id);assert.ok(r.mestieri.every(j=>j.level>=1&&j.level<=5),r.id);}
});
test('materiali, DT e prezzi coerenti con la bozza',()=>{
 for(const r of recipes){
  assert.equal(r.componenti.reduce((sum,p)=>sum+p.materialiMO,0),r.materialiMO,r.id);
  assert.equal(r.componenti.reduce((sum,p)=>sum+p.dt,0),r.dt,r.id);
  assert.equal(r.prezzoMO,r.materialiMO*2,r.id);
  assert.ok(r.dt>0&&r.materialiMO>0,r.id);
 }
});
test('pagina del catalogo e collegamento in homepage',()=>{
 const html=fs.readFileSync(new URL('../crafting-collaborativo.html',import.meta.url),'utf8');
 const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/data\/crafting-collaborativo\.js/);
 assert.match(home,/crafting-collaborativo\.html/);
});