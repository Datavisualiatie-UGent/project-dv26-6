export function BookAnimation() {
  const container = document.createElement('div');
  container.style.cssText = 'height: 500px; position: relative;';
  
  container.innerHTML = `
    <div class="book-scene">
      <span class="book-emoji" id="book">📖</span>
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
    <p class="hint">↓ scroll to reveal</p>
  `;

  const style = document.createElement('style');
  style.textContent = `
    .book-scene { display: flex; justify-content: center; align-items: center; padding: 80px 0; position: relative; }
    .book-emoji { font-size: 72px; position: relative; z-index: 10; transition: transform 0.05s linear; }
    .ingredient { position: absolute; font-size: 32px; opacity: 0; transform: translate(0,0) scale(0.2); pointer-events: none; }
    .hint { text-align: center; font-size: 13px; color: gray; transition: opacity 0.4s; }
    .hint.hidden { opacity: 0; }
  `;
  container.prepend(style);

  const items = [
    { id: 'i0', angle: -140, dist: 130 },
    { id: 'i1', angle: -100, dist: 115 },
    { id: 'i2', angle: -55,  dist: 125 },
    { id: 'i3', angle: -20,  dist: 110 },
    { id: 'i4', angle:  20,  dist: 120 },
    { id: 'i5', angle:  60,  dist: 115 },
    { id: 'i6', angle: 100,  dist: 125 },
    { id: 'i7', angle: 140,  dist: 110 },
    { id: 'i8', angle: 175,  dist: 120 },
  ];

  function ease(t) { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }

  function applyProgress(raw, book, hint, els) {
    const p = ease(Math.min(Math.max(raw, 0), 1));
    hint.classList.toggle('hidden', raw > 0.05);
    book.style.transform = `scale(${1 + p * 0.18})`;
    els.forEach((item, idx) => {
      const delay = idx / els.length * 0.35;
      const ep = ease(Math.max(0, Math.min(1, (raw - delay) / (1 - delay))));
      const rad = item.angle * Math.PI / 180;
      item.el.style.transform = `translate(${Math.cos(rad)*item.dist*ep}px, ${Math.sin(rad)*item.dist*ep}px) scale(${0.2 + ep*0.9}) rotate(${ep*(idx%2===0?12:-10)}deg)`;
      item.el.style.opacity = ep;
    });
  }

  requestAnimationFrame(() => {
    const book = container.querySelector('#book');
    const hint = container.querySelector('.hint');
    const els = items.map(item => ({ ...item, el: container.querySelector(`#${item.id}`) }));

    // start hidden
    applyProgress(0, book, hint, els);

    // walk up the DOM to find the actual scrolling parent
    function getScrollParent(el) {
      let parent = el.parentElement;
      while (parent) {
        const { overflow, overflowY } = getComputedStyle(parent);
        if (/(auto|scroll)/.test(overflow + overflowY)) return parent;
        parent = parent.parentElement;
      }
      return window;
    }

    // wait until attached to DOM so we can find scroll parent
    const observer = new MutationObserver(() => {
      if (!document.contains(container)) return;
      observer.disconnect();

      const scrollParent = getScrollParent(container);

      function onScroll() {
        const rect = book.getBoundingClientRect();
        const viewH = window.innerHeight;
        // animate as book travels from bottom of viewport to center
        const raw = (viewH - rect.top) / (viewH * 0.7);
        applyProgress(raw, book, hint, els);
      }

      scrollParent.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });

  return container;
}