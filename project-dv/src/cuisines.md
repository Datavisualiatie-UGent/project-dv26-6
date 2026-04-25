---
title: Keukens
---

```js
import * as Plot from "@observablehq/plot";


const cuisines = await FileAttachment("data/cuisines.csv").csv({ typed: true });
```

# Wat zijn de verschillen tussen de keukens over de hele wereld?

Er zijn veel verschillende keukens over de hele wereld. In onze dataset hebben we er ${new Set(cuisines.map(d => d.country)).size} ter beschikking. Op deze pagina zullen we deze keukens vergelijken en zo een idee krijgen op welke manier ze verschillen van elkaar. Voordat we dit doen, geven we eerst een kort overzicht van welke recepten er bij welke keuken horen.

In de figuur wordt een aantal recepten met de hoogste gemiddelde beoordeling van de gekozen keuken weergegeven.

```js
const countries = [...new Set(cuisines.map(d => d.country))].sort();
const selectedCountry = view(Inputs.select(countries, { label: "Kies een keuken" }));
```

```js
const n = view(Inputs.range([1, 100], {step: 1, value: 10, label: "Kies een maximum aantal recepten"}));
```

```js
const topRecipes = cuisines
  .filter(d => d.country === selectedCountry)
  .filter(d => !isNaN(d.avg_rating))
  .sort((a, b) => b.avg_rating - a.avg_rating)
  .slice(0, n);
```

```js
display(Plot.plot({
  title: `Beste recepten in de ${selectedCountry} keuken`,
  marginLeft: 250,
  width,
  height: topRecipes.length * 25 + 60,
  x: { label: "Gemiddelde beoordeling" },
  y: { label: null },
  marks: [
    Plot.barX(topRecipes, {
      x: "avg_rating",
      y: "name",
      sort: { y: "-x" },
      fill: "#ff0000",
      tip: true,
      title: d => `${d.name}\n Beoordeling: ${d.avg_rating.toFixed(2)}`
    }),
    Plot.ruleX([0])
  ]
}));
```

## Hoeveel recepten hebben de verschillende keukens?

Een eerste manier waarop keukens kunnen verschillen van elkaar is het aantal recepten dat ze aanbieden. Een keuken die veel recepten aanbiedt heeft meer variatie, terwijl een keuken die weinig recepten aanbiedt misschien enkele bekende klassiekers heeft.

In de figuur wordt weergegeven hoeveel recepten er per keuken zijn, gerangschikt van meeste naar minste.

```js
const recipesPerCuisine = Object.values(
  cuisines.reduce((acc, d) => {
    acc[d.country] = acc[d.country] || { country: d.country, count: 0 };
    acc[d.country].count += 1;
    return acc;
  }, {})
).sort((a, b) => b.count - a.count);
```

```js
display(Plot.plot({
  title: "Aantal recepten per keuken",
  marginLeft: 180,
  width,
  height: recipesPerCuisine.length * 25 + 40,
  x: { label: "Aantal recepten" },
  y: {
    label: null,
    domain: recipesPerCuisine.map(d => d.country)
  },
  marks: [
    Plot.barX(recipesPerCuisine, {
      x: "count",
      y: "country",
      fill: "#ff0000",
      tip: true,
      title: d => `${d.country}: ${d.count} recepten`
    }),
    Plot.ruleX([0])
  ]
}));
```

## Hoe verschillen de keukens in populariteit?

Een anders aspect waarin de keukens kunnnen verschillen is de populariteit. Populariteit kan met onze dataset op twee manieren gemeten worden. Ten eerste kunnen we de gemiddelde beoordeling van de recepten van een keuken bekijken. Ten tweede kunnen we kijken naar het aantal beoordelingen dat de recepten van een keuken hebben. We zullen deze twee manieren om populariteit te meten weergeven in eenzelfde figuur.


