---
title: Cuisine exploration
---
# Cuisine Exploration

### Cuisines
Every recipe of our dataset is chosen to be part of a certain cuisine. However, what's meant by cuisine can be rather ambiguous. There might be multiple cuisines used to label a recipe, one more specific than the other. The following word cloud shows you which labels were chosen by the website allrecipes.com to orient the recipes. Although of these labels coincide with countries there are also several more general cases like Scandinavian or more specific like Cajun.
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

### Cuisines around the world

We think it's also relevant to know which part of the world is represented in this dataset. The world map below does this while also giving some more spatial insight into the other cuisines of the dataset. An interesting observation to make is the fact that some regions are missing, for example the African continent is almost completely missing from the dataset.

```js
import { FileAttachment } from "observablehq:stdlib";
import { normalizeRow } from "./loadData.js";
import { WorldMap } from "./components/WorldMap.js";

```

```js
display(await WorldMap(cuisines));
```


**Green** = At least 1 cuisine in the dataset, **Grey** = No cuisine in the dataset
