// Per ingrediënt: aantal recepten, gemiddeld calorieën, gemiddelde rating, afwijking van gemiddelde rating
import { csvParse, csvFormat } from "d3-dsv";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { splitIngredients, extractName } from "./parseIngredients.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const recipes = csvParse(readFileSync(join(__dirname, "all_recipes.csv"), "utf-8"));

// Bereken het globale gemiddelde voor de deviatie
let totalRating = 0, nRating = 0;
for (const r of recipes) {
  const rating = +r.avg_rating;
  if (rating > 0) { totalRating += rating; nRating++; }
}
const overallAvgRating = totalRating / nRating;

// Verzamel statistieken per ingrediënt
const stats = new Map();

for (const recipe of recipes) {
  const calories = +recipe.calories;
  const rating   = +recipe.avg_rating;
  const fat      = +recipe.fat;
  const protein  = +recipe.protein;

  for (const ing of splitIngredients(recipe.ingredients)) {
    const name = extractName(ing);
    if (!name || name.length <= 1) continue;

    if (!stats.has(name)) {
      stats.set(name, { count: 0, sumCal: 0, nCal: 0, sumRating: 0, nRat: 0, sumFat: 0, nFat: 0, sumProt: 0, nProt: 0 });
    }
    const s = stats.get(name);
    s.count++;
    if (calories > 0) { s.sumCal += calories; s.nCal++; }
    if (rating  > 0) { s.sumRating += rating;   s.nRat++; }
    if (fat     > 0) { s.sumFat += fat;          s.nFat++; }
    if (protein > 0) { s.sumProt += protein;     s.nProt++; }
  }
}

const rows = Array.from(stats.entries())
  .filter(([_, s]) => s.count >= 20)
  .map(([ingredient, s]) => {
    const avgRating = s.nRat > 0 ? s.sumRating / s.nRat : null;
    return {
      ingredient,
      count:           s.count,
      avg_calories:    s.nCal  > 0 ? Math.round(s.sumCal  / s.nCal)          : "",
      avg_rating:      avgRating !== null ? avgRating.toFixed(2)              : "",
      rating_deviation:avgRating !== null ? (avgRating - overallAvgRating).toFixed(3) : "",
      avg_fat:         s.nFat  > 0 ? (s.sumFat  / s.nFat).toFixed(1)         : "",
      avg_protein:     s.nProt > 0 ? (s.sumProt / s.nProt).toFixed(1)        : "",
    };
  })
  .sort((a, b) => b.count - a.count);

process.stdout.write(csvFormat(rows));
