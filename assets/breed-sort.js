(function () {
  var table = document.getElementById("breed-table");
  if (!table || !table.tBodies.length) return;
  var tbody = table.tBodies[0];
  var buttons = table.querySelectorAll("thead button");
  buttons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var idx = Number(btn.getAttribute("data-col"));
      var type = btn.getAttribute("data-type");
      var dir = btn.getAttribute("data-dir") === "asc" ? "desc" : "asc";
      buttons.forEach(function (b) { b.removeAttribute("data-dir"); });
      btn.setAttribute("data-dir", dir);
      var rows = Array.prototype.slice.call(tbody.rows);
      rows.sort(function (a, b) {
        var av = a.cells[idx].getAttribute("data-sort-value") || a.cells[idx].textContent.trim();
        var bv = b.cells[idx].getAttribute("data-sort-value") || b.cells[idx].textContent.trim();
        if (type === "num") {
          var an = parseFloat(av);
          var bn = parseFloat(bv);
          if (isNaN(an)) an = dir === "asc" ? Infinity : -Infinity;
          if (isNaN(bn)) bn = dir === "asc" ? Infinity : -Infinity;
          return dir === "asc" ? an - bn : bn - an;
        }
        var c = String(av).localeCompare(String(bv), "en", { sensitivity: "base" });
        return dir === "asc" ? c : -c;
      });
      rows.forEach(function (row) { tbody.appendChild(row); });
    });
  });
})();
