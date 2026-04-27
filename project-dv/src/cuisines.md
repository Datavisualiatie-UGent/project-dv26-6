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
      title: d => `${d.name}
Beoordeling: ${d.avg_rating.toFixed(2)}`
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

De onderstaande figuur toont het gemiddelde aantal beoordelingen van een recept per keuken ten opzichte van de gemiddelde gemiddelde beoordeling van een recept per keuken.

```js
const cuisineStats = Object.values(
  cuisines.reduce((acc, d) => {
    if (!acc[d.country]) {
      acc[d.country] = {
        country: d.country,
        sumRating: 0,
        sumRatingsCount: 0,
        count: 0
      };
    }

    if (!isNaN(d.avg_rating) && !isNaN(d.total_ratings)) {
      acc[d.country].sumRating += d.avg_rating;
      acc[d.country].sumRatingsCount += d.total_ratings;
      acc[d.country].count += 1;
    }

    return acc;
  }, {})
).map(d => ({
  country: d.country,
  avg_rating: d.sumRating / d.count,
  avg_total_ratings: d.sumRatingsCount / d.count,
  count: d.count
}));
```

```js
display(Plot.plot({
  title: "Populariteit van de keukens",
  width,
  height: 600,

  x: { label: "Gemiddeld aantal beoordelingen", domain: [0, 200] },
  y: { label: "Gemiddelde gemiddelde beoordeling", domain: [4, 5] },

  marks: [
    Plot.dot(cuisineStats, {
      x: "avg_total_ratings",
      y: "avg_rating",
      r: 4,
      fill: "#ff0000",
      stroke: "#ff0000",
      tip: true,
      title: d =>
        `${d.country}
Gemiddelde beoordeling: ${d.avg_rating.toFixed(2)}
Aantal beoordelingen: ${Math.round(d.avg_total_ratings)}`
    }),

    Plot.text(cuisineStats, {
      x: "avg_total_ratings",
      y: "avg_rating",
      text: "country",
      dy: -8,
      fontSize: 10
    })
  ]
}));
```

## Hoe verschillen de keukens in de duur van het maken van de recepten?

Een derde manier waarop we de keukens kunnen vergelijken is hoelang het duurt om een recept te maken. Hiervoor zijn er drie variabelen beschikbaar in de dataset. Ten eerste is er de voorbereidingstijd van de recepten. Ten tweede is er de kooktijd van de recepten. Ten slotte, is er nog de totale tijd, de som van de twee voorgaande. We zullen de voorbereidingstijd en de kooktijd gebruiken om de keukens te vergelijken.

In de onderstaande figuur wordt de gemiddelde voorbereidingstijd van een recept per keuken ten opzichte van de gemiddelde kooktijd van een recept per keuken weergegeven.

```js
const cuisineStats2 = Object.values(
  cuisines.reduce((acc, d) => {
    if (!acc[d.country]) {
      acc[d.country] = {
        country: d.country,
        sumPrep: 0,
        sumCook: 0,
        count: 0
      };
    }

    if (!isNaN(d.prep_time) && !isNaN(d.cook_time)) {
      acc[d.country].sumPrep += d.prep_time;
      acc[d.country].sumCook += d.cook_time;
      acc[d.country].count += 1;
    }

    return acc;
  }, {})
).map(d => ({
  country: d.country,
  avg_prep_time: d.sumPrep / d.count,
  avg_cook_time: d.sumCook / d.count,
  count: d.count
}));
```

```js
display(Plot.plot({
  title: "Voorbereidingstijd en kooktijd van de keukens",
  width,
  height: 600,

  x: { label: "Gemiddelde voorbereidingstijd in minuten", domain: [0, 90] },
  y: { label: "Gemiddelde kooktijd in minuten", domain: [0, 90] },

  marks: [
    Plot.dot(cuisineStats2, {
      x: "avg_prep_time",
      y: "avg_cook_time",
      r: 4,
      fill: "#ff0000",
      stroke: "#ff0000",
      tip: true,
      title: d =>
        `${d.country}
Voorbereidingstijd: ${Math.round(d.avg_prep_time)} min
Kooktijd: ${Math.round(d.avg_cook_time)} min`
    }),

    Plot.text(cuisineStats2, {
      x: "avg_prep_time",
      y: "avg_cook_time",
      text: "country",
      dy: -8,
      fontSize: 10
    })
  ]
}));
```

## Hoe verschillen de keukens in de voedingswaarden van hun recepten?

De laatste manier waarop we de keukens kunnen vergelijken zijn de voedingswaarden van hun recepten. Hiertoe hebben we voor al de recepten het aantal kilocalorieën, vetten, koolhydraten en proteïnen beschikbaar. We zullen deze allemaal gebruiken, waarbij de gebruiker de keuze heeft welke keukens er getoond worden.

De onderstaande figuur toont ...

```js
const cuisineStats3 = Object.values(
  cuisines.reduce((acc, d) => {
    if (!acc[d.country]) {
      acc[d.country] = {
        country: d.country,
        sumCal: 0,
        sumFat: 0,
        sumCar: 0,
        sumPro: 0,
        count: 0
      };
    }

    if (!isNaN(d.calories) && !isNaN(d.fat) && !isNaN(d.carbs) && !isNaN(d.protein)) {
      acc[d.country].sumCal += d.calories;
      acc[d.country].sumFat += d.fat;
      acc[d.country].sumCar += d.carbs;
      acc[d.country].sumPro += d.protein;
      acc[d.country].count += 1;
    }

    return acc;
  }, {})
).map(d => ({
  country: d.country,
  avg_cal: d.sumCal / d.count,
  avg_fat: d.sumFat / d.count,
  avg_car: d.sumCar / d.count,
  avg_pro: d.sumPro / d.count,
  count: d.count
}));
```

```js

```
