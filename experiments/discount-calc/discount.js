(function () {
  function parseNum(raw) {
    if (raw === "" || raw == null) return null;
    var n = Number(String(raw).replace(/,/g, "").trim());
    return Number.isFinite(n) ? n : null;
  }

  function fmtWon(n) {
    return Math.round(n).toLocaleString("ko-KR") + "원";
  }

  function fmtPct(n) {
    return n.toLocaleString("ko-KR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }) + "%";
  }

  function setCard(card, kicker, main, sub) {
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

  function bindForward() {
    var original = document.getElementById("fwd-original");
    var pct = document.getElementById("fwd-pct");
    var pay = document.getElementById("fwd-pay");
    var save = document.getElementById("fwd-save");
    var presets = document.getElementById("fwd-presets");

    function run() {
      var price = parseNum(original.value);
      var rate = parseNum(pct.value);
      if (price == null || rate == null) {
        setCard(pay, "결제 금액", "-", "정가와 할인율을 넣으세요.");
        setCard(save, "절약", "-", "할인으로 아낀 금액입니다.");
        return;
      }
      if (price < 0) {
        setCard(pay, "입력 오류", "-", "정가는 0 이상이어야 합니다.");
        setCard(save, "절약", "-", "-");
        return;
      }
      if (rate < 0 || rate > 100) {
        setCard(pay, "입력 오류", "-", "할인율은 0~100% 사이로 넣으세요.");
        setCard(save, "절약", "-", "-");
        return;
      }
      var discount = (price * rate) / 100;
      var finalPrice = price - discount;
      setCard(pay, "결제 금액", fmtWon(finalPrice), fmtWon(price) + "에서 " + fmtPct(rate) + " 할인");
      setCard(save, "절약", fmtWon(discount), "정가 대비 " + fmtPct(rate));
    }

    original.addEventListener("input", run);
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

  function bindReverse() {
    var sale = document.getElementById("rev-sale");
    var pct = document.getElementById("rev-pct");
    var card = document.getElementById("rev-result");

    function run() {
      var salePrice = parseNum(sale.value);
      var rate = parseNum(pct.value);
      if (salePrice == null || rate == null) {
        setCard(card, "역산한 정가", "-", "할인가 ÷ (1 − 할인율÷100)");
        return;
      }
      if (salePrice < 0) {
        setCard(card, "입력 오류", "-", "할인가는 0 이상이어야 합니다.");
        return;
      }
      if (rate < 0 || rate >= 100) {
        setCard(card, "입력 오류", "-", "할인율은 0% 이상 100% 미만으로 넣으세요.");
        return;
      }
      var factor = 1 - rate / 100;
      var original = salePrice / factor;
      var saved = original - salePrice;
      setCard(
        card,
        "역산한 정가",
        fmtWon(original),
        "할인가 " + fmtWon(salePrice) + " · 절약 " + fmtWon(saved)
      );
    }

    sale.addEventListener("input", run);
    pct.addEventListener("input", run);
    run();
  }

  function bindRate() {
    var original = document.getElementById("rate-original");
    var sale = document.getElementById("rate-sale");
    var card = document.getElementById("rate-result");

    function run() {
      var price = parseNum(original.value);
      var salePrice = parseNum(sale.value);
      if (price == null || salePrice == null) {
        setCard(card, "할인율", "-", "정가와 할인가를 넣으세요.");
        return;
      }
      if (price <= 0) {
        setCard(card, "입력 오류", "-", "정가는 0보다 커야 합니다.");
        return;
      }
      if (salePrice < 0) {
        setCard(card, "입력 오류", "-", "할인가는 0 이상이어야 합니다.");
        return;
      }
      if (salePrice > price) {
        setCard(card, "할인 없음", "0%", "할인가가 정가보다 큽니다.");
        return;
      }
      var rate = ((price - salePrice) / price) * 100;
      var saved = price - salePrice;
      setCard(
        card,
        "할인율",
        fmtPct(rate),
        fmtWon(price) + " → " + fmtWon(salePrice) + " · 절약 " + fmtWon(saved)
      );
    }

    original.addEventListener("input", run);
    sale.addEventListener("input", run);
    run();
  }

  initTabs();
  bindForward();
  bindReverse();
  bindRate();
})();
