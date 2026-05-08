import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function Wordcloud(cuisines) {
  return (async () => {

    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/d3-cloud@1/build/d3.layout.cloud.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });

    const cloud = window.d3.layout.cloud;

    const width = 760, height = 380;

    const container = d3.create("div")
      .style("position", "relative")
      .style("background", "#f5f5f5")
      .style("border-radius", "12px")
      .style("padding", "16px")
      .style("box-sizing", "border-box")
      .style("width", "100%");

    const svg = container.append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");

    // Tooltip
    const tooltip = container.append("div")
      .style("position", "absolute")
      .style("background", "#562c2c")
      .style("color", "#fff")
      .style("padding", "5px 10px")
      .style("border-radius", "4px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("transition", "opacity 0.15s");

    // 1. Count occurrences per cuisine
    const counts = {};
    for (const recipe of cuisines) {
      const cuisine = recipe.country;
      counts[cuisine] = (counts[cuisine] || 0) + 1;
    }

    const words = Object.entries(counts).map(([text, count]) => ({ text, count }));

    const maxCount = Math.max(...Object.values(counts));
    const minCount = Math.min(...Object.values(counts));

    // 2. Font size scale
    const sizeScale = d3.scaleLinear()
      .domain([minCount, maxCount])
      .range([10, 64]);

    // 3. Color scale
    const colorScale = d3.scaleSequential()
      .domain([minCount, maxCount])
      .interpolator(d3.interpolateRgb("#d8bcab", "#562c2c"));

    // 4. Run the layout
    await new Promise((resolve) => {
      cloud()
        .size([width, height])
        .words(words.map(d => ({ ...d, size: sizeScale(d.count) })))
        .padding(4)
        .rotate(0)
        .fontSize(d => d.size)
        .on("end", (laid) => {
          svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)
            .selectAll("text")
            .data(laid)
            .join("text")
            .style("font-size", d => d.size + "px")
            .style("fill", d => colorScale(d.count))
            .style("cursor", "default")
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x}, ${d.y}) rotate(${d.rotate})`)
            .text(d => d.text)
            .on("mousemove", function (event, d) {
              const [mx, my] = d3.pointer(event, container.node());
              tooltip
                .style("opacity", 1)
                .style("left", (mx + 12) + "px")
                .style("top", (my - 28) + "px")
                .text(`${d.text}: ${d.count} recipe${d.count !== 1 ? "s" : ""}`);
            })
            .on("mouseleave", function () {
              tooltip.style("opacity", 0);
            });
          resolve();
        })
        .start();
    });

    return container.node();

  })();
}