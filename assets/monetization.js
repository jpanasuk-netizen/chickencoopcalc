/* Amazon Associates conversion CTA. Tag live. No income claims. */
(function () {
  "use strict";
  var AMAZON_TAG = "generatorsi0d-20";
  function amzUrl(q) {
    return "https://www.amazon.com/s?k=" + encodeURIComponent(q) +
           "&tag=" + encodeURIComponent(AMAZON_TAG);
  }

  function bandFor(kind, rec) {
    rec = Math.max(1, Math.round(rec || 0));
    if (kind === "feed") {
      return { label: "Feeders and storage for your flock",
        q: "chicken treadle feeder", alt: "galvanized metal trash can 32 gallon",
        primary: "Shop feeders on Amazon", secondary: "Storage cans on Amazon" };
    }
    if (kind === "nest") {
      return { label: "Nesting boxes for your hen count",
        q: "chicken nesting box", alt: "ceramic eggs chicken nesting",
        primary: "Shop nesting boxes on Amazon", secondary: "Ceramic eggs on Amazon" };
    }
    if (kind === "heat") {
      return { label: "Winter coop heat gear",
        q: "chicken coop heat lamp thermostat", alt: "red brooder heat bulb",
        primary: "Shop heat gear on Amazon", secondary: "Red bulbs on Amazon" };
    }
    return { label: "Prefab coop for your sq ft need",
      q: "chicken coop walk in", alt: "prefab chicken coop",
      primary: "Shop this coop size on Amazon", secondary: "Prefab coops on Amazon" };
  }

  function fillSticky(url, label) {
    var bar = document.getElementById("amzSticky");
    if (!bar) return;
    var link = document.getElementById("amzStickyLink");
    if (link) {
      link.href = url;
      link.textContent = label || "Shop on Amazon";
      link.setAttribute("rel", "sponsored nofollow noopener");
      link.target = "_blank";
    }
    bar.hidden = false;
    bar.setAttribute("aria-hidden", "false");
  }
  window.dismissAmzSticky = function () {
    var bar = document.getElementById("amzSticky");
    if (bar) { bar.hidden = true; bar.setAttribute("aria-hidden", "true"); }
    try { sessionStorage.setItem("amzStickyDismissed", "1"); } catch (e) {}
  };
  window.updateMatchedCTA = function (rec, kind) {
    kind = kind || "default";
    var box = document.getElementById("matchedCta");
    var band = bandFor(kind, rec);
    var url = amzUrl(band.q);
    var altUrl = amzUrl(band.alt);
    if (box) {
      box.innerHTML =
        '<p class="small"><b>Matched to your result:</b> ' + band.label + '</p>' +
        '<div class="affil-links" style="display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem">' +
        '<a class="btn-amz btn-amz-primary" rel="sponsored nofollow noopener" target="_blank" href="' +
          url + '">' + band.primary + '</a>' +
        '<a class="btn-amz" rel="sponsored nofollow noopener" target="_blank" href="' +
          altUrl + '">' + band.secondary + '</a>' +
        '</div>';
      box.hidden = false;
    }
    try {
      if (sessionStorage.getItem("amzStickyDismissed") !== "1") fillSticky(url, band.primary);
    } catch (e) { fillSticky(url, band.primary); }
  };
})();
