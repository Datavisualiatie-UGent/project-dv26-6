import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function Wordcloud(cuisines) {
  return (async () => {

    // Load d3-cloud as a global
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/d3-cloud@1/build/d3.layout.cloud.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    const cloud = window.d3.layout.cloud;

    const width = 960, height = 500;

    const svg = d3.create("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");

    // 1. Count occurrences per cuisine

    const counts = {};
    for (const recipe of cuisines) {
      const cuisine = recipe.country;
      counts[cuisine] = (counts[cuisine] || 0) + 1;
    }

    const words = Object.entries(counts).map(([text, count]) => ({ text, count }));

    // 2. Font size scale
    const sizeScale = d3.scaleLinear()
      .domain([1, Math.max(...Object.values(counts))])
      .range([12, 80]);

    // 3. Color scale
    const colorScale = d3.scaleSequential()
      .domain([1, Math.max(...Object.values(counts))])
      .range(["#1D9E75", "#074e42"]);

    // 4. Run the layout
    await new Promise((resolve) => {
      cloud()
        .size([width, height])
        .words(words)
        .padding(4)
        .rotate(0)
        .fontSize(d => sizeScale(d.count))
        .on("end", (laid) => {
          svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)
            .selectAll("text")
            .data(laid)
            .join("text")
            .style("font-size", d => d.size + "px")
            .style("fill", d => colorScale(d.count))
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
            .text(d => d.text);
          resolve();
        })
        .start();
    });

    return svg.node();

  })();
}