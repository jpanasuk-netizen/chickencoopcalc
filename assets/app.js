/* ChickenCoopCalc calculators — vanilla JS, no dependencies.
   Standards used (published extension-service guidance, rounded conservatively):
   - Coop space: 4 sq ft per standard bird indoors, 2 sq ft for bantams (State extension services, e.g. MSU/UC Davis)
   - Run space: 10 sq ft per standard bird outdoors, 8 sq ft for bantams
   - Nesting boxes: 1 box per 3–4 hens (standard flock guidance)
   - Feed: ~1/4 lb per standard hen per day at 16% layer feed; ~20% more in freezing weather
   - Heat lamps: red bulb, sized roughly 250 W per 4×4 ft coop area for chick brooding; adults rarely need heat
   - Ventilation: ~1 sq ft of high vent opening per 10 sq ft of coop floor
   All estimates rounded UP to be safe. Pure functions take a DOM-free "inputs" object so they are testable with a stub. */
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
  // 1 box per 3–4 hens → conservative: 1 per 3 (fewer disputes). Communal roll-out nests allow 1 per 5.
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
  // Brooder target: 95°F week 1, dropping 5°F/week. Rough rule: 250 W bulb per 4×4 ft (16 sq ft).
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
  box.innerHTML = '<div class="big">'+fmt(r.coopSqFt)+' <span class="unit">sq ft coop · '+fmt(r.runSqFt)+' sq ft run</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+fmt(r.coopSqFt)+' sq ft</b><span>Coop interior ('+r.perBirdCoop+' sq ft/bird, '+breed+')</span></div>'+
      '<div class="stat"><b>'+fmt(r.runSqFt)+' sq ft</b><span>Outdoor run ('+r.perBirdRun+' sq ft/bird)</span></div>'+
      '<div class="stat"><b>'+r.coopFootprint+'</b><span>Example coop footprint</span></div>'+
      '<div class="stat"><b>'+r.runFootprint+'</b><span>Example run footprint</span></div>'+
    '</div>'+
    '<p class="note">Based on the widely published 4 sq ft indoors + 10 sq ft of run per standard bird (2 + 8 for bantams). Cramped birds peck each other — when in doubt, build bigger than the minimum. Free-ranging birds can use less run, but predators disagree with that plan.</p>'+
    nestLine(r, birds);
}

function nestLine(coop, birds){
  var nb = calcNestBoxes(birds, "standard");
  return '<p class="note">Flock needs about <strong>'+nb.boxes+' nesting box'+(nb.boxes===1?'':'es')+'</strong> (1 per 3–4 hens) and roughly <strong>'+fmt(birds*0.25)+' lb of feed per day</strong> — check the feed tab.</p>';
}

/* 2. Feed calculator */
function runFeedCalc(){
  var birds = readNum("fdBirds", 0);
  if(!birds){ alert("Enter your bird count."); return; }
  var weeks = readNum("fdWeeks", 12);
  var price = readNum("fdPrice", 22);
  var r = calcFeed(birds, weeks, price);
  var box = el("fdResult"); box.hidden = false;
  box.innerHTML = '<div class="big">'+fmt(r.lbMonth)+' <span class="unit">lb of feed per month · ~$'+r.monthlyCost.toFixed(2)+'</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+r.lbPerDay+' lb</b><span>Feed per day ('+birds+' hens × ¼ lb)</span></div>'+
      '<div class="stat"><b>'+r.bagsMonth+'</b><span>50 lb bags per month</span></div>'+
      '<div class="stat"><b>~'+r.perEggCostCents+'¢</b><span>Feed cost per egg (80% lay rate)</span></div>'+
      '<div class="stat"><b>'+fmt(r.totalLb)+' lb</b><span>For '+weeks+' weeks (~$'+r.totalCost.toFixed(2)+')</span></div>'+
    '</div>'+
    '<p class="note">Figure is 16% layer pellets for standard hens — bantams eat ~40% less, meat birds considerably more. In freezing weather hens eat ~20% more to stay warm. Scratch grains are a treat, not feed: under 10% of the diet. Free-range forage might trim 10% off in summer, near nothing in winter.</p>';
}

/* 3. Nesting boxes */
function runNestCalc(){
  var hens = readNum("nbHens", 0);
  if(!hens){ alert("Enter how many hens you have."); return; }
  var style = el("nbStyle").value;                   // standard | communal
  var r = calcNestBoxes(hens, style);
  var box = el("nbResult"); box.hidden = false;
  box.innerHTML = '<div class="big">'+r.boxes+' <span class="unit">nesting box'+(r.boxes===1?'':'es')+'</span></div>'+
    '<div class="grid2">'+
      '<div class="stat"><b>'+r.boxes+(r.boxesMax>r.boxes ? '–'+r.boxesMax : '')+'</b><span>Boxes to build (1 per '+(style==="communal"?5:"3–4")+')</span></div>'+
      '<div class="stat"><b>12 × 12 × 12</b><span>Box size in inches (standard)</span></div>'+
      '<div class="stat"><b>'+fmt(hens)+'</b><span>Hens sharing them</span></div>'+
      '<div class="stat"><b>Below the roost</b><span>Mount boxes lower than perches — they sleep highest</span></div>'+
    '</div>'+
    '<p class="note">One box per 3–4 hens is the standard guidance; hens fight most over boxes in spring, so the low end (1 per 3) keeps the peace. Communal roll-out nests can serve up to 5 hens each and make egg collection easier — fewer broken and egg-eaten eggs. One box per 2 hens is never wrong if you have the wall space.</p>';
}

/* 4. Heat lamp & winter ventilation */
function runHeatCalc(){
  var sqft = readNum("htSqft", 0);
  if(!sqft){ alert("Enter your coop floor area in sq ft (the coop tab computes it)."); return; }
  var low = readNum("htLow", 32);
  var chicks = el("htChicks").value === "yes";
  var r = calcHeat(sqft, low, chicks);
  var box = el("htResult"); box.hidden = false;
  var heatLine = r.adultNeedsHeat
    ? '<div class="stat"><b>'+r.adultWatts+' W</b><span>Supplemental heat for adults below 20°F (red bulb)</span></div>'
    : '<div class="stat"><b>None</b><span>Adults are fine — '+low+'°F is above the 20°F line</span></div>';
  box.innerHTML = '<div class="big">'+r.ventSqFt+' <span class="unit">sq ft of high ventilation needed</span></div>'+
    '<div class="grid2">'+
      heatLine+
      '<div class="stat"><b>'+(chicks ? r.chickWatts+' W' : '—')+'</b><span>Brooder bulb for chicks (95°F week 1, −5°F/wk)</span></div>'+
      '<div class="stat"><b>High vents only</b><span>Above roost height, out of roost drafts</span></div>'+
      '<div class="stat"><b>Never close it</b><span>Moisture causes frostbite, not cold</span></div>'+
    '</div>'+
    '<p class="note">'+(r.adultNeedsHeat
      ? 'At '+low+'°F lows, hardy breeds still manage without heat if the coop is dry and draft-free — heat lamps cause more coop fires than cold kills chickens. If you do heat, use a red 250 W bulb on a thermostat, secured with a chain, with a-rated cords.'
      : 'Cold kills chickens far less often than damp air does. Keep high vents open all winter; block only low drafts at roost level. A 250 W red heat lamp is for brooders (95°F the first week, dropping 5°F weekly to feather-out around week 6) — secure it with chain and keep flammable bedding 18+ inches away.')+'</p>'+
    '<p class="affil-note small">Coop thermostats, red brooder bulbs, and vent covers on Amazon: <!-- AFFILIATE SLOT: Amazon Associates — heat lamps, thermostat controllers, vent covers --></p>';
}

/* ---------- init ---------- */
document.addEventListener("DOMContentLoaded", function(){
  // nothing dynamic to prefill; all inputs have sane defaults in markup
});
