---
title: Recepten Visualisatie
---

# Recepten Dashboard

Deze pagina toont een eerste visualisatie van de TidyTuesday AllRecipes‑dataset.

## Plot laden

```js
import { FileAttachment } from "observablehq:stdlib";
import { normalizeRow } from "./loadData.js";
import { MyPlot } from "./components/MyPlot.js";

const allRecipesRaw = await FileAttachment("data/all_recipes.csv").csv({ typed: true });
const cuisinesRaw = await FileAttachment("data/cuisines.csv").csv({ typed: true });

const all_recipes = allRecipesRaw.map(normalizeRow);
const cuisines = cuisinesRaw.map(normalizeRow);
```
```js
display(MyPlot(all_recipes));
```

## Tweede plot, wereldkaart

Deze kaart toont welke landen en keukens er vertegenwoordigd zijn in de dataset

```js
import { FileAttachment } from "observablehq:stdlib";
import { normalizeRow } from "./loadData.js";
import { WorldMap } from "./components/WorldMap.js";

```

```js
display(await WorldMap(cuisines));
```


**Groen** = Minstens 1 keuken in de dataset · **Gray** = Geen keuken
