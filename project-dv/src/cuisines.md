---
title: Cuisines
---

```js
import * as Plot from "@observablehq/plot";

const cuisines = await FileAttachment("data/cuisines.csv").csv({ typed: true });
```

# What are the differences between cuisines around the world?

There are many different cuisines around the world. In our dataset we have ${new Set(cuisines.map(d => d.country)).size} available. On this page we will compare these cuisines and get an idea of the ways in which they differ from each other. Before we do this, we first give a brief overview of which recipes belong to which cuisine.

## Explore the distribution of recipe features per cuisine

Select a cuisine and a feature to explore how the values are distributed across recipes.

```js
const countries = [...new Set(cuisines.map(d => d.country))].sort();

const selectedCountry = view(
  Inputs.select(countries, {
    label: "Choose a cuisine"
  })
);
```

```js
const featureMap = {
  calories: "Calories",
  fat: "Fat",
  protein: "Protein",
  carbs: "Carbohydrates",
  cook_time: "Cooking Time",
  prep_time: "Preparation Time",
  avg_rating: "Average Rating",
  total_ratings: "Total Ratings"
};

const selectedFeature = view(
  Inputs.select(Object.keys(featureMap), {
    label: "Choose a feature",
    format: d => featureMap[d]
  })
);
```

```js
const sortedRecipes = [...filteredCuisineData]
  .sort((a, b) => b[selectedFeature] - a[selectedFeature]);

const selectedRecipe = view(
  Inputs.select(sortedRecipes, {
    label: "Choose a recipe",
    format: d => d.name
  })
);
```

```js
const filteredCuisineData = cuisines.filter(
  d =>
    d.country === selectedCountry &&
    d[selectedFeature] != null &&
    !isNaN(d[selectedFeature])
);
```

```js
const statsKeys = [
  "calories",
  "fat",
  "protein",
  "carbs",
  "cook_time",
  "prep_time",
  "avg_rating",
  "total_ratings"
];

display(
  html`
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; align-items: start;">

      <div>
        ${Plot.plot({
          title: `${featureMap[selectedFeature]} distribution in ${selectedCountry} cuisine (${filteredCuisineData.length} recipes)`,
          width: 700,
          height: 450,

          x: { label: featureMap[selectedFeature] },
          y: { label: "Number of recipes" },

          marks: [
            Plot.rectY(
              filteredCuisineData,
              Plot.binX(
                { y: "count" },
                {
                  x: selectedFeature,
                  thresholds: 20,
                  fill: "#ff0000",
                  tip: true
                }
              )
            ),
            Plot.ruleY([0])
          ]
        })}
      </div>

      <div>
        <h3 style="margin-bottom: 10px;">
          ${selectedRecipe?.name}
        </h3>

        <div style="
          display: grid;
          grid-template-columns: 1fr;
          font-family: sans-serif;
          font-size: 14px;
        ">
          ${statsKeys.map(
            (key, i) => html`
              <div style="
                display: grid;
                grid-template-columns: 1fr auto;
                gap: 10px;
                padding: 10px 10px;
                border-bottom: 1px solid #e5e5e5;
                background: ${i % 2 === 0 ? "#fafafa" : "white"};
                align-items: center;
              ">

                <div style="font-weight: 600; color: #333;">
                  ${featureMap[key] ?? key}
                </div>

                <div style="text-align: right; color: #111;">
                  ${selectedRecipe?.[key]}
                </div>

              </div>
            `
          )}
        </div>
      </div>

    </div>
  `
);
```

## How do cuisines differ in popularity?

A first aspect in which cuisines can differ is popularity. Popularity can be measured in two ways with our dataset. First, we can look at the average rating of the recipes of a cuisine. Second, we can look at the number of ratings that the recipes of a cuisine have received. We will display these two ways of measuring popularity in the same figure.

**Outlier Analysis:** As you will notice in the plot below, most cuisines cluster together, but there are a few notable outliers. Specifically, **Greek** and **Southern Recipes** stand out strongly in terms of popularity metrics. We have labeled them in the main plot and added a secondary plot displaying the individual recipes from these two cuisines to investigate what drives these outlier values.

The figure below shows the average number of ratings of a recipe per cuisine relative to the average average rating of a recipe per cuisine.

```js
const getContinent = (country) => {
  const map = {
    // North America
    "Amish and Mennonite": "North America",
    "Cajun and Creole": "North America",
    "Canadian": "North America",
    "Cuban": "North America",
    "Jamaican": "North America",
    "Puerto Rican": "North America",
    "Soul Food": "North America",
    "Southern Recipes": "North America",
    "Tex-Mex": "North America",

    // South America
    "Argentinian": "South America",
    "Brazilian": "South America",
    "Chilean": "South America",
    "Colombian": "South America",
    "Peruvian": "South America",

    // Europe
    "Austrian": "Europe",
    "Belgian": "Europe",
    "Danish": "Europe",
    "Dutch": "Europe",
    "Finnish": "Europe",
    "French": "Europe",
    "German": "Europe",
    "Greek": "Europe",
    "Italian": "Europe",
    "Norwegian": "Europe",
    "Polish": "Europe",
    "Portuguese": "Europe",
    "Russian": "Europe",
    "Scandinavian": "Europe",
    "Spanish": "Europe",
    "Swedish": "Europe",
    "Swiss": "Europe",

    // Asia
    "Bangladeshi": "Asia",
    "Chinese": "Asia",
    "Filipino": "Asia",
    "Indian": "Asia",
    "Indonesian": "Asia",
    "Israeli": "Asia",
    "Japanese": "Asia",
    "Jewish": "Asia",
    "Korean": "Asia",
    "Lebanese": "Asia",
    "Malaysian": "Asia",
    "Pakistani": "Asia",
    "Persian": "Asia",
    "Thai": "Asia",
    "Turkish": "Asia",
    "Vietnamese": "Asia",

    // Africa
    "South African": "Africa",

    // Oceania
    "Australian and New Zealander": "Oceania"
  };
  return map[country];
};

const cuisineStats = Object.values(
  cuisines.reduce((acc, d) => {
    if (!acc[d.country]) {
      acc[d.country] = {
        country: d.country,
        continent: d.continent || getContinent(d.country),
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
  continent: d.continent,
  avg_rating: d.sumRating / d.count,
  avg_total_ratings: d.sumRatingsCount / d.count,
  count: d.count
}));
```

```js
display(Plot.plot({
  title: "Popularity of cuisines (Averages)",
  width,
  height: 450,
  color: {
    legend: true,
    domain: ["Europe", "North America", "Asia", "South America", "Africa", "Oceania"],
    range: ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff", "#000000"] 
  },

  x: { label: "Average number of ratings", domain: [0, 200] },
  y: { label: "Average average rating", domain: [4, 5] },

  marks: [
    Plot.dot(cuisineStats, {
      x: "avg_total_ratings",
      y: "avg_rating",
      r: 6,
      fill: "continent",
      stroke: "white", 
      strokeWidth: 0.5,
      tip: true,
      title: d =>
        `${d.country} (${d.continent})\nAverage rating: ${d.avg_rating.toFixed(2)}\nNumber of ratings: ${Math.round(d.avg_total_ratings)}`
    }),
    Plot.text(cuisineStats.filter(d => d.country === "Greek" || d.country === "Southern Recipes"), {
      x: "avg_total_ratings",
      y: "avg_rating",
      text: "country",
      dy: -15,
      fontWeight: "bold",
      fill: "black",
      stroke: "white",
      strokeWidth: 3
    })
  ]
}));
```

Below you can explore the individual recipes for the **Greek** and **Southern Recipes** cuisines. This shows the variance and lets us see if a few viral recipes are skewing the average, or if the cuisine as a whole is structurally more popular.

```js
const popularityOutliers = cuisines.filter(d => 
  (d.country === "Greek") && 
  !isNaN(d.avg_rating) && !isNaN(d.total_ratings)
);

display(Plot.plot({
  title: "Individual Recipes: Greek",
  width,
  height: 450,
  color: { legend: true },
  
  x: { label: "Total number of ratings" },
  y: { label: "Average rating", domain: [2, 5.2] },

  marks: [
    Plot.dot(popularityOutliers, {
      x: "total_ratings",
      y: "avg_rating",
      r: 4,
      fill: "country",
      opacity: 0.7,
      tip: true,
      title: d => `${d.name}\n${d.country}\nRating: ${d.avg_rating}\nReviews: ${d.total_ratings}`
    })
  ]
}));
```

```js
const popularityOutliers = cuisines.filter(d => 
  (d.country === "Southern Recipes") && 
  !isNaN(d.avg_rating) && !isNaN(d.total_ratings)
);

display(Plot.plot({
  title: "Individual Recipes: Southern Recipes",
  width,
  height: 450,
  color: { legend: true },
  
  x: { label: "Total number of ratings" },
  y: { label: "Average rating", domain: [2, 5.2] },

  marks: [
    Plot.dot(popularityOutliers, {
      x: "total_ratings",
      y: "avg_rating",
      r: 4,
      fill: "country",
      opacity: 0.7,
      tip: true,
      title: d => `${d.name}\n${d.country}\nRating: ${d.avg_rating}\nReviews: ${d.total_ratings}`
    })
  ]
}));
```

## How do cuisines differ in the time it takes to make the recipes?

A second way in which we can compare cuisines is how long it takes to make a recipe. For this, three variables are available in the dataset. First, there is the preparation time of the recipes. Second, there is the cooking time of the recipes. Finally, there is the total time, the sum of the two previous. We will use the preparation time and the cooking time to compare the cuisines.

**Outlier Analysis:** Similar to popularity, when plotting the time requirements we immediately notice some outliers. **Norwegian** and **Portuguese** cuisines seem to differ significantly in preparation and cooking times. We have highlighted them in the overall comparison and added an extra plot showing all individual recipes for these cuisines.

The figure below shows the average preparation time of a recipe per cuisine relative to the average cooking time of a recipe per cuisine.

```js
const cuisineStats2 = Object.values(
  cuisines.reduce((acc, d) => {
    if (!acc[d.country]) {
      acc[d.country] = {
        country: d.country,
        continent: d.continent || getContinent(d.country),
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
  continent: d.continent,
  avg_prep_time: d.sumPrep / d.count,
  avg_cook_time: d.sumCook / d.count,
  count: d.count
}));
```

```js
display(Plot.plot({
  title: "Preparation time and cooking time of cuisines (Averages)",
  width,
  height: 450,
  color: {
    legend: true,
    domain: ["Europe", "North America", "Asia", "South America", "Africa", "Oceania"],
    range: ["#ff0000", "#00ff00", "#0000ff", "#ff00ff", "#00ffff", "#000000"]
  },

  x: { label: "Average cooking time in minutes", domain: [0, 90] },
  y: { label: "Average preparation time in minutes", domain: [0, 90] },

  marks: [
    Plot.dot(cuisineStats2, {
      x: "avg_cook_time",
      y: "avg_prep_time",
      r: 6,
      fill: "continent",
      stroke: "white",
      strokeWidth: 0.5,
      tip: true,
      title: d =>
        `${d.country} (${d.continent})\nCooking time: ${Math.round(d.avg_cook_time)} min\nPreparation time: ${Math.round(d.avg_prep_time)} min`
    }),
    Plot.text(cuisineStats2.filter(d => d.country === "Norwegian" || d.country === "Portuguese"), {
      x: "avg_cook_time",
      y: "avg_prep_time",
      text: "country",
      dy: -15,
      fontWeight: "bold",
      fill: "black",
      stroke: "white",
      strokeWidth: 3
    })
  ]
}));
```

Below is the distribution of the individual recipes for **Norwegian** and **Portuguese** cuisines. It helps identify if one extremely slow-cooking recipe is heavily impacting the cuisine's average.

```js
const timeOutliers = cuisines.filter(d => 
  (d.country === "Norwegian") && 
  !isNaN(d.prep_time) && !isNaN(d.cook_time)
);

display(Plot.plot({
  title: "Individual Recipes: Norwegian",
  width,
  height: 450,
  color: { legend: true },
  
  x: { label: "Cooking time in minutes" },
  y: { label: "Preparation time in minutes" },

  marks: [
    Plot.dot(timeOutliers, {
      x: "cook_time",
      y: "prep_time",
      r: 4,
      fill: "country",
      opacity: 0.7,
      tip: true,
      title: d => `${d.name}\n${d.country}\nCooking time: ${d.cook_time} min\nPreparation time: ${d.prep_time} min`
    })
  ]
}));
```

```js
const timeOutliers = cuisines.filter(d => 
  (d.country === "Portuguese") && 
  !isNaN(d.prep_time) && !isNaN(d.cook_time)
);

display(Plot.plot({
  title: "Individual Recipes: Portuguese",
  width,
  height: 450,
  color: { legend: true },
  
  x: { label: "Cooking time in minutes" },
  y: { label: "Preparation time in minutes" },

  marks: [
    Plot.dot(timeOutliers, {
      x: "cook_time",
      y: "prep_time",
      r: 4,
      fill: "country",
      opacity: 0.7,
      tip: true,
      title: d => `${d.name}\n${d.country}\nCooking time: ${d.cook_time} min\nPreparation time: ${d.prep_time} min`
    })
  ]
}));
```

## How do cuisines differ in the nutritional values of their recipes?

The last way in which we can compare cuisines is the nutritional values of their recipes. For this we have for all recipes the number of kilocalories, fats, carbohydrates and proteins available. We will use all of these, whereby the user has the choice of which cuisines are displayed.

The radar chart below shows for each chosen cuisine the average values of the four nutrients. Each axis represents one nutrient, normalised relative to the maximum across all cuisines. Hover over a point to see the exact value.

```js
const cuisineStats3 = Object.values(
  cuisines.reduce((acc, d) => {
    if (!acc[d.country]) {
      acc[d.country] = {
        country: d.country,
        sumCal: 0, sumFat: 0, sumCar: 0, sumPro: 0, count: 0
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
const allCountriesNutrition = cuisineStats3.map(d => d.country).sort();
const selectedCuisine1 = view(Inputs.select(allCountriesNutrition, {
  label: "Cuisine 1",
  value: allCountriesNutrition[0]
}));
```

```js
const secondOptions = ["(none)", ...allCountriesNutrition.filter(c => c !== selectedCuisine1)];
const selectedCuisine2 = view(Inputs.select(secondOptions, { label: "Cuisine 2 (optional)" }));
```

```js
{
  const axes = [
    { key: "avg_cal", label: "Calories",      unit: "kcal", decimals: 0 },
    { key: "avg_fat", label: "Fat",            unit: "g",    decimals: 1 },
    { key: "avg_car", label: "Carbohydrates",  unit: "g",    decimals: 1 },
    { key: "avg_pro", label: "Protein",        unit: "g",    decimals: 1 },
  ];

  const n = axes.length;
  const levels = 5;
  const R = 150;
  const colors = ["#ff0000", "#00ff00"];

  const selectedCuisines = [selectedCuisine1];
  if (selectedCuisine2 && selectedCuisine2 !== "(none)") selectedCuisines.push(selectedCuisine2);

  const maxVal = {};
  for (const ax of axes) maxVal[ax.key] = Math.max(...cuisineStats3.map(d => d[ax.key]));

  const angleOf = (i) => (2 * Math.PI * i) / n - Math.PI / 2;
  const toXY = (i, r) => ({
    x: r * Math.cos(angleOf(i)),
    y: r * Math.sin(angleOf(i))
  });

  const gridPoints = [];
  for (let lvl = 1; lvl <= levels; lvl++) {
    const r = R * (lvl / levels);
    for (let i = 0; i <= n; i++) {
      const { x, y } = toXY(i % n, r);
      gridPoints.push({ x, y, lvl });
    }
  }

  const axisLines = axes.flatMap((ax, i) => [
    { x: 0, y: 0, axis: i },
    { x: toXY(i, R).x, y: toXY(i, R).y, axis: i }
  ]);

  const axisLabels = axes.map((ax, i) => {
    const { x, y } = toXY(i, R + 28);
    return { x, y, label: `${ax.label} (${ax.unit})` };
  });

  const dataLines = [];
  const dataDots  = [];
  selectedCuisines.forEach((cuisine, s) => {
    const row = cuisineStats3.find(d => d.country === cuisine);
    if (!row) return;
    axes.forEach((ax, i) => {
      const r = R * (row[ax.key] / maxVal[ax.key]);
      const { x, y } = toXY(i, r);
      const raw = row[ax.key];
      const formatted = ax.decimals === 0
        ? `${Math.round(raw)} ${ax.unit}`
        : `${raw.toFixed(ax.decimals)} ${ax.unit}`;
      dataLines.push({ x, y, cuisine, colorIndex: s });
      dataDots.push({ x, y, cuisine, label: ax.label, value: formatted, colorIndex: s });
    });
    const ax0 = axes[0];
    const r0 = R * (row[ax0.key] / maxVal[ax0.key]);
    const { x: x0, y: y0 } = toXY(0, r0);
    dataLines.push({ x: x0, y: y0, cuisine, colorIndex: s });
  });

  display(Plot.plot({
    width: 520,
    height: 520,
    marginTop: 40,
    marginBottom: 40,
    marginLeft: 40,
    marginRight: 40,
    x: { domain: [-R - 50, R + 50], axis: null },
    y: { domain: [-R - 50, R + 50], axis: null },
    color: {
      domain: selectedCuisines,
      range: colors.slice(0, selectedCuisines.length),
      legend: true
    },
    marks: [
      Plot.line(gridPoints, {
        x: "x", y: "y", z: "lvl",
        stroke: "#ccc", strokeWidth: 0.8,
        fill: d => d.lvl % 2 === 0 ? "#efefef" : "#e6e6e6",
      }),
      Plot.line(axisLines, {
        x: "x", y: "y", z: "axis",
        stroke: "#bbb", strokeWidth: 1
      }),
      Plot.text(axisLabels, {
        x: "x", y: "y",
        text: "label",
        fontSize: 11,
        fontWeight: "bold",
        fill: "#444",
        textAnchor: "middle"
      }),
      Plot.line(dataLines, {
        x: "x", y: "y", z: "cuisine",
        stroke: "cuisine", strokeWidth: 2.5,
        fill: "cuisine", fillOpacity: 0.15,
        curve: "linear-closed"
      }),
      Plot.dot(dataDots, {
        x: "x", y: "y",
        fill: "cuisine", r: 5,
        stroke: "white", strokeWidth: 1.5,
        tip: true,
        title: d => `${d.cuisine}\n${d.label}: ${d.value}`
      }),
    ]
  }));
}
```