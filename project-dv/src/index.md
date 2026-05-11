---
title: Recipes Visualisation
---

<div style="text-align: center; font-size: 2.5em; font-weight: bold;">
AllRecipes visualized
</div>


<div id="book-container" style="display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 80px 0; position: relative;">
  <span id="book" style="font-size: 72px; position: relative; z-index: 10;">📖</span>
  <span class="ingredient" id="i0">🧅</span>
  <span class="ingredient" id="i1">🌶️</span>
  <span class="ingredient" id="i2">🧄</span>
  <span class="ingredient" id="i3">🫒</span>
  <span class="ingredient" id="i4">🧈</span>
  <span class="ingredient" id="i5">🍋</span>
  <span class="ingredient" id="i6">🥕</span>
  <span class="ingredient" id="i7">🌿</span>
  <span class="ingredient" id="i8">🫙</span>
</div>

<style>
  .ingredient {
    position: absolute;
    font-size: 32px;
    opacity: 0;
    transform: translate(0,0) scale(0.2);
    pointer-events: none;
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.6s ease;
  }
  .ingredient.popped {
    opacity: 1;
  }
</style>

```js
const book = document.getElementById("book");

const items = [
  { id: "i0", angle: -140, dist: 130 },
  { id: "i1", angle: -100, dist: 115 },
  { id: "i2", angle: -55,  dist: 125 },
  { id: "i3", angle: -20,  dist: 110 },
  { id: "i4", angle:  20,  dist: 120 },
  { id: "i5", angle:  60,  dist: 115 },
  { id: "i6", angle: 100,  dist: 125 },
  { id: "i7", angle: 140,  dist: 110 },
  { id: "i8", angle: 175,  dist: 120 },
].map(item => ({ ...item, el: document.getElementById(item.id) }));

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      book.style.transform = "scale(1.18)";
      items.forEach((item, idx) => {
        setTimeout(() => {
          const rad = item.angle * Math.PI / 180;
          item.el.style.transform = `translate(${Math.cos(rad) * item.dist}px, ${Math.sin(rad) * item.dist}px) scale(1.1) rotate(${idx % 2 === 0 ? 12 : -10}deg)`;
          item.el.style.opacity = 1;
        }, idx * 60);
      });
    } else {
      book.style.transform = "scale(1)";
      items.forEach(item => {
        item.el.style.transform = "translate(0,0) scale(0.2)";
        item.el.style.opacity = 0;
      });
    }
  });
}, { threshold: 0.5 });

observer.observe(book);
invalidation.then(() => observer.disconnect());
```

<div style="max-width: 600px; margin: 0 auto; text-align: center;">
<p>
In this visualisation we will be looking at a dataset of 2,218 recipes released by the popular website "AllRecipes.com".
The saying "You are what you eat" says it all: you can find out a lot about somebody through their eating habits, or more specifically, their cooking habits. This webpage gives the viewer the chance to look at how people cook throughout different cultures: what ingrediënts do they use, which nutrients are prominent, how much time do we spend in the kitchen and much more!
</p>
<hr>
<p>
The <a href="./exploration">first page</a> allows you to explore the dataset in a more general sense, showing you what we mean by cuisines and which ones are represented.
The <a href = "./cuisines">cuisines</a> page will help you compare different cultures and their values when it comes to food.
The <a href = "./ingredients">final page</a> takes a deeper look into the ingredient data.
</p>
</div>