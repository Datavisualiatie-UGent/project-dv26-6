---
title: Keukens
---

```js
import * as Plot from "@observablehq/plot";


const cuisineData      = await FileAttachment("data/cuisine_ingredients.csv").csv({ typed: true });
```

# Wat zijn de verschillen tussen de keukens over de hele wereld?

Er zijn veel verschillende keukens over de hele wereld. In onze dataset hebben we er ${cuisineData.length} ter beschikking. Op deze pagina zullen we deze keukens vergelijken en zo een idee krijgen op welke manier ze verschillen van elkaar. Voordat we dit doen, geven we eerst een kort overzicht van welke recepten er bij welke keuken horen.

plot met een oplijsting van beste recepten voor een keuken naar keuze

# Hoeveel recepten hebben de verschillende keukens?

Een eerste manier waarop keukens kunnen verschillen van elkaar is het aantal recepten dat ze aanbieden. Een keuken die veel recepten aanbiedt heeft meer variatie, terwijl een keuken die weinig recepten aanbiedt misschien enkele bekende klassiekers heeft. ...

plot met gerangschikt aantal recepten per keuken (meeste en minste)
