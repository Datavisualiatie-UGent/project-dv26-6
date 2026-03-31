import * as Plot from "@observablehq/plot";
import { loadRecipes } from "../loadData.js";

export async function MyPlot() {
  const { all_recipes } = await loadRecipes();

  return Plot.plot({
    height: 500,
    width: 800,
    grid: true,
    marks: [
      Plot.dot(all_recipes, {
        x: "total_time",
        y: "avg_rating",
        fill: "steelblue",
        r: 3,
        opacity: 0.6,
        title: d => `${d.name}\n${d.total_time} min\nRating: ${d.avg_rating}`
      })
    ],
    x: { label: "Totale tijd (minuten)" },
    y: { label: "Gemiddelde rating" }
  });
}
