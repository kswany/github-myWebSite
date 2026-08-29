(function () {
  "use strict";

  var LENGTH = [
    { id: "m", label: "미터 (m)", toBase: 1 },
    { id: "km", label: "킬로미터 (km)", toBase: 1000 },
    { id: "cm", label: "센티미터 (cm)", toBase: 0.01 },
    { id: "mm", label: "밀리미터 (mm)", toBase: 0.001 },
    { id: "in", label: "인치 (in)", toBase: 0.0254 },
    { id: "ft", label: "피트 (ft)", toBase: 0.3048 },
    { id: "yd", label: "야드 (yd)", toBase: 0.9144 },
    { id: "mi", label: "마일 (mi)", toBase: 1609.344 },
  ];

  var WEIGHT = [
    { id: "kg", label: "킬로그램 (kg)", toBase: 1 },
    { id: "g", label: "그램 (g)", toBase: 0.001 },
    { id: "lb", label: "파운드 (lb)", toBase: 0.45359237 },
    { id: "oz", label: "온스 (oz)", toBase: 0.028349523125 },
  ];

  var TEMP = [
    { id: "c", label: "섭씨 (°C)" },
    { id: "f", label: "화씨 (°F)" },
    { id: "k", label: "켈빈 (K)" },
  ];

  function fillSelect(select, items) {
    select.innerHTML = "";
    items.forEach(function (item) {
      var opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent = item.label;
      select.appendChild(opt);
    });
  }

  function findUnit(list, id) {
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return list[0];
  }

  function formatNumber(n) {
    if (!isFinite(n)) return "-";
    var abs = Math.abs(n);
    if (abs === 0) return "0";
    if (abs >= 1e9 || (abs > 0 && abs < 1e-6)) return n.toExponential(4);
    var rounded = Math.round(n * 1e8) / 1e8;
    return rounded.toLocaleString("ko-KR", { maximumFractionDigits: 8 });
  }

  function convertLinear(value, fromUnit, toUnit) {
    var base = value * fromUnit.toBase;
    return base / toUnit.toBase;
  }

  function toCelsius(value, fromId) {
    if (fromId === "c") return value;
    if (fromId === "f") return ((value - 32) * 5) / 9;
    return value - 273.15;
  }

  function fromCelsius(celsius, toId) {
    if (toId === "c") return celsius;
    if (toId === "f") return (celsius * 9) / 5 + 32;
    return celsius + 273.15;
  }

  function convertTemp(value, fromId, toId) {
    return fromCelsius(toCelsius(value, fromId), toId);
  }

  function setupTab(tabIds, panelIds) {
    tabIds.forEach(function (tabId, index) {
      var tab = document.getElementById(tabId);
      var panel = document.getElementById(panelIds[index]);
      tab.addEventListener("click", function () {
        tabIds.forEach(function (id, i) {
          var t = document.getElementById(id);
          var p = document.getElementById(panelIds[i]);
          var active = i === index;
          t.classList.toggle("active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
          p.classList.toggle("active", active);
          p.hidden = !active;
        });
      });
    });
  }

  function setupLinearConverter(config) {
    var valueEl = document.getElementById(config.valueId);
    var fromEl = document.getElementById(config.fromId);
    var toEl = document.getElementById(config.toId);
    var swapEl = document.getElementById(config.swapId);
    var mainEl = document.getElementById(config.mainId);
    var subEl = document.getElementById(config.subId);

    fillSelect(fromEl, config.units);
    fillSelect(toEl, config.units);
    fromEl.value = config.defaultFrom;
    toEl.value = config.defaultTo;

    function update() {
      var raw = valueEl.value.trim();
      if (raw === "") {
        mainEl.textContent = "-";
        subEl.textContent = "숫자를 넣으면 바로 계산합니다.";
        return;
      }

      var value = Number(raw);
      if (!isFinite(value)) {
        mainEl.textContent = "입력 오류";
        subEl.textContent = "올바른 숫자를 넣어 주세요.";
        return;
      }

      var fromUnit = findUnit(config.units, fromEl.value);
      var toUnit = findUnit(config.units, toEl.value);
      var result = convertLinear(value, fromUnit, toUnit);

      mainEl.textContent = formatNumber(result) + " " + toUnit.label.split(" (")[1].replace(")", "");
      subEl.textContent =
        formatNumber(value) +
        " " +
        fromUnit.label.split(" (")[1].replace(")", "") +
        " = " +
        formatNumber(result) +
        " " +
        toUnit.label.split(" (")[1].replace(")", "");
    }

    swapEl.addEventListener("click", function () {
      var tmp = fromEl.value;
      fromEl.value = toEl.value;
      toEl.value = tmp;
      update();
    });

    valueEl.addEventListener("input", update);
    fromEl.addEventListener("change", update);
    toEl.addEventListener("change", update);
    update();
  }

  function setupTempConverter() {
    var valueEl = document.getElementById("temp-value");
    var fromEl = document.getElementById("temp-from");
    var toEl = document.getElementById("temp-to");
    var swapEl = document.getElementById("temp-swap");
    var mainEl = document.getElementById("temp-main");
    var subEl = document.getElementById("temp-sub");

    fillSelect(fromEl, TEMP);
    fillSelect(toEl, TEMP);
    fromEl.value = "c";
    toEl.value = "f";

    function unitSuffix(id) {
      if (id === "c") return "°C";
      if (id === "f") return "°F";
      return "K";
    }

    function update() {
      var raw = valueEl.value.trim();
      if (raw === "") {
        mainEl.textContent = "-";
        subEl.textContent = "숫자를 넣으면 바로 계산합니다.";
        return;
      }

      var value = Number(raw);
      if (!isFinite(value)) {
        mainEl.textContent = "입력 오류";
        subEl.textContent = "올바른 숫자를 넣어 주세요.";
        return;
      }

      var fromId = fromEl.value;
      var toId = toEl.value;
      var result = convertTemp(value, fromId, toId);

      mainEl.textContent = formatNumber(result) + " " + unitSuffix(toId);
      subEl.textContent =
        formatNumber(value) +
        " " +
        unitSuffix(fromId) +
        " = " +
        formatNumber(result) +
        " " +
        unitSuffix(toId);
    }

    swapEl.addEventListener("click", function () {
      var tmp = fromEl.value;
      fromEl.value = toEl.value;
      toEl.value = tmp;
      update();
    });

    valueEl.addEventListener("input", update);
    fromEl.addEventListener("change", update);
    toEl.addEventListener("change", update);
    update();
  }

  setupTab(["tab-length", "tab-weight", "tab-temp"], ["panel-length", "panel-weight", "panel-temp"]);

  setupLinearConverter({
    valueId: "length-value",
    fromId: "length-from",
    toId: "length-to",
    swapId: "length-swap",
    mainId: "length-main",
    subId: "length-sub",
    units: LENGTH,
    defaultFrom: "m",
    defaultTo: "cm",
  });

  setupLinearConverter({
    valueId: "weight-value",
    fromId: "weight-from",
    toId: "weight-to",
    swapId: "weight-swap",
    mainId: "weight-main",
    subId: "weight-sub",
    units: WEIGHT,
    defaultFrom: "kg",
    defaultTo: "lb",
  });

  setupTempConverter();
})();
