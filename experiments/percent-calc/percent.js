(function () {
  function parseNum(raw) {
    if (raw === "" || raw == null) return null;
    var n = Number(String(raw).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  }

  function fmt(n, digits) {
    if (digits === undefined) digits = 2;
    return n.toLocaleString("ko-KR", {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0,
    });
  }

  function fmtPct(n) {
    var sign = n > 0 ? "+" : "";
    return sign + fmt(n, 2) + "%";
  }

  function setResult(card, kicker, main, sub, tone) {
    card.classList.remove("up", "down");
    if (tone) card.classList.add(tone);
    card.querySelector(".result-kicker").textContent = kicker;
    card.querySelector(".result-main").textContent = main;
    card.querySelector(".result-sub").textContent = sub;
  }

  function initTabs() {
    var tabs = document.querySelectorAll(".tab-bar .tab");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("aria-controls");
        tabs.forEach(function (t) {
          t.classList.toggle("active", t === tab);
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        document.querySelectorAll(".tab-panel").forEach(function (p) {
          var on = p.id === id;
          p.classList.toggle("active", on);
          p.hidden = !on;
        });
      });
    });
  }

  function bindRatio() {
    var a = document.getElementById("ratio-a");
    var b = document.getElementById("ratio-b");
    var card = document.getElementById("ratio-result");

    function run() {
      var va = parseNum(a.value);
      var vb = parseNum(b.value);
      if (va == null || vb == null) {
        setResult(card, "숫자를 넣으세요", "-", "A와 B를 모두 입력하면 비율이 나옵니다.", null);
        return;
      }
      if (vb === 0) {
        setResult(card, "기준값 오류", "-", "B(기준)는 0이 될 수 없습니다.", null);
        return;
      }
      var pct = (va / vb) * 100;
      setResult(
        card,
        "A는 B의",
        fmt(pct, 2) + "%",
        fmt(va) + " ÷ " + fmt(vb) + " × 100",
        null
      );
    }

    a.addEventListener("input", run);
    b.addEventListener("input", run);
    run();
  }

  function bindChange() {
    var before = document.getElementById("change-before");
    var after = document.getElementById("change-after");
    var card = document.getElementById("change-result");

    function run() {
      var vb = parseNum(before.value);
      var va = parseNum(after.value);
      if (vb == null || va == null) {
        setResult(card, "숫자를 넣으세요", "-", "이전값과 이후값을 넣으면 증감률이 나옵니다.", null);
        return;
      }
      if (vb === 0) {
        setResult(card, "이전값 오류", "-", "이전값이 0이면 증감률을 계산할 수 없습니다.", null);
        return;
      }
      var diff = va - vb;
      var pct = (diff / Math.abs(vb)) * 100;
      var tone = diff > 0 ? "up" : diff < 0 ? "down" : null;
      var word = diff > 0 ? "증가" : diff < 0 ? "감소" : "변화 없음";
      setResult(
        card,
        word,
        fmtPct(pct),
        "차이 " + fmt(diff) + " (" + fmt(vb) + " → " + fmt(va) + ")",
        tone
      );
    }

    before.addEventListener("input", run);
    after.addEventListener("input", run);
    run();
  }

  function bindPart() {
    var base = document.getElementById("part-base");
    var pct = document.getElementById("part-pct");
    var card = document.getElementById("part-result");
    var presets = document.getElementById("part-presets");

    function run() {
      var vb = parseNum(base.value);
      var vp = parseNum(pct.value);
      if (vb == null || vp == null) {
        setResult(card, "숫자를 넣으세요", "-", "기준값과 퍼센트를 넣으면 결과가 나옵니다.", null);
        return;
      }
      var value = (vb * vp) / 100;
      setResult(
        card,
        "계산 결과",
        fmt(value),
        fmt(vb) + "의 " + fmt(vp, 1) + "%",
        null
      );
    }

    base.addEventListener("input", run);
    pct.addEventListener("input", run);
    if (presets) {
      presets.querySelectorAll(".preset-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          pct.value = btn.getAttribute("data-pct");
          run();
        });
      });
    }
    run();
  }

  initTabs();
  bindRatio();
  bindChange();
  bindPart();
})();
