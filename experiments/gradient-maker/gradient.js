(function () {
  "use strict";

  var preview = document.getElementById("preview");
  var colorStart = document.getElementById("color-start");
  var colorEnd = document.getElementById("color-end");
  var hexStart = document.getElementById("hex-start");
  var hexEnd = document.getElementById("hex-end");
  var angleRange = document.getElementById("angle-range");
  var angleValue = document.getElementById("angle-value");
  var cssOutput = document.getElementById("css-output");
  var angleChips = document.querySelectorAll("[data-angle]");
  var swapBtn = document.getElementById("swap-btn");
  var randomBtn = document.getElementById("random-btn");
  var copyBtn = document.getElementById("copy-btn");
  var statusOk = document.getElementById("status-ok");

  var okTimer = null;

  function normalizeHex(value) {
    var raw = String(value || "").trim().replace(/^#/, "");
    if (!/^[0-9a-fA-F]{3}$/.test(raw) && !/^[0-9a-fA-F]{6}$/.test(raw)) return null;
    if (raw.length === 3) {
      raw = raw
        .split("")
        .map(function (c) {
          return c + c;
        })
        .join("");
    }
    return "#" + raw.toUpperCase();
  }

  function randomHex() {
    var n = Math.floor(Math.random() * 0xffffff);
    return "#" + n.toString(16).padStart(6, "0").toUpperCase();
  }

  function buildGradient(angle, start, end) {
    return "linear-gradient(" + angle + "deg, " + start + " 0%, " + end + " 100%)";
  }

  function buildCss(angle, start, end) {
    return "background: " + buildGradient(angle, start, end) + ";";
  }

  function setActiveChip(angle) {
    angleChips.forEach(function (chip) {
      chip.classList.toggle("active", Number(chip.getAttribute("data-angle")) === angle);
    });
  }

  function updateFromState() {
    var angle = Number(angleRange.value);
    var start = normalizeHex(hexStart.value) || colorStart.value.toUpperCase();
    var end = normalizeHex(hexEnd.value) || colorEnd.value.toUpperCase();

    hexStart.value = start;
    hexEnd.value = end;
    colorStart.value = start;
    colorEnd.value = end;

    angleValue.textContent = angle + "°";
    var gradient = buildGradient(angle, start, end);
    preview.style.background = gradient;
    cssOutput.value = buildCss(angle, start, end);
  }

  function syncHexFromPicker(which) {
    if (which === "start") hexStart.value = colorStart.value.toUpperCase();
    if (which === "end") hexEnd.value = colorEnd.value.toUpperCase();
    updateFromState();
  }

  function syncPickerFromHex(which) {
    var hex = normalizeHex(which === "start" ? hexStart.value : hexEnd.value);
    if (!hex) return;
    if (which === "start") {
      hexStart.value = hex;
      colorStart.value = hex;
    } else {
      hexEnd.value = hex;
      colorEnd.value = hex;
    }
    updateFromState();
  }

  function showOk() {
    statusOk.hidden = false;
    clearTimeout(okTimer);
    okTimer = setTimeout(function () {
      statusOk.hidden = true;
    }, 1800);
  }

  colorStart.addEventListener("input", function () {
    syncHexFromPicker("start");
  });
  colorEnd.addEventListener("input", function () {
    syncHexFromPicker("end");
  });
  hexStart.addEventListener("change", function () {
    syncPickerFromHex("start");
  });
  hexEnd.addEventListener("change", function () {
    syncPickerFromHex("end");
  });
  hexStart.addEventListener("blur", function () {
    syncPickerFromHex("start");
  });
  hexEnd.addEventListener("blur", function () {
    syncPickerFromHex("end");
  });

  angleRange.addEventListener("input", function () {
    setActiveChip(Number(angleRange.value));
    updateFromState();
  });

  angleChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var angle = Number(chip.getAttribute("data-angle"));
      angleRange.value = String(angle);
      setActiveChip(angle);
      updateFromState();
    });
  });

  swapBtn.addEventListener("click", function () {
    var temp = hexStart.value;
    hexStart.value = hexEnd.value;
    hexEnd.value = temp;
    colorStart.value = hexStart.value;
    colorEnd.value = hexEnd.value;
    updateFromState();
  });

  randomBtn.addEventListener("click", function () {
    hexStart.value = randomHex();
    hexEnd.value = randomHex();
    angleRange.value = String(Math.floor(Math.random() * 361));
    colorStart.value = hexStart.value;
    colorEnd.value = hexEnd.value;
    setActiveChip(Number(angleRange.value));
    updateFromState();
  });

  copyBtn.addEventListener("click", function () {
    var text = cssOutput.value;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showOk);
      return;
    }
    cssOutput.select();
    document.execCommand("copy");
    showOk();
  });

  updateFromState();
})();
