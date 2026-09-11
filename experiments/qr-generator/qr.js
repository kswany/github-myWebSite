(function () {
  "use strict";

  var size = 240;
  var ecLevel = "M";
  var fgColor = "#1E293B";
  var bgColor = "#FFFFFF";
  var hasQr = false;

  var contentInput = document.getElementById("content");
  var sizeRow = document.querySelector('[aria-label="QR 크기"]');
  var ecRow = document.querySelector('[aria-label="오류 보정 수준"]');
  var fgPicker = document.getElementById("fg-picker");
  var fgHex = document.getElementById("fg-hex");
  var bgPicker = document.getElementById("bg-picker");
  var bgHex = document.getElementById("bg-hex");
  var canvas = document.getElementById("qr-canvas");
  var qrEmpty = document.getElementById("qr-empty");
  var stageKicker = document.getElementById("stage-kicker");
  var statusErr = document.getElementById("status-err");
  var statusErrText = document.getElementById("status-err-text");
  var generateBtn = document.getElementById("generate-btn");
  var downloadBtn = document.getElementById("download-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var ctx = canvas.getContext("2d");

  function hideError() {
    statusErr.hidden = true;
  }

  function showError(message) {
    statusErrText.textContent = message;
    statusErr.hidden = false;
  }

  function normalizeHex(value) {
    var raw = String(value || "").trim();
    if (!raw) return null;
    if (raw.charAt(0) !== "#") raw = "#" + raw;
    if (!/^#[0-9A-Fa-f]{6}$/.test(raw)) return null;
    return raw.toUpperCase();
  }

  function syncColor(picker, hexInput, setter) {
    var fromPicker = normalizeHex(picker.value);
    if (fromPicker) {
      setter(fromPicker);
      hexInput.value = fromPicker;
      picker.value = fromPicker;
      return true;
    }
    var fromText = normalizeHex(hexInput.value);
    if (fromText) {
      setter(fromText);
      hexInput.value = fromText;
      picker.value = fromText;
      return true;
    }
    return false;
  }

  function setFg(value) {
    fgColor = value;
  }

  function setBg(value) {
    bgColor = value;
  }

  function setEmptyState() {
    hasQr = false;
    canvas.hidden = true;
    qrEmpty.hidden = false;
    stageKicker.textContent = "아직 없음";
    downloadBtn.disabled = true;
  }

  function drawQr(text) {
    if (typeof qrcode !== "function") {
      showError("QR 라이브러리를 불러오지 못했습니다.");
      setEmptyState();
      return;
    }

    var fg = normalizeHex(fgColor);
    var bg = normalizeHex(bgColor);
    if (!fg || !bg) {
      showError("올바른 HEX 색 코드를 넣어 주세요.");
      setEmptyState();
      return;
    }

    try {
      var qr = qrcode(0, ecLevel);
      qr.addData(text);
      qr.make();
    } catch (err) {
      showError("내용이 너무 길거나 QR로 만들 수 없습니다.");
      setEmptyState();
      return;
    }

    var moduleCount = qr.getModuleCount();
    var cellSize = Math.max(1, Math.floor(size / moduleCount));
    var drawSize = cellSize * moduleCount;
    var margin = Math.max(0, Math.floor((size - drawSize) / 2));

    canvas.width = size;
    canvas.height = size;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = fg;

    for (var row = 0; row < moduleCount; row += 1) {
      for (var col = 0; col < moduleCount; col += 1) {
        if (qr.isDark(row, col)) {
          ctx.fillRect(margin + col * cellSize, margin + row * cellSize, cellSize, cellSize);
        }
      }
    }

    hasQr = true;
    canvas.hidden = false;
    qrEmpty.hidden = true;
    stageKicker.textContent = moduleCount + "×" + moduleCount + " · " + text.length + "글자";
    downloadBtn.disabled = false;
    hideError();
  }

  function generate() {
    var text = contentInput.value.trim();
    if (!text) {
      showError("내용을 먼저 넣어 주세요.");
      setEmptyState();
      return;
    }

    if (!syncColor(fgPicker, fgHex, setFg) || !syncColor(bgPicker, bgHex, setBg)) {
      showError("올바른 HEX 색 코드를 넣어 주세요.");
      setEmptyState();
      return;
    }

    drawQr(text);
  }

  function downloadPng() {
    if (!hasQr) return;
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var link = document.createElement("a");
      link.href = url;
      link.download = "qr-code.png";
      link.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  sizeRow.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-size]");
    if (!btn) return;
    sizeRow.querySelectorAll(".chip").forEach(function (chip) {
      chip.classList.remove("active");
    });
    btn.classList.add("active");
    size = Number(btn.getAttribute("data-size")) || 240;
    if (contentInput.value.trim()) generate();
  });

  ecRow.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-ec]");
    if (!btn) return;
    ecRow.querySelectorAll(".chip").forEach(function (chip) {
      chip.classList.remove("active");
    });
    btn.classList.add("active");
    ecLevel = btn.getAttribute("data-ec") || "M";
    if (contentInput.value.trim()) generate();
  });

  function bindColor(picker, hexInput, setter) {
    picker.addEventListener("input", function () {
      syncColor(picker, hexInput, setter);
      if (hasQr) generate();
    });
    hexInput.addEventListener("change", function () {
      if (syncColor(picker, hexInput, setter) && hasQr) generate();
    });
    hexInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        if (syncColor(picker, hexInput, setter) && hasQr) generate();
      }
    });
  }

  bindColor(fgPicker, fgHex, setFg);
  bindColor(bgPicker, bgHex, setBg);

  generateBtn.addEventListener("click", generate);

  downloadBtn.addEventListener("click", downloadPng);

  sampleBtn.addEventListener("click", function () {
    contentInput.value = "https://github.com/kswany/github-myWebSite";
    generate();
  });

  contentInput.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      generate();
    }
  });

  setEmptyState();
})();
