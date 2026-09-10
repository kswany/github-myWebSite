(function () {
  "use strict";

  var preview = document.getElementById("preview");
  var scorePanel = document.getElementById("score-panel");
  var ratioValue = document.getElementById("ratio-value");
  var ratioLabel = document.getElementById("ratio-label");
  var gaugeFill = document.getElementById("gauge-fill");
  var fgPicker = document.getElementById("fg-picker");
  var bgPicker = document.getElementById("bg-picker");
  var fgHex = document.getElementById("fg-hex");
  var bgHex = document.getElementById("bg-hex");
  var statusErr = document.getElementById("status-err");
  var statusErrText = document.getElementById("status-err-text");

  var checks = {
    aaNormal: document.getElementById("check-aa-normal"),
    aaLarge: document.getElementById("check-aa-large"),
    aaaNormal: document.getElementById("check-aaa-normal"),
    aaaLarge: document.getElementById("check-aaa-large"),
  };

  var samples = [
    { fg: "#1E293B", bg: "#F9FAFB" },
    { fg: "#FFFFFF", bg: "#2563EB" },
    { fg: "#111827", bg: "#FDE68A" },
    { fg: "#F8FAFC", bg: "#0F172A" },
    { fg: "#047857", bg: "#ECFDF5" },
  ];

  function parseHex(raw) {
    var s = String(raw || "").trim().replace(/^#/, "");
    if (/^[0-9a-fA-F]{3}$/.test(s)) {
      s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
    };
  }

  function toHex(rgb) {
    function pad(n) {
      return n.toString(16).toUpperCase().padStart(2, "0");
    }
    return "#" + pad(rgb.r) + pad(rgb.g) + pad(rgb.b);
  }

  function channelLuminance(c) {
    var v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  }

  function relativeLuminance(rgb) {
    var r = channelLuminance(rgb.r);
    var g = channelLuminance(rgb.g);
    var b = channelLuminance(rgb.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function contrastRatio(fg, bg) {
    var l1 = relativeLuminance(fg);
    var l2 = relativeLuminance(bg);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function formatRatio(ratio) {
    return ratio.toFixed(2) + ":1";
  }

  function ratioLabelText(ratio) {
    if (ratio >= 7) return "매우 선명해요 — AAA 수준";
    if (ratio >= 4.5) return "읽기 좋아요 — AA 수준";
    if (ratio >= 3) return "큰 글만 괜찮아요";
    return "대비가 약해요 — 색을 바꿔 보세요";
  }

  function scoreClass(ratio) {
    if (ratio >= 4.5) return "pass";
    if (ratio >= 3) return "warn";
    return "fail";
  }

  function gaugeWidth(ratio) {
    var pct = ((ratio - 1) / (21 - 1)) * 100;
    return Math.min(100, Math.max(0, pct));
  }

  function setCheck(card, pass, waiting) {
    card.classList.remove("pass", "fail");
    var result = card.querySelector(".check-result");
    if (waiting) {
      result.textContent = "—";
      return;
    }
    card.classList.add(pass ? "pass" : "fail");
    result.textContent = pass ? "통과" : "미달";
  }

  function showError(msg) {
    statusErr.hidden = false;
    statusErrText.textContent = msg;
    scorePanel.className = "score-panel";
    ratioValue.textContent = "—";
    ratioLabel.textContent = "올바른 색 코드를 넣어 주세요";
    gaugeFill.style.width = "0%";
    Object.keys(checks).forEach(function (key) {
      setCheck(checks[key], false, true);
    });
  }

  function hideError() {
    statusErr.hidden = true;
  }

  function syncFromPickers() {
    fgHex.value = fgPicker.value.toUpperCase();
    bgHex.value = bgPicker.value.toUpperCase();
    update();
  }

  function syncFromHex() {
    var fg = parseHex(fgHex.value);
    var bg = parseHex(bgHex.value);
    if (!fg || !bg) {
      showError("HEX는 #RRGGBB 형식이어야 합니다.");
      return;
    }
    fgPicker.value = toHex(fg);
    bgPicker.value = toHex(bg);
    fgHex.value = toHex(fg);
    bgHex.value = toHex(bg);
    update();
  }

  function update() {
    var fg = parseHex(fgHex.value);
    var bg = parseHex(bgHex.value);
    if (!fg || !bg) {
      showError("HEX는 #RRGGBB 형식이어야 합니다.");
      return;
    }

    hideError();

    var fgColor = toHex(fg);
    var bgColor = toHex(bg);
    var ratio = contrastRatio(fg, bg);

    preview.style.background = bgColor;
    preview.style.color = fgColor;

    scorePanel.className = "score-panel " + scoreClass(ratio);
    ratioValue.textContent = formatRatio(ratio);
    ratioLabel.textContent = ratioLabelText(ratio);
    gaugeFill.style.width = gaugeWidth(ratio) + "%";

    setCheck(checks.aaNormal, ratio >= 4.5, false);
    setCheck(checks.aaLarge, ratio >= 3, false);
    setCheck(checks.aaaNormal, ratio >= 7, false);
    setCheck(checks.aaaLarge, ratio >= 4.5, false);
  }

  function swapColors() {
    var tempPicker = fgPicker.value;
    fgPicker.value = bgPicker.value;
    bgPicker.value = tempPicker;
    syncFromPickers();
  }

  function randomColor() {
    var n = Math.floor(Math.random() * 0xffffff);
    return "#" + n.toString(16).toUpperCase().padStart(6, "0");
  }

  function applySample(index) {
    var sample = samples[index % samples.length];
    fgPicker.value = sample.fg;
    bgPicker.value = sample.bg;
    syncFromPickers();
  }

  fgPicker.addEventListener("input", syncFromPickers);
  bgPicker.addEventListener("input", syncFromPickers);
  fgHex.addEventListener("change", syncFromHex);
  bgHex.addEventListener("change", syncFromHex);
  fgHex.addEventListener("keydown", function (e) {
    if (e.key === "Enter") syncFromHex();
  });
  bgHex.addEventListener("keydown", function (e) {
    if (e.key === "Enter") syncFromHex();
  });

  document.getElementById("swap-btn").addEventListener("click", swapColors);
  document.getElementById("sample-btn").addEventListener("click", function () {
    applySample(Math.floor(Math.random() * samples.length));
  });
  document.getElementById("random-btn").addEventListener("click", function () {
    fgPicker.value = randomColor();
    bgPicker.value = randomColor();
    syncFromPickers();
  });

  syncFromPickers();
})();
