# ChickenCoopCalc.com — Launch Checklist

Site files: `HermesVault/40-Content/sites/chickencoopcalc/`
Sister sites: generatorsizer, solarsizer, weldingcalc, battery-bank-sizer (all github.io, interlinked).

## 1. Hosting — GitHub Pages ($0)
- [x] Repo `jpanasuk-netizen/chickencoopcalc` (public), site pushed to `main`
- [ ] Settings → Pages → Deploy from branch: `main` / root → confirm green URL
- [ ] Mirror to Hugging Face Space `jpanasuk/chickencoopcalc` (sdk: static)

## 2. Search Console
- [ ] Verify via HTML file on the github.io URL
- [ ] Submit `sitemap.xml`
- [ ] URL Inspection → Request indexing on all 4 pages
- [ ] Week 2: Bing Webmaster Tools (imports GSC property)

## 3. Affiliate programs (apply BEFORE adding real links)
- [ ] Amazon Associates — prefab coops, feeders, brooder kits, heat lamps with thermostat
- [ ] Chewy affiliate — feed (50 lb bags), bedding, supplements (Chewy carries farm feed)
- [ ] Later: AdSense once organic traffic exists (~20+ sessions/day)

## 4. Distribution (2-engine model)
- [ ] r/BackYardChickens, r/chickens, r/homestead: answer 2–3 coop-size/feed-cost threads per week; link calculator only when it answers the question
- [ ] BackYardChickens.com forum: sizing threads
- [ ] Cross-link check: sister sites point back here (reciprocal, not orphan)

## 5. Post-launch QA
- [x] All 4 calculators smoke-tested headlessly (node + DOM stub): coop 6 std → 24/60 sq ft ✓, feed 6×12wk@$22 → 46 lb/$20.09/14¢ egg ✓, nests 12 → 4 ✓, heat 24sqft@10°F → 400W + 2.5 sq ft vent ✓
- [ ] Mobile check at 375px (row2 collapses to 1fr)
- [ ] Rich Results Test: SoftwareApplication + FAQPage
- [ ] Confirm no affiliate links ship before program approval (placeholders marked)
