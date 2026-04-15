// Per land: de meest kenmerkende ingrediënten via een TF-IDF-achtige specificiteitscore.
// Specificity = (freq in dit land) / (globale freq) — hoog = uniek voor dit land.
import { csvParse, csvFormat } from "d3-dsv";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { splitIngredients, extractName } from "./parseIngredients.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const recipes = csvParse(readFileSync(join(__dirname, "cuisines.csv"), "utf-8"));

const totalRecipes = recipes.length;

// Globale ingrediëntfrequentie (per recept, niet per occurrence)
const globalCounts = new Map();
for (const recipe of recipes) {
  const seen = new Set();
  for (const ing of splitIngredients(recipe.ingredients)) {
    const name = extractName(ing);
    if (!name || name.length <= 1) continue;
    if (!seen.has(name)) {
      seen.add(name);
      globalCounts.set(name, (globalCounts.get(name) || 0) + 1);
    }
  }
}

// Per land: ingrediëntfrequentie en totaal aantal recepten
const countryCounts  = new Map();
const countryTotals  = new Map();

for (const recipe of recipes) {
  const country = recipe.country?.trim();
  if (!country) continue;
  countryTotals.set(country, (countryTotals.get(country) || 0) + 1);
  if (!countryCounts.has(country)) countryCounts.set(country, new Map());
  const cc = countryCounts.get(country);
  const seen = new Set();
  for (const ing of splitIngredients(recipe.ingredients)) {
    const name = extractName(ing);
    if (!name || name.length <= 1) continue;
    if (!seen.has(name)) {
      seen.add(name);
      cc.set(name, (cc.get(name) || 0) + 1);
    }
  }
}

// Top 8 meest kenmerkende ingrediënten per land (min. 5 recepten per land)
const rows = [];
for (const [country, counts] of countryCounts) {
  const total = countryTotals.get(country);
  if (total < 5) continue;

  const scored = Array.from(counts.entries())
    .filter(([_, c]) => c >= 2)
    .map(([ingredient, count]) => {
      const globalFreq = (globalCounts.get(ingredient) || 0) / totalRecipes;
      const localFreq  = count / total;
      const specificity = localFreq / (globalFreq + 0.01);
      return { country, ingredient, count, total_recipes: total, specificity: +specificity.toFixed(3) };
    })
    .sort((a, b) => b.specificity - a.specificity)
    .slice(0, 8);

  rows.push(...scored);
}

process.stdout.write(csvFormat(rows));
