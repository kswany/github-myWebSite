(function () {
  "use strict";

  var tabDday = document.getElementById("tab-dday");
  var tabTip = document.getElementById("tab-tip");
  var panelDday = document.getElementById("panel-dday");
  var panelTip = document.getElementById("panel-tip");

  var ddayDate = document.getElementById("dday-date");
  var ddayLabel = document.getElementById("dday-label");
  var ddayKicker = document.getElementById("dday-kicker");
  var ddayMain = document.getElementById("dday-main");
  var ddaySub = document.getElementById("dday-sub");

  var tipTotal = document.getElementById("tip-total");
  var tipPeople = document.getElementById("tip-people");
  var tipChoices = document.getElementById("tip-choices");
  var tipPer = document.getElementById("tip-per");
  var tipAmount = document.getElementById("tip-amount");
  var tipGrand = document.getElementById("tip-grand");

  var tipRate = 10;

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function todayString() {
    var now = new Date();
    return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function formatWon(n) {
    if (!isFinite(n)) return "-";
    return Math.round(n).toLocaleString("ko-KR") + "원";
  }

  function switchTab(which) {
    var isDday = which === "dday";
    tabDday.classList.toggle("active", isDday);
    tabTip.classList.toggle("active", !isDday);
    tabDday.setAttribute("aria-selected", isDday ? "true" : "false");
    tabTip.setAttribute("aria-selected", isDday ? "false" : "true");
    panelDday.classList.toggle("active", isDday);
    panelTip.classList.toggle("active", !isDday);
    panelDday.hidden = !isDday;
    panelTip.hidden = isDday;
  }

  function updateDday() {
    var value = ddayDate.value;
    if (!value) {
      ddayKicker.textContent = "날짜를 고르세요";
      ddayMain.textContent = "-";
      ddaySub.textContent = "오늘 날짜를 기준으로 계산합니다.";
      return;
    }

    var target = startOfDay(new Date(value + "T00:00:00"));
    var today = startOfDay(new Date());
    var diff = Math.round((target - today) / 86400000);
    var name = ddayLabel.value.trim();
    var prefix = name ? name + "까지 " : "";

    if (diff === 0) {
      ddayKicker.textContent = "오늘";
      ddayMain.textContent = "D-Day";
      ddaySub.textContent = prefix + "바로 그날입니다.";
      return;
    }

    if (diff > 0) {
      ddayKicker.textContent = prefix + "남은 날";
      ddayMain.textContent = "D-" + diff;
      ddaySub.textContent = target.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      });
      return;
    }

    ddayKicker.textContent = prefix + "지난 날";
    ddayMain.textContent = "D+" + Math.abs(diff);
    ddaySub.textContent =
      target.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "short",
      }) + "부터 " + Math.abs(diff) + "일 지났습니다.";
  }

  function updateTip() {
    var total = Number(tipTotal.value);
    var people = Number(tipPeople.value);

    if (!total || total <= 0 || !people || people < 1) {
      tipPer.textContent = "-";
      tipAmount.textContent = "-";
      tipGrand.textContent = "-";
      return;
    }

    var tip = total * (tipRate / 100);
    var grand = total + tip;
    var per = grand / people;

    tipPer.textContent = formatWon(per);
    tipAmount.textContent = formatWon(tip);
    tipGrand.textContent = formatWon(grand);
  }

  tabDday.addEventListener("click", function () {
    switchTab("dday");
  });

  tabTip.addEventListener("click", function () {
    switchTab("tip");
  });

  ddayDate.addEventListener("input", updateDday);
  ddayLabel.addEventListener("input", updateDday);

  tipTotal.addEventListener("input", updateTip);
  tipPeople.addEventListener("input", updateTip);

  tipChoices.addEventListener("click", function (event) {
    var btn = event.target.closest(".tip-chip");
    if (!btn) return;
    tipRate = Number(btn.getAttribute("data-tip"));
    tipChoices.querySelectorAll(".tip-chip").forEach(function (chip) {
      chip.classList.toggle("active", chip === btn);
    });
    updateTip();
  });

  ddayDate.value = todayString();
  updateDday();
  updateTip();
})();
