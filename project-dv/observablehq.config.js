// See https://observablehq.com/framework/config for documentation.
export default {
  // The app’s title; used in the sidebar and webpage titles.
  title: "AllRecipes",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  // pages: [
  //   {
  //     name: "Examples",
  //     pages: [
  //       {name: "Dashboard", path: "/example-dashboard"},
  //       {name: "Report", path: "/example-report"}
  //     ]
  //   }
  // ],

  pages: [
    { name: "Home", path: "/" },
    { name: "AllRecipes", path: "/allrecipes" },
    { name: "Cuisines", path: "/cuisines" },
    { name: "Ingredients", path: "/ingredients" },
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  theme: "air",

  sidebar: false,
  header: `<nav style="
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 1rem 2rem;
    background: white;
    border-bottom: 1px solid #e5e7eb;
    font-family: sans-serif;
  ">
    <strong style="font-size: 1.2rem;">🍽️ Recepten</strong>
    <a href="/" class="nav-link">Home</a>
    <a href="/allrecipes" class="nav-link">Explore</a>
    <a href="/cuisines" class="nav-link">Cuisines</a>
    <a href="/ingredients" class="nav-link">Ingredients</a>
  </nav>
  <style>
    .nav-link {
      text-decoration: none !important;
      color: #000000 !important;
      font-weight: 500;
      border-radius: 999px;
      padding: 0.4rem 1rem;
      transition: background-color 0.2s;
    }
    .nav-link.active {
      color: #00a896 !important;
    }
    
    .nav-link:hover {
      background-color: #f3f4f6;
      border-radius: 999px;
      padding: 0.4rem 1rem;
    }
  </style>
  <script>
    function setActiveLink() {
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const linkPath = link.pathname.replace(/\\/+$/, '') || '/';
        const currentPath = window.location.pathname.replace(/\\/+$/, '') || '/';
        if (linkPath === currentPath) {
          link.classList.add('active');
        }
      });
    }

    setActiveLink();

    const observer = new MutationObserver(setActiveLink);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('popstate', setActiveLink);
  </script>`,




  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // preserveExtension: false, // drop .html from URLs
  // preserveIndex: false, // drop /index from URLs
};
