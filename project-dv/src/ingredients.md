---
title: Ingredients
---

```js
import * as Plot from "@observablehq/plot";
import * as d3 from "npm:d3";

const ingredients     = await FileAttachment("data/ingredients.csv").csv({ typed: true });
const ingredientStats = await FileAttachment("data/ingredient_stats.csv").csv({ typed: true });
const cuisineData     = await FileAttachment("data/cuisine_ingredients.csv").csv({ typed: true });
const allRecipes      = await FileAttachment("data/all_recipes.csv").csv({ typed: true });
```

# What's in our food?

The AllRecipes dataset contains **${ingredients.length.toLocaleString("en")} unique ingredients** spread across more than 14,000 recipes. From everyday staples like salt and flour to the most exotic flavourings — this page explores which ingredients dominate our kitchens, what they reveal about recipe quality and nutrition, and how cuisines around the world differ from one another.

---

## The most common ingredients

Every cuisine has its building blocks. Salt leads by a wide margin, appearing in over a third of all recipes. Sugar, flour and butter follow — the cornerstones of Western home cooking. Use the slider to expand or narrow the list.

<style>
select {
  border: 1.5px solid #ccc;
  border-radius: 8px;
  padding: 4px 10px;
  outline: none;
  font-size: 14px;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 28px;
}
select:focus {
  border-color: #534AB7;
}
input[type=range] {
  accent-color: #534AB7;
  appearance: none;
  height: 4px;
  border-radius: 99px;
  background: #ddd;
  outline: none;
  width: 100%;
}
input[type=range]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #534AB7;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,.2);
  cursor: pointer;
}
input[type=number] {
  border: 1.5px solid #ccc;
  border-radius: 8px;
  padding: 4px 10px;
  outline: none;
  font-size: 14px;
}
input[type=number]:focus {
  border-color: #534AB7;
}
</style>

```js
const n = view(Inputs.range([10, 50], { step: 5, value: 20, label: "Number of ingredients" }));
```

```js
display(Plot.plot({
  marginLeft: 180,
  width,
  height: n * 22 + 60,
  x: { label: "Number of recipes",
       grid: true },
  y: { label: null,
       grid: true },
  marks: [
    Plot.barX(ingredients.slice(0, n), {
      x: "count",
      y: "ingredient",
      sort: { y: "-x" },
      fill: "steelblue",
      tip: true
    }),
    Plot.ruleX([0])
  ]
}));
```

---

## Which ingredients make a recipe great?

Not all ingredients are equal when it comes to user ratings. The chart below takes the **30 most popular ingredients** and shows how the average rating of recipes containing that ingredient compares to the overall dataset average. Ingredients associated with above-average recipes are shown in green; those linked to below-average recipes in red.

Note that this is a correlation, not causation — a recipe rated highly because of its technique might simply happen to contain garlic.

<span style="color: #2ecc71">■</span> **Green** = above average rating &nbsp;&nbsp; <span style="color: #e74c3c">■</span> **Red** = below average rating

```js
const top30 = ingredientStats
  .slice(0, 30)
  .filter(d => !isNaN(+d.rating_deviation))
  .sort((a, b) => +b.rating_deviation - +a.rating_deviation);

display(Plot.plot({
  marginLeft: 180,
  width,
  height: top30.length * 22 + 60,
  x: {
    label: "Deviation from average rating",
    tickFormat: d => (d > 0 ? "+" : "") + d.toFixed(2),
       grid: true
  },
  y: { label: null, domain: top30.map(d => d.ingredient),
       grid: true },
  marks: [
    Plot.barX(top30, {
      x: "rating_deviation",
      y: "ingredient",
      fill: d => +d.rating_deviation > 0 ? "#2ecc71" : "#e74c3c",
      tip: true,
      title: d =>
        `${d.ingredient}\n` +
        `Deviation: ${+d.rating_deviation > 0 ? "+" : ""}${(+d.rating_deviation).toFixed(3)}\n` +
        `Avg. rating: ${(+d.avg_rating).toFixed(2)}\n` +
        `${d.count} recipes`
    }),
    Plot.ruleX([0])
  ]
}));
```

---

## Do indulgent recipes taste better?

A recurring question in food culture: do richer, more caloric recipes actually get better reviews? The chart below compares the calorie distribution of **highly-rated recipes** (≥ 4.5 ★) against **lower-rated recipes** (< 4.5 ★). Each curve is normalised so that both groups are directly comparable regardless of size. The dashed vertical lines mark the mean calorie count for each group.

Only recipes with at least **${minRatings} ratings** are included to ensure reliable scores — adjust the threshold with the slider.

```js
const minRatings = view(Inputs.range([5, 50], { step: 5, value: 10, label: "Minimum number of ratings" }));
```

```js
const histData = allRecipes.filter(d =>
  d.calories > 0 && !isNaN(d.calories) &&
  d.avg_rating > 0 && !isNaN(d.avg_rating) &&
  d.total_ratings >= minRatings &&
  d.calories <= 1500
);

const binGen = d3.bin().domain([0, 1500]).thresholds(40);
const groups = [
  { label: "Highly rated (≥ 4.5 ★)", filter: d => d.avg_rating >= 4.5},
  { label: "Lower rated (< 4.5 ★)",  filter: d => d.avg_rating < 4.5}
];

const lineData = groups.flatMap(({ label, filter }) => {
  const values = histData.filter(filter).map(d => d.calories);
  return binGen(values).map(b => ({
    x: (b.x0 + b.x1) / 2,
    y: b.length / values.length,
    group: label
  }));
});

const meanData = groups.map(({ label, filter }) => {
  const values = histData.filter(filter).map(d => d.calories);
  return { x: d3.mean(values), group: label };
});

display(Plot.plot({
  width,
  height: 400,
  marginRight: 20,
  x: { label: "Calories (kcal)",
       grid: true },
  y: { label: "Relative frequency",
       grid: true },
  color: { legend: true },
  marks: [
    Plot.lineY(lineData, {
      x: "x",
      y: "y",
      stroke: "group",
      strokeWidth: 2.5
    }),
    Plot.ruleX(meanData, {
      x: "x",
      stroke: "group",
      strokeWidth: 1.5,
      strokeDasharray: "6,4"
    }),
    Plot.ruleY([0])
  ]
}));
```

---

## The world on your plate

Different cuisines have signature ingredients that define their identity. Rather than simply listing the most frequently used ingredients per country, we compute a **specificity score** — how much more often an ingredient appears in a given cuisine compared to its global frequency in the full dataset. A high score means the ingredient is a true hallmark of that cuisine.

Select a cuisine from the dropdown to explore its most distinctive ingredients.

```js
const countries = [...new Set(cuisineData.map(d => d.country))].sort();
const selectedCountry = view(Inputs.select(countries, { label: "Cuisine" }));
```

```js
const countryData = cuisineData
  .filter(d => d.country === selectedCountry)
  .sort((a, b) => b.specificity - a.specificity);
const countryTotal = countryData[0]?.total_recipes ?? 0;

display(Plot.plot({
  title: `${selectedCountry} cuisine — ${countryTotal} recipes`,
  marginLeft: 210,
  width,
  height: countryData.length * 30 + 60,
  x: { label: "Specificity score (how unique compared to other cuisines)",
       grid: true },
  y: { label: null,
       grid: true },
  marks: [
    Plot.barX(countryData, {
      x: "specificity",
      y: "ingredient",
      sort: { y: "-x" },
      fill: "#e67e22",
      tip: true,
      title: d => `${d.ingredient}\n${d.count} of ${d.total_recipes} recipes`
    }),
    Plot.ruleX([0])
  ]
}));
```

---

## Explore and compare

Want to look up a specific ingredient or compare several side by side? Use the search tool below to find ingredients by name, check them to add them to your selection, and choose a metric to compare. Your selection is preserved as you continue searching.

```js
function makeSelector(ingredients) {
  const selected = new Set();

  const el = document.createElement("div");

  const input = Object.assign(document.createElement("input"), {
    type: "text",
    placeholder: "Search for an ingredient, e.g. butter, garlic…"
  });
  input.style.cssText = "width:100%; padding:7px 10px; border:1px solid #ccc; border-radius:6px; font-size:14px; box-sizing:border-box; margin-bottom:6px";

  const results = document.createElement("div");
  results.style.cssText = "max-height:220px; overflow-y:auto; border:1px solid #e0e0e0; border-radius:6px; margin-bottom:10px; display:none";

  const chips = document.createElement("div");
  chips.style.cssText = "min-height:28px; margin-bottom:4px";

  el.append(input, results, chips);

  function emit() {
    el.value = ingredients.filter(d => selected.has(d.ingredient));
    el.dispatchEvent(new CustomEvent("input", { bubbles: true }));
  }

  function renderResults() {
    const q = input.value.trim().toLowerCase();
    results.innerHTML = "";
    if (!q) { results.style.display = "none"; return; }

    const matches = ingredients.filter(d => d.ingredient.includes(q)).slice(0, 40);
    results.style.display = matches.length ? "block" : "none";

    for (const d of matches) {
      const label = document.createElement("label");
      label.style.cssText = "display:flex; align-items:center; gap:8px; padding:5px 10px; cursor:pointer; border-bottom:1px solid #f0f0f0; user-select:none";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = selected.has(d.ingredient);
      cb.addEventListener("change", () => {
        cb.checked ? selected.add(d.ingredient) : selected.delete(d.ingredient);
        renderChips();
        emit();
      });

      const name = document.createElement("span");
      name.style.flex = "1";
      name.textContent = d.ingredient;

      const count = document.createElement("small");
      count.style.color = "#999";
      count.textContent = `${d.count} recipes`;

      label.append(cb, name, count);
      results.appendChild(label);
    }
  }

  function renderChips() {
    chips.innerHTML = "";
    if (selected.size === 0) {
      const msg = document.createElement("span");
      msg.style.cssText = "color:#aaa; font-size:13px";
      msg.textContent = "Nothing selected yet.";
      chips.appendChild(msg);
      return;
    }
    const lbl = document.createElement("span");
    lbl.style.cssText = "font-size:13px; color:#555; margin-right:6px";
    lbl.textContent = "Selected:";
    chips.appendChild(lbl);

    for (const name of selected) {
      const chip = document.createElement("span");
      chip.style.cssText = "display:inline-block; background:#dbeafe; color:#1d4ed8; padding:2px 10px; border-radius:12px; margin:2px; font-size:13px; cursor:pointer";
      chip.textContent = `${name} ×`;
      chip.addEventListener("click", () => {
        selected.delete(name);
        renderResults();
        renderChips();
        emit();
      });
      chips.appendChild(chip);
    }
  }

  input.addEventListener("input", renderResults);
  el.value = [];
  renderChips();
  return el;
}

const ingredientSelector = view(makeSelector(ingredientStats));
```

```js
const metrics = [
  { field: "avg_calories", label: "Calories (kcal)" },
  { field: "avg_rating",   label: "Average rating"  },
  { field: "avg_fat",      label: "Fat (g)"          },
  { field: "avg_protein",  label: "Protein (g)"      },
  { field: "count",        label: "Popularity (# recipes)" },
];
const metric = view(Inputs.select(metrics, {
  label: "Compare by",
  format: d => d.label
}));
```

```js
if (ingredientSelector.length === 0) {
  display(html`<p style="color:#888; font-style:italic; margin-top:1rem;">
    Select one or more ingredients above to compare them.
  </p>`);
} else {
  display(Plot.plot({
    title: `Comparison: ${metric.label}`,
    marginBottom: ingredientSelector.length > 3 ? 80 : 50,
    width,
    height: 350,
    x: { label: null, tickRotate: ingredientSelector.length > 4 ? -30 : 0,
       grid: true },
    y: { label: metric.label, zero: true,
       grid: true },
    color: { legend: ingredientSelector.length > 1 },
    marks: [
      Plot.barY(ingredientSelector, {
        x: "ingredient",
        y: metric.field,
        fill: "ingredient",
        tip: true,
        title: d => `${d.ingredient}\n${metric.label}: ${(+d[metric.field]).toFixed(2)}`
      }),
      Plot.ruleY([0])
    ]
  }));
}
```
