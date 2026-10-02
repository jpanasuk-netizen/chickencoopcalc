/* ChickenCoopCalc calculators — vanilla JS, no dependencies.
   Rates:
   - Coop/run, standard birds: 4 sq ft indoors and 10 sq ft of run (inside eXtension and UC Master Gardener 3–4 indoor, and their 10 outdoor).
   - Bantams: calculator uses 2 indoors and 8 of run, above the Penn State / Maryland minimum of 1 and 4.
   - Nests: calculator uses 1 box per 3 hens, tighter than the published 1 per 4–5. Communal uses 1 per 5.
   - Feed: 0.25 lb per standard hen per day (Alabama Extension; Kentucky ASC-191). No 20% winter factor in those pages.
   - Brooder temps follow Maryland Extension (90–95°F, then −5°F per week). Wattage and the adult heat line are site planning, not those pages.
   - Ventilation: site planning ratio of about 1 sq ft of high opening per 10 sq ft of floor.
   Estimates round UP. Pure functions take a DOM-free inputs object. */
"use strict";

/* ================= pure calculation functions (DOM-free) ================= */

function calcCoopSize(birds, breedType) {
  birds = Math.max(0, birds || 0);
  var perCoop = breedType === "bantam" ? 2 : 4;      // sq ft per bird indoors
  var perRun  = breedType === "bantam" ? 8 : 10;     // sq ft per bird in run
  return {
    coopSqFt:  ceilTo(birds * perCoop, 2),
    runSqFt:   ceilTo(birds * perRun, 4),
    perBirdCoop: perCoop,
    perBirdRun: perRun,
    // footprint suggestions assuming a standard 8 ft deep coop
    coopFootprint: birds ? suggestFootprint(ceilTo(birds * perCoop, 2)) : "—",
    runFootprint:  birds ? suggestFootprint(ceilTo(birds * perRun, 4)) : "—"
  };
}

function suggestFootprint(sqft) {
  var presets = [
    [8, "8 ft × "], [10, "10 ft × "], [12, "12 ft × "], [16, "16 ft × "]
  ];
  for (var i = 0; i < presets.length; i++) {
    var w = presets[i][0];
    if (sqft % w === 0 || sqft / w <= 24) {
      var d = Math.ceil(sqft / w);
      return w + " ft × " + d + " ft";
    }
  }
  return Math.ceil(sqft / 10) + " ft × 10 ft (or larger)";
}

function calcFeed(birds, weeks, pricePer50lb) {
  birds = Math.max(0, birds || 0);
  weeks = Math.max(0, weeks || 0);
  var price = Math.max(0, pricePer50lb || 0);
  var lbPerDay = birds * 0.25;                       // standard layer, ~1/4 lb/day
  var lbMonth = lbPerDay * 30.44;                    // avg month length
  var bags = Math.ceil(lbMonth / 50);
  var monthlyCost = (lbMonth / 50) * price;
  var totalLb = lbPerDay * 7 * weeks;
  return {
    lbPerDay: round2(lbPerDay),
    lbMonth: Math.round(lbMonth),
    bagsMonth: bags,
    monthlyCost: Math.round(monthlyCost * 100) / 100,
    perEggCostCents: birds ? Math.round(monthlyCost / (birds * 0.8 * 30.44) * 100) : 0, // 80% lay rate
    totalLb: Math.round(totalLb),
    totalCost: Math.round((totalLb / 50) * price * 100) / 100
  };
}

function calcNestBoxes(hens, style) {
  hens = Math.max(0, hens || 0);
  // Published rate is 1 per 4–5. This function uses 1 per 3 (tighter). Communal uses 1 per 5.
  var perBox = style === "communal" ? 5 : 3;
  var boxes = hens ? Math.ceil(hens / perBox) : 0;
  return {
    boxes: boxes,
    perBox: perBox,
    boxesMax: style === "communal" ? Math.ceil(hens / 5) : Math.ceil(hens / 4),
    note: hens && boxes === 1 ? "1 box covers this flock; add a second once you pass 3 hens" : null
  };
}

function calcHeat(coopSqFt, winterLowF, hasChicks) {
  var sqft = Math.max(1, coopSqFt || 0);
  var low = parseFloat(winterLowF);
  if (isNaN(low)) low = 32;
  // Hardy adult breeds are fine below ~20°F with dry, draft-free ventilation.
  // Maryland brooder steps are 90–95°F, then −5°F/week. Watts below are a site ratio (250 W per 16 sq ft), not that page.
  var needAdult = low < 20;
  var adultWatts = needAdult ? ceilTo(sqft * 250 / 16, 50) : 0;
  var chickSqft = Math.min(sqft, 16);
  var chickWatts = ceilTo(chickSqft * 250 / 16, 50);
  var ventSqFt = Math.max(0.5, Math.round(sqft / 10 * 2) / 2); // 1 sq ft vent per 10 sq ft floor, half-ft steps
  return {
    adultNeedsHeat: needAdult,
    adultWatts: adultWatts,
    chickWatts: chickWatts,
    ventSqFt: ventSqFt,
    brooderWeeks: 6,
    warn: hasChicks && low < 95
      ? null
      : null
  };
}

/* ================= helpers ================= */
function el(id){ return document.getElementById(id); }
function fmt(n){ return Math.round(n).toLocaleString("en-US"); }
function round2(n){ return Math.round(n * 100) / 100; }
function ceilTo(n, step){ return Math.ceil(n/step)*step; }

/* ================= DOM wiring (thin layer over pure fns) ================= */
function showTab(key, btn){
  document.querySelectorAll(".panel").forEach(function(p){ p.classList.remove("active"); });
  document.querySelectorAll(".tabs button").forEach(function(b){ b.setAttribute("aria-selected","false"); });
  el(key).classList.add("active");
  if(btn) btn.setAttribute("aria-selected","true");
}

function readNum(id, fallback){
  var v = parseFloat(el(id).value);
  return isNaN(v) ? fallback : v;
}

/* 1. Coop size */
function runCoopCalc(){
  var birds = readNum("ccBirds", 0);
  if(!birds){ alert("Enter how many birds you plan to keep."); return; }
  var breed = el("ccBreed").value;                   // standard | bantam
  var r = calcCoopSize(birds, breed);
  var box = el("ccResult"); box.hidden = false;
  if (window.updateMatchedCTA) window.updateMatchedCTA(r.coopSqFt, 'coop');
  box.innerHTML = '<div class="big">'+fmt(r.coopSqFt)+' <span class="unit">sq ft coop · '+fmt(r.runSqFt)+' sq ft run</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+fmt(r.coopSqFt)+' sq ft</b><span>Coop interior ('+r.perBirdCoop+' sq ft/bird, '+breed+')</span></div>'+
      '<div class="stat"><b>'+fmt(r.runSqFt)+' sq ft</b><span>Outdoor run ('+r.perBirdRun+' sq ft/bird)</span></div>'+
      '<div class="stat"><b>'+r.coopFootprint+'</b><span>Example coop footprint</span></div>'+
      '<div class="stat"><b>'+r.runFootprint+'</b><span>Example run footprint</span></div>'+
    '</div>'+
    '<p class="note">Standard birds: 4 sq ft indoors and 10 sq ft of run, inside the published 3–4 sq ft indoor range and the 10 sq ft outdoor figure. Bantam results use 2 and 8, which is above the Penn State and Maryland minimum of 1 and 4. Build above a cramped floor.</p>'+
    nestLine(r, birds);
}

function nestLine(coop, birds){
  var nb = calcNestBoxes(birds, "standard");
  return '<p class="note">Flock needs about <strong>'+nb.boxes+' nesting box'+(nb.boxes===1?'':'es')+'</strong> at this calculator\'s tighter rate of 1 per 3 hens (published guidance is 1 per 4–5) and roughly <strong>'+fmt(birds*0.25)+' lb of feed per day</strong> — check the feed tab.</p>';
}

/* 2. Feed calculator */
function runFeedCalc(){
  var birds = readNum("fdBirds", 0);
  if(!birds){ alert("Enter your bird count."); return; }
  var weeks = readNum("fdWeeks", 12);
  var price = readNum("fdPrice", 22);
  var r = calcFeed(birds, weeks, price);
  var box = el("fdResult"); box.hidden = false;
  if (window.updateMatchedCTA) window.updateMatchedCTA(r.lbMonth, 'feed');
  box.innerHTML = '<div class="big">'+fmt(r.lbMonth)+' <span class="unit">lb of feed per month · ~$'+r.monthlyCost.toFixed(2)+'</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+r.lbPerDay+' lb</b><span>Feed per day ('+birds+' hens × ¼ lb)</span></div>'+
      '<div class="stat"><b>'+r.bagsMonth+'</b><span>50 lb bags per month</span></div>'+
      '<div class="stat"><b>~'+r.perEggCostCents+'¢</b><span>Feed cost per egg (80% lay rate)</span></div>'+
      '<div class="stat"><b>'+fmt(r.totalLb)+' lb</b><span>For '+weeks+' weeks (~$'+r.totalCost.toFixed(2)+')</span></div>'+
    '</div>'+
    '<p class="note">Alabama Extension: about 0.25 lb per laying hen per day, and layer diets at 16% protein or more. Kentucky Extension states the same quarter-pound rule. Those pages say bantams eat less and that intake can rise in cold weather; they do not give a 40% or 20% adjustment. Scratch is not a complete feed.</p>';
}

/* 3. Nesting boxes */
function runNestCalc(){
  var hens = readNum("nbHens", 0);
  if(!hens){ alert("Enter how many hens you have."); return; }
  var style = el("nbStyle").value;                   // standard | communal
  var r = calcNestBoxes(hens, style);
  var box = el("nbResult"); box.hidden = false;
  if (window.updateMatchedCTA) window.updateMatchedCTA(r.boxes, 'nest');
  box.innerHTML = '<div class="big">'+r.boxes+' <span class="unit">nesting box'+(r.boxes===1?'':'es')+'</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+r.boxes+(r.boxesMax>r.boxes ? '–'+r.boxesMax : '')+'</b><span>Boxes to build (1 per '+(style==="communal"?"5, the wide end of 4–5":"3, tighter than the published 4–5")+')</span></div>'+
      '<div class="stat"><b>12 × 12 × 12</b><span>Box size in inches (standard)</span></div>'+
      '<div class="stat"><b>'+fmt(hens)+'</b><span>Hens sharing them</span></div>'+
      '<div class="stat"><b>Below the roost</b><span>Mount boxes lower than perches — they sleep highest</span></div>'+
    '</div>'+
    '<p class="note">Published guidance is one nest per 4 to 5 hens. This tab counts one per 3, which is tighter than that range. The communal option uses one per 5, the wide end of the same range. Penn State says a chicken nest should be at least 12 by 12 inches, mounted below the roost.</p>';
}

/* 4. Heat lamp & winter ventilation */
function runHeatCalc(){
  var sqft = readNum("htSqft", 0);
  if(!sqft){ alert("Enter your coop floor area in sq ft (the coop tab computes it)."); return; }
  var low = readNum("htLow", 32);
  var chicks = el("htChicks").value === "yes";
  var r = calcHeat(sqft, low, chicks);
  var box = el("htResult"); box.hidden = false;
  if (window.updateMatchedCTA) window.updateMatchedCTA(r.ventSqFt, 'heat');
  var heatLine = r.adultNeedsHeat
    ? '<div class="stat"><b>'+r.adultWatts+' W</b><span>Site planning watts below 20°F — not an extension cutoff</span></div>'
    : '<div class="stat"><b>None</b><span>No adult watts at '+low+'°F on this planner\'s 20°F line</span></div>';
  box.innerHTML = '<div class="big">'+r.ventSqFt+' <span class="unit">sq ft of high ventilation needed</span></div>'+
    '<div class="grid2">'+
      heatLine+
      '<div class="stat"><b>'+(chicks ? r.chickWatts+' W' : '—')+'</b><span>Brooder bulb for chicks (95°F week 1, −5°F/wk)</span></div>'+
      '<div class="stat"><b>High vents only</b><span>Above roost height, out of roost drafts</span></div>'+
      '<div class="stat"><b>Never close it</b><span>Moisture causes frostbite, not cold</span></div>'+
    '</div>'+
    '<p class="note">'+(r.adultNeedsHeat
      ? 'At '+low+'°F this planner still shows adult watts. The housing pages cited here do not set that cutoff or a 250 W size. Maryland Extension does set brooder temperature: 90–95°F the first week, then 5°F less each week, with the lamp at least 18 inches above the floor.'
      : 'Maryland Extension starts brooder chicks at 90–95°F and drops 5°F each week, with the lamp at least 18 inches above the floor. The wattage and the 1 sq ft of vent per 10 sq ft of floor are planning ratios on this site, not figures from that page. Keep the coop dry.')+'</p>'+
    '<p class="affil-note small">Coop thermostats, red brooder bulbs, and vent covers on Amazon: <a href="https://www.amazon.com/s?k=chicken+coop+heat+lamp+thermostat&tag=generatorsi0d-20" rel="sponsored nofollow noopener" target="_blank">heat lamps on Amazon</a> · <a href="https://www.amazon.com/s?k=red+brooder+bulb&tag=generatorsi0d-20" rel="sponsored nofollow noopener" target="_blank">red bulbs on Amazon</a> · <a href="https://www.amazon.com/s?k=chicken+coop+vent+cover&tag=generatorsi0d-20" rel="sponsored nofollow noopener" target="_blank">vent covers on Amazon</a></p>';
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", function(){
  // nothing dynamic to prefill; all inputs have sane defaults in markup
});
