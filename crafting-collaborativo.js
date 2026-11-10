"use strict";

const form = document.querySelector("form");
const cards = [...document.querySelectorAll(".catalog article")];
const result = document.getElementById("result");

function normalize(value) {
  return value.toLocaleLowerCase("it").normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

const entries = cards.map(card => ({
  card,
  category: card.dataset.category,
  jobs: card.dataset.jobs.split("|"),
  search: normalize(card.textContent),
}));

function filter() {
  const query = normalize(form.elements.q.value.trim());
  const category = form.elements.category.value;
  const job = form.elements.job.value;
  let count = 0;

  for (const entry of entries) {
    const matches = entry.search.includes(query)
      && (!category || entry.category === category)
      && (!job || entry.jobs.includes(job));
    entry.card.hidden = !matches;
    count += Number(matches);
  }

  result.textContent = count
    ? `${count} su ${cards.length} ricette`
    : "Nessuna ricetta corrisponde ai filtri.";
}

form.addEventListener("submit", event => event.preventDefault());
form.addEventListener("input", filter);
form.addEventListener("reset", () => queueMicrotask(filter));
form.hidden = false;
filter();
