import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import * as topojson from "https://cdn.jsdelivr.net/npm/topojson-client@3/+esm";

export function WorldMap(cuisines) {
  return (async () => {


  const cuisineMap = {
    "Greek": ["GRC"], "Jewish": ["ISR"], "Australian and New Zealander": ["AUS","NZL"],
    "Chilean": ["CHL"], "Tex-Mex": ["USA","MEX"], "Canadian": ["CAN"],
    "Italian": ["ITA"], "Danish": ["DNK"], "Amish and Mennonite": ["USA"],
    "Spanish": ["ESP"], "Filipino": ["PHL"], "Brazilian": ["BRA"],
    "Cuban": ["CUB"], "Peruvian": ["PER"], "Southern Recipes": ["USA"],
    "Chinese": ["CHN"], "Puerto Rican": ["PRI"], "Malaysian": ["MYS"],
    "Soul Food": ["USA"], "Japanese": ["JPN"], "Scandinavian": ["SWE","NOR","DNK","FIN"],
    "Portuguese": ["PRT"], "Israeli": ["ISR"], "Bangladeshi": ["BGD"],
    "Russian": ["RUS"], "Norwegian": ["NOR"], "Swedish": ["SWE"],
    "Finnish": ["FIN"], "Indian": ["IND"], "Colombian": ["COL"],
    "Lebanese": ["LBN"], "French": ["FRA"], "German": ["DEU"],
    "Polish": ["POL"], "Turkish": ["TUR"], "Vietnamese": ["VNM"],
    "Argentinian": ["ARG"], "Thai": ["THA"], "Cajun and Creole": ["USA"],
    "Persian": ["IRN"], "Jamaican": ["JAM"], "Korean": ["KOR"],
    "South African": ["ZAF"], "Indonesian": ["IDN"], "Dutch": ["NLD"],
    "Austrian": ["AUT"], "Belgian": ["BEL"], "Pakistani": ["PAK"], "Swiss": ["CHE"]
  };

  const coveredISO = new Set(Object.values(cuisineMap).flat());
  const countryToCuisines = {};
  for (const [cuisine, isos] of Object.entries(cuisineMap)) {
    for (const iso of isos) {
      if (!countryToCuisines[iso]) countryToCuisines[iso] = [];
      countryToCuisines[iso].push(cuisine);
    }
  }

  const isoMap = {
    "004":"AFG","008":"ALB","012":"DZA","024":"AGO","032":"ARG","036":"AUS","040":"AUT",
    "050":"BGD","056":"BEL","068":"BOL","076":"BRA","100":"BGR","116":"KHM","120":"CMR",
    "124":"CAN","152":"CHL","156":"CHN","170":"COL","191":"HRV","192":"CUB","203":"CZE",
    "208":"DNK","218":"ECU","818":"EGY","231":"ETH","246":"FIN","250":"FRA","276":"DEU",
    "288":"GHA","300":"GRC","320":"GTM","332":"HTI","356":"IND","360":"IDN","364":"IRN",
    "368":"IRQ","372":"IRL","376":"ISR","380":"ITA","388":"JAM","392":"JPN","400":"JOR",
    "404":"KEN","408":"PRK","410":"KOR","418":"LAO","422":"LBN","430":"LBR","434":"LBY",
    "484":"MEX","504":"MAR","508":"MOZ","524":"NPL","528":"NLD","554":"NZL","566":"NGA",
    "578":"NOR","586":"PAK","591":"PAN","604":"PER","608":"PHL","616":"POL","620":"PRT",
    "630":"PRI","642":"ROU","643":"RUS","682":"SAU","710":"ZAF","724":"ESP","752":"SWE",
    "756":"CHE","760":"SYR","764":"THA","788":"TUN","792":"TUR","800":"UGA","804":"UKR",
    "826":"GBR","834":"TZA","840":"USA","858":"URY","862":"VEN","704":"VNM","887":"YEM",
    "716":"ZWE"
  };

  const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
  const countries = topojson.feature(world, world.objects.countries);

  const width = 960, height = 500;
  const projection = d3.geoNaturalEarth1().scale(160).translate([width / 2, height / 2]);
  const pathGen = d3.geoPath(projection);

  const svg = d3.create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", "100%")
    .style("height", "auto");

  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid #ccc")
    .style("border-radius", "6px")
    .style("padding", "6px 10px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("display", "none")
    .style("color", "#333");

  svg.selectAll("path")
    .data(countries.features)
    .join("path")
    .attr("d", pathGen)
    .attr("fill", d => {
      const iso = isoMap[String(d.id).padStart(3, "0")];
      return iso && coveredISO.has(iso) ? "#1D9E75" : "#D3D1C7";
    })
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.4)
    .on("mouseover", function(event, d) {
      const iso = isoMap[String(d.id).padStart(3, "0")];
      if (iso && coveredISO.has(iso)) {
        tooltip.style("display", "block").text(countryToCuisines[iso].join(", "));
        d3.select(this).attr("fill", "#0F6E56");
      }
    })
    .on("mousemove", event => {
      tooltip.style("left", (event.pageX + 12) + "px").style("top", (event.pageY - 8) + "px");
    })
    .on("mouseout", function(event, d) {
      const iso = isoMap[String(d.id).padStart(3, "0")];
      d3.select(this).attr("fill", iso && coveredISO.has(iso) ? "#1D9E75" : "#D3D1C7");
      tooltip.style("display", "none");
    });

  return svg.node();
  })();
}