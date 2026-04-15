import { csvParse, csvFormat } from "d3-dsv";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Regex: een nieuw ingrediënt begint altijd met een hoeveelheid
const STARTS_WITH_QUANTITY = /^[\d½¼¾⅓⅔⅛⅜⅝⅞]/;

// Maateenheden die we weggooien bij het extraheren van de naam
const UNITS = new Set([
  "cup", "cups",
  "tablespoon", "tablespoons", "tbsp", "tbsps",
  "teaspoon", "teaspoons", "tsp", "tsps",
  "pound", "pounds", "lb", "lbs",
  "ounce", "ounces", "oz",
  "gram", "grams", "g", "kg", "kilogram", "kilograms",
  "pinch", "pinches", "dash", "dashes",
  "clove", "cloves",
  "can", "cans", "package", "packages", "pkg",
  "slice", "slices", "piece", "pieces",
  "bunch", "bunches", "head", "heads",
  "stalk", "stalks", "sprig", "sprigs",
  "quart", "quarts", "qt",
  "pint", "pints", "pt",
  "gallon", "gallons",
  "liter", "liters", "ml", "milliliter", "milliliters",
  "fluid", "fl",
  "large", "medium", "small",
  "whole", "half",
  "drop", "drops",
]);

// Splits de ruwe ingrediëntenstring op in aparte ingrediënten.
// Strategie: split op ", " en kijk of een segment begint met een hoeveelheid.
// Zo ja → nieuw ingrediënt; zo nee → kwalificatie van het vorige (bv. "softened", "or to taste").
function splitIngredients(raw) {
  if (!raw) return [];

  const parts = raw.split(", ");
  const ingredients = [];
  let current = null;

  for (const part of parts) {
    if (STARTS_WITH_QUANTITY.test(part.trim())) {
      if (current !== null) ingredients.push(current);
      current = part.trim();
    } else {
      // kwalificatie — negeren
    }
  }
  if (current !== null) ingredients.push(current);

  return ingredients;
}

// Haalt de bassnaam van een ingrediënt op, zonder hoeveelheid en eenheid.
// Bv. "2 cloves garlic, minced" → "garlic"
function extractName(ingredient) {
  let name = ingredient.trim();

  // Verwijder hoeveelheid vooraan: cijfers, breuken, unicode-breuken, spaties
  name = name.replace(/^[\d\s\/\.½¼¾⅓⅔⅛⅜⅝⅞]+/, "").trim();

  // Verwijder haakjes-hoeveelheden zoals "(15 ounce)" of "(3 1/2 pound)"
  name = name.replace(/\([\d\s\/\.½¼¾⅓⅔⅛⅜⅝⅞\w]*\)\s*/g, "").trim();

  // Verwijder leading maateenheden
  const words = name.split(/\s+/);
  let i = 0;
  while (i < words.length && UNITS.has(words[i].toLowerCase())) {
    i++;
  }
  name = words.slice(i).join(" ");

  // Naar kleine letters en overtollige spaties weg
  name = name.toLowerCase().replace(/\s+/g, " ").trim();

  // Verwijder afsluitende leestekens
  name = name.replace(/[,\.;]+$/, "").trim();

  return name;
}

// Lees de CSV
const csvText = readFileSync(join(__dirname, "all_recipes.csv"), "utf-8");
const recipes = csvParse(csvText);

// Tel hoe vaak elk ingrediënt voorkomt
const counts = new Map();

for (const recipe of recipes) {
  const ingredients = splitIngredients(recipe.ingredients);
  for (const ing of ingredients) {
    const name = extractName(ing);
    if (name && name.length > 1) {
      counts.set(name, (counts.get(name) || 0) + 1);
    }
  }
}

// Sorteer op frequentie (hoogste eerst)
const rows = Array.from(counts.entries())
  .map(([ingredient, count]) => ({ ingredient, count }))
  .sort((a, b) => b.count - a.count);

process.stdout.write(csvFormat(rows));
