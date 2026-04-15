// Gedeelde ingredient-parser die door meerdere data loaders gebruikt wordt

export const STARTS_WITH_QUANTITY = /^[\d½¼¾⅓⅔⅛⅜⅝⅞]/;

export const UNITS = new Set([
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

// Splits ruwe ingrediëntenstring in aparte ingrediënten.
// Nieuw ingrediënt = segment dat begint met een hoeveelheid.
export function splitIngredients(raw) {
  if (!raw) return [];
  const parts = raw.split(", ");
  const ingredients = [];
  let current = null;
  for (const part of parts) {
    if (STARTS_WITH_QUANTITY.test(part.trim())) {
      if (current !== null) ingredients.push(current);
      current = part.trim();
    }
  }
  if (current !== null) ingredients.push(current);
  return ingredients;
}

// Haalt de basisnaam op, zonder hoeveelheid en eenheid.
// Bv. "2 cloves garlic, minced" → "garlic"
export function extractName(ingredient) {
  let name = ingredient.trim();
  name = name.replace(/^[\d\s\/\.½¼¾⅓⅔⅛⅜⅝⅞]+/, "").trim();
  name = name.replace(/\([\d\s\/\.½¼¾⅓⅔⅛⅜⅝⅞\w]*\)\s*/g, "").trim();
  const words = name.split(/\s+/);
  let i = 0;
  while (i < words.length && UNITS.has(words[i].toLowerCase())) i++;
  name = words.slice(i).join(" ");
  name = name.toLowerCase().replace(/\s+/g, " ").trim();
  name = name.replace(/[,\.;]+$/, "").trim();
  return name;
}
