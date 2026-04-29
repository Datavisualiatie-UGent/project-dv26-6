---
title: Recepten Visualisatie
---

# Recepten Dashboard

Deze pagina toont een eerste visualisatie van de TidyTuesday AllRecipes‑dataset.

## Cuisines

```js

const allRecipesRaw = await FileAttachment("data/all_recipes.csv").csv({ typed: true });
const cuisinesRaw = await FileAttachment("data/cuisines.csv").csv({ typed: true });

const all_recipes = allRecipesRaw.map(normalizeRow);
const cuisines = cuisinesRaw.map(normalizeRow);

import { Wordcloud } from "./components/Wordcloud.js"
```
```js
display(await Wordcloud(cuisines));
```

## Tweede plot, wereldkaart

Belangrijk om te weten bij deze dataset is welk deel van de wereld het vertegenwoordigt, zoals veel datasets ontbreken bepaalde regio's waaronder vooral het continent Afrika. Deze kaart toont welke landen en keukens er vertegenwoordigd zijn in de dataset

```js
import { FileAttachment } from "observablehq:stdlib";
import { normalizeRow } from "./loadData.js";
import { WorldMap } from "./components/WorldMap.js";

```

```js
display(await WorldMap(cuisines));
```


**Groen** = Minstens 1 keuken in de dataset, **Grijs** = Geen keuken
