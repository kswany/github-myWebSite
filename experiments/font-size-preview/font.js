(function () {
  "use strict";

  var BASE_PX = 16;
  var FONT_FAMILY = 'Pretendard, "Apple SD Gothic Neo", sans-serif';

  var fontPx = document.getElementById("font-px");
  var fontPxVal = document.getElementById("font-px-val");
  var fontRemHint = document.getElementById("font-rem-hint");
  var boxWidth = document.getElementById("box-width");
  var boxWidthVal = document.getElementById("box-width-val");
  var lineHeight = document.getElementById("line-height");
  var lineHeightVal = document.getElementById("line-height-val");
  var sampleText = document.getElementById("sample-text");
  var previewBox = document.getElementById("preview-box");
  var previewRuler = document.getElementById("preview-ruler");
  var previewText = document.getElementById("preview-text");
  var statCpl = document.getElementById("stat-cpl");
  var statLines = document.getElementById("stat-lines");
  var statFeel = document.getElementById("stat-feel");

  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");

  function remFromPx(px) {
    return (px / BASE_PX).toFixed(2).replace(/\.?0+$/, "");
  }

  function setFontContext(px) {
    ctx.font = px + "px " + FONT_FAMILY;
  }

  /** 줄바꿈·공백을 반영해 줄별 글자 수 배열을 만듭니다. */
  function layoutLines(text, px, maxInnerWidth) {
    setFontContext(px);
    var paragraphs = text.replace(/\r\n/g, "\n").split("\n");
    var lines = [];

    paragraphs.forEach(function (para, pi) {
      if (para.length === 0) {
        lines.push(0);
        return;
      }
      var current = "";
      for (var i = 0; i < para.length; i++) {
        var ch = para[i];
        var trial = current + ch;
        var w = ctx.measureText(trial).width;
        if (w > maxInnerWidth && current.length > 0) {
          lines.push(current.length);
          current = ch;
        } else {
          current = trial;
        }
      }
      if (current.length) lines.push(current.length);
      if (pi < paragraphs.length - 1 && para.length === 0) {
        /* empty para already handled */
      }
    });

    return lines;
  }

  function feelMessage(avgCpl, px) {
    if (avgCpl <= 0) return "글을 입력하면 체감을 알려 드립니다.";
    var parts = [];
    if (px < 15) parts.push("글자가 작은 편이라 모바일에서 확대를 고려해 보세요.");
    else if (px >= 20) parts.push("제목·강조용 크기에 가깝습니다.");
    else parts.push("본문 크기로 많이 쓰는 범위입니다.");

    if (avgCpl < 22) parts.push("한 줄이 짧아 스크롤은 늘지만 시선 이동은 적습니다.");
    else if (avgCpl <= 38) parts.push("한 줄 길이가 읽기 편한 편입니다.");
    else if (avgCpl <= 52) parts.push("한 줄이 다소 깁니다. 너비를 줄이면 더 편할 수 있어요.");
    else parts.push("한 줄이 깁니다. 본문 너비를 줄이는 것을 추천합니다.");

    return parts.join(" ");
  }

  function syncPresets(px) {
    document.querySelectorAll(".preset[data-px]").forEach(function (btn) {
      btn.classList.toggle("active", Number(btn.getAttribute("data-px")) === px);
    });
  }

  function syncWidthChips(w) {
    document.querySelectorAll(".width-chip[data-w]").forEach(function (btn) {
      btn.classList.toggle("active", Number(btn.getAttribute("data-w")) === w);
    });
  }

  function render() {
    var px = Number(fontPx.value);
    var w = Number(boxWidth.value);
    var lh = Number(lineHeight.value) / 100;
    var text = sampleText.value;

    fontPxVal.textContent = px + "px";
    fontRemHint.textContent = remFromPx(px) + "rem (기준 " + BASE_PX + "px)";
    boxWidthVal.textContent = w + "px";
    lineHeightVal.textContent = lh.toFixed(2);

    previewBox.style.width = w + "px";
    previewBox.style.maxWidth = "100%";
    previewBox.style.fontSize = px + "px";
    previewBox.style.lineHeight = String(lh);
    previewRuler.style.width = Math.min(w, previewBox.parentElement ? previewBox.parentElement.clientWidth : w) + "px";

    previewText.textContent = text || "미리볼 글을 입력하세요.";

    var inner = w - 40;
    if (inner < 120) inner = 120;
    var lineCounts = layoutLines(text || " ", px, inner);
    var totalLines = lineCounts.length;
    var sum = lineCounts.reduce(function (a, b) {
      return a + b;
    }, 0);
    var avg = totalLines ? Math.round(sum / totalLines) : 0;

    statCpl.textContent = String(avg);
    statLines.textContent = String(totalLines);
    statFeel.textContent = feelMessage(avg, px);

    syncPresets(px);
    syncWidthChips(w);
  }

  fontPx.addEventListener("input", render);
  boxWidth.addEventListener("input", render);
  lineHeight.addEventListener("input", render);
  sampleText.addEventListener("input", render);

  document.querySelectorAll(".preset[data-px]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      fontPx.value = btn.getAttribute("data-px");
      render();
    });
  });

  document.querySelectorAll(".width-chip[data-w]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      boxWidth.value = btn.getAttribute("data-w");
      render();
    });
  });

  window.addEventListener("resize", render);
  render();
})();
