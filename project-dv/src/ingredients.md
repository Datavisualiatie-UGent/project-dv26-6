---
title: Ingrediënten
---

```js
import * as Plot from "@observablehq/plot";

const ingredients      = await FileAttachment("data/ingredients.csv").csv({ typed: true });
const ingredientStats  = await FileAttachment("data/ingredient_stats.csv").csv({ typed: true });
const cuisineData      = await FileAttachment("data/cuisine_ingredients.csv").csv({ typed: true });
```

# Wat zit er in ons eten?

De AllRecipes-dataset bevat **${ingredients.length.toLocaleString("nl")} unieke ingrediënten** verspreid over meer dan 14.000 recepten. Van alledaagse basisproducten zoals zout en bloem tot de meest exotische smaakmakers — op deze pagina verkennen we welke ingrediënten onze keuken domineren, wat ze vertellen over calorieën en waardering, en hoe keukens wereldwijd van elkaar verschillen.

---

## De meest gebruikte ingrediënten

Niet verrassend: **zout** staat bovenaan. Daarna volgen suiker, bloem en boter, de pijlers van westerse thuiskeuken. Gebruik de slider om meer of minder ingrediënten te tonen.

```js
const n = view(Inputs.range([10, 50], { step: 5, value: 20, label: "Aantal ingrediënten" }));
```

```js
display(Plot.plot({
  marginLeft: 180,
  width,
  height: n * 22 + 60,
  x: { label: "Aantal recepten" },
  y: { label: null },
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

## Calorieën en waardering

Zitten ingrediënten uit calorierijke recepten ook in beter gewaardeerde recepten? Elk punt is een ingrediënt — hoe **groter de cirkel**, hoe vaker het voorkomt in de dataset. Hover over een punt voor details.

```js
const scatterData = ingredientStats.filter(d =>
  d.count >= 100 &&
  d.avg_calories > 0 && !isNaN(d.avg_calories) &&
  d.avg_rating   > 0 && !isNaN(d.avg_rating)
);

display(Plot.plot({
  width,
  height: 500,
  marginRight: 20,
  r: { range: [3, 24] },
  x: { label: "Gemiddeld calorieën van recepten met dit ingrediënt (kcal)" },
  y: { label: "Gemiddelde rating" },
  marks: [
    Plot.dot(scatterData, {
      x: "avg_calories",
      y: "avg_rating",
      r: "count",
      fill: "steelblue",
      fillOpacity: 0.45,
      stroke: "steelblue",
      strokeOpacity: 0.7,
      tip: true,
      title: d => `${d.ingredient}\n${d.count} recepten\nGem. ${d.avg_calories} kcal\nRating: ${(+d.avg_rating).toFixed(2)}`
    }),
    Plot.text(scatterData.filter(d => d.count >= 800), {
      x: "avg_calories",
      y: "avg_rating",
      text: "ingredient",
      dy: -10,
      fontSize: 10,
      fill: "#333"
    })
  ]
}));
```

---

## Wat maakt een recept goed?

Onder de **30 populairste ingrediënten**, welke zijn geassocieerd met hogere of lagere gemiddelde ratings? We vergelijken de gemiddelde rating van recepten mét dat ingrediënt met het globale gemiddelde over alle recepten.

<span style="color: #2ecc71">■</span> **Groen** = boven gemiddeld gewaardeerd &nbsp;&nbsp; <span style="color: #e74c3c">■</span> **Rood** = onder gemiddeld gewaardeerd

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
    label: "Afwijking van gemiddelde rating",
    tickFormat: d => (d > 0 ? "+" : "") + d.toFixed(2)
  },
  y: { label: null },
  marks: [
    Plot.barX(top30, {
      x: "rating_deviation",
      y: "ingredient",
      fill: d => +d.rating_deviation > 0 ? "#2ecc71" : "#e74c3c",
      tip: true,
      title: d =>
        `${d.ingredient}\n` +
        `Afwijking: ${+d.rating_deviation > 0 ? "+" : ""}${(+d.rating_deviation).toFixed(3)}\n` +
        `Gem. rating: ${(+d.avg_rating).toFixed(2)}\n` +
        `${d.count} recepten`
    }),
    Plot.ruleX([0])
  ]
}));
```

---

## Verken en vergelijk zelf

Zoek een ingrediënt en vink het aan. Geselecteerde ingrediënten verschijnen als chips — klik op **×** om ze te verwijderen. Je selectie blijft bewaard terwijl je verder zoekt.

```js
// Zelfstandige component met pure DOM-API's — geen html-tag, geen sanitisatie-problemen.
function makeSelector(ingredients) {
  const selected = new Set();

  // Wrapper
  const el = document.createElement("div");

  // Zoekveld
  const input = Object.assign(document.createElement("input"), {
    type: "text",
    placeholder: "Zoek ingrediënt, bv. butter, garlic…"
  });
  input.style.cssText = "width:100%; padding:7px 10px; border:1px solid #ccc; border-radius:6px; font-size:14px; box-sizing:border-box; margin-bottom:6px";

  // Resultatenlijst
  const results = document.createElement("div");
  results.style.cssText = "max-height:220px; overflow-y:auto; border:1px solid #e0e0e0; border-radius:6px; margin-bottom:10px; display:none";

  // Chips-rij
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
      count.textContent = `${d.count} recepten`;

      label.append(cb, name, count);
      results.appendChild(label);
    }
  }

  function renderChips() {
    chips.innerHTML = "";
    if (selected.size === 0) {
      const msg = document.createElement("span");
      msg.style.cssText = "color:#aaa; font-size:13px";
      msg.textContent = "Nog niets geselecteerd.";
      chips.appendChild(msg);
      return;
    }
    const lbl = document.createElement("span");
    lbl.style.cssText = "font-size:13px; color:#555; margin-right:6px";
    lbl.textContent = "Geselecteerd:";
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
  { field: "avg_calories", label: "Calorieën (kcal)" },
  { field: "avg_rating",   label: "Gemiddelde rating" },
  { field: "avg_fat",      label: "Vet (g)" },
  { field: "avg_protein",  label: "Proteïne (g)" },
  { field: "count",        label: "Populariteit (# recepten)" },
];
const metric = view(Inputs.select(metrics, {
  label: "Vergelijk op",
  format: d => d.label
}));
```

```js
if (ingredientSelector.length === 0) {
  display(html`<p style="color:#888; font-style:italic; margin-top:1rem;">
    Selecteer een of meer ingrediënten hierboven om ze te vergelijken.
  </p>`);
} else {
  display(Plot.plot({
    title: `Vergelijking: ${metric.label}`,
    marginBottom: ingredientSelector.length > 3 ? 80 : 50,
    width,
    height: 350,
    x: { label: null, tickRotate: ingredientSelector.length > 4 ? -30 : 0 },
    y: { label: metric.label, zero: true },
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

---

## De wereld op je bord

Welke ingrediënten zijn typisch voor een bepaalde keuken? We tonen hier niet gewoon de meest gebruikte ingrediënten, maar de meest **kenmerkende** — ingrediënten die relatief veel vaker voorkomen dan je op basis van de volledige dataset zou verwachten. Zo scoort feta hoog bij Grieks, en golden syrup bij Australisch.

```js
const countries = [...new Set(cuisineData.map(d => d.country))].sort();
const selectedCountry = view(Inputs.select(countries, { label: "Keuken" }));
```

```js
const countryData  = cuisineData
  .filter(d => d.country === selectedCountry)
  .sort((a, b) => b.specificity - a.specificity);
const countryTotal = countryData[0]?.total_recipes ?? 0;

display(Plot.plot({
  title: `${selectedCountry} — ${countryTotal} recepten`,
  marginLeft: 210,
  width,
  height: countryData.length * 30 + 60,
  x: { label: "Specificiteitscore (hoe uniek t.o.v. andere keukens)" },
  y: { label: null },
  marks: [
    Plot.barX(countryData, {
      x: "specificity",
      y: "ingredient",
      sort: { y: "-x" },
      fill: "#e67e22",
      tip: true,
      title: d => `${d.ingredient}\n${d.count} van ${d.total_recipes} recepten`
    }),
    Plot.ruleX([0])
  ]
}));
```
