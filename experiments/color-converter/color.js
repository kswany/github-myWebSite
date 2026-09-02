(function () {
  "use strict";

  var preview = document.getElementById("preview");
  var previewHex = document.getElementById("preview-hex");
  var colorPicker = document.getElementById("color-picker");
  var hexInput = document.getElementById("hex-input");
  var rgbR = document.getElementById("rgb-r");
  var rgbG = document.getElementById("rgb-g");
  var rgbB = document.getElementById("rgb-b");
  var rgbString = document.getElementById("rgb-string");
  var hslH = document.getElementById("hsl-h");
  var hslS = document.getElementById("hsl-s");
  var hslL = document.getElementById("hsl-l");
  var hslString = document.getElementById("hsl-string");
  var outHex = document.getElementById("out-hex");
  var outRgb = document.getElementById("out-rgb");
  var outHsl = document.getElementById("out-hsl");
  var statusErr = document.getElementById("status-err");
  var statusErrText = document.getElementById("status-err-text");
  var statusOk = document.getElementById("status-ok");
  var statusOkText = document.getElementById("status-ok-text");

  var samples = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];
  var updating = false;

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function padHex(n) {
    return n.toString(16).toUpperCase().padStart(2, "0");
  }

  function rgbToHex(r, g, b) {
    return "#" + padHex(r) + padHex(g) + padHex(b);
  }

  function parseHex(raw, allowShort) {
    var s = String(raw || "").trim().replace(/^#/, "");
    if (allowShort && /^[0-9a-fA-F]{3}$/.test(s)) {
      s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    }
    if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
    return {
      r: parseInt(s.slice(0, 2), 16),
      g: parseInt(s.slice(2, 4), 16),
      b: parseInt(s.slice(4, 6), 16),
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var s = 0;
    var l = (max + min) / 2;

    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        default:
          h = (r - g) / d + 4;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  }

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;

    if (s === 0) {
      var gray = Math.round(l * 255);
      return { r: gray, g: gray, b: gray };
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    var hk = h / 360;

    function hue2rgb(t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    return {
      r: Math.round(hue2rgb(hk + 1 / 3) * 255),
      g: Math.round(hue2rgb(hk) * 255),
      b: Math.round(hue2rgb(hk - 1 / 3) * 255),
    };
  }

  function formatRgb(r, g, b) {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }

  function formatHsl(h, s, l) {
    return "hsl(" + h + ", " + s + "%, " + l + "%)";
  }

  function showError(msg) {
    statusOk.hidden = true;
    statusErrText.textContent = msg;
    statusErr.hidden = false;
  }

  function hideError() {
    statusErr.hidden = true;
  }

  function flashOk(text) {
    statusOkText.textContent = text || "복사했습니다.";
    statusOk.hidden = false;
    statusErr.hidden = true;
    window.clearTimeout(flashOk.timer);
    flashOk.timer = window.setTimeout(function () {
      statusOk.hidden = true;
    }, 1800);
  }

  function applyColor(rgb, opts) {
    opts = opts || {};
    var hex = rgbToHex(rgb.r, rgb.g, rgb.b);
    var hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    var rgbText = formatRgb(rgb.r, rgb.g, rgb.b);
    var hslText = formatHsl(hsl.h, hsl.s, hsl.l);

    preview.style.background = hex;
    previewHex.textContent = hex;
    colorPicker.value = hex.toLowerCase();

    if (!opts.keepHexInput) {
      hexInput.value = hex;
    }
    rgbR.value = rgb.r;
    rgbG.value = rgb.g;
    rgbB.value = rgb.b;
    rgbString.textContent = rgbText;
    hslH.value = hsl.h;
    hslS.value = hsl.s;
    hslL.value = hsl.l;
    hslString.textContent = hslText;

    outHex.textContent = hex;
    outRgb.textContent = rgbText;
    outHsl.textContent = hslText;

    hideError();
  }

  function updateFromHex(isFinal) {
    if (updating) return;
    var rgb = parseHex(hexInput.value, isFinal);
    if (!rgb) {
      if (isFinal) {
        showError("HEX는 #RRGGBB 또는 RRGGBB 형식이어야 합니다.");
      } else {
        hideError();
      }
      return;
    }
    updating = true;
    applyColor(rgb, { keepHexInput: !isFinal });
    updating = false;
  }

  function updateFromRgb() {
    if (updating) return;
    var r = clamp(parseInt(rgbR.value, 10) || 0, 0, 255);
    var g = clamp(parseInt(rgbG.value, 10) || 0, 0, 255);
    var b = clamp(parseInt(rgbB.value, 10) || 0, 0, 255);
    updating = true;
    applyColor({ r: r, g: g, b: b });
    updating = false;
  }

  function updateFromHsl() {
    if (updating) return;
    var h = parseInt(hslH.value, 10) || 0;
    var s = clamp(parseInt(hslS.value, 10) || 0, 0, 100);
    var l = clamp(parseInt(hslL.value, 10) || 0, 0, 100);
    updating = true;
    applyColor(hslToRgb(h, s, l));
    updating = false;
  }

  function updateFromPicker() {
    if (updating) return;
    var rgb = parseHex(colorPicker.value, true);
    if (!rgb) return;
    updating = true;
    applyColor(rgb);
    updating = false;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        flashOk("복사했습니다.");
      });
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      flashOk("복사했습니다.");
    } catch (e) {
      showError("복사에 실패했습니다.");
    }
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function setupTabs() {
    var tabs = document.querySelectorAll(".tab");
    var panels = document.querySelectorAll(".tab-panel");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var targetId = tab.getAttribute("aria-controls");
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach(function (panel) {
          var on = panel.id === targetId;
          panel.classList.toggle("active", on);
          panel.hidden = !on;
        });
      });
    });
  }

  hexInput.addEventListener("input", function () {
    updateFromHex(false);
  });
  hexInput.addEventListener("change", function () {
    updateFromHex(true);
  });
  [rgbR, rgbG, rgbB].forEach(function (el) {
    el.addEventListener("input", updateFromRgb);
    el.addEventListener("change", updateFromRgb);
  });
  [hslH, hslS, hslL].forEach(function (el) {
    el.addEventListener("input", updateFromHsl);
    el.addEventListener("change", updateFromHsl);
  });
  colorPicker.addEventListener("input", updateFromPicker);

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var kind = btn.getAttribute("data-copy");
      if (kind === "hex") copyText(outHex.textContent);
      else if (kind === "rgb") copyText(outRgb.textContent);
      else if (kind === "hsl") copyText(outHsl.textContent);
    });
  });

  document.getElementById("sample-btn").addEventListener("click", function () {
    hexInput.value = samples[Math.floor(Math.random() * samples.length)];
    updateFromHex(true);
  });

  document.getElementById("random-btn").addEventListener("click", function () {
    applyColor({
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    });
  });

  setupTabs();
  applyColor(parseHex("#3B82F6", true));
})();
