(function () {
  "use strict";

  var textIn = document.getElementById("text-in");
  var textOut = document.getElementById("text-out");
  var maxLen = document.getElementById("max-len");
  var maxLenVal = document.getElementById("max-len-val");
  var wrapBtn = document.getElementById("wrap-btn");
  var copyBtn = document.getElementById("copy-btn");
  var swapBtn = document.getElementById("swap-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var clearBtn = document.getElementById("clear-btn");
  var statHint = document.getElementById("stat-hint");
  var presetBtns = document.querySelectorAll(".preset[data-len]");

  var opts = {
    space: document.getElementById("opt-space"),
    punct: document.getElementById("opt-punct"),
    keepPara: document.getElementById("opt-keep-para"),
    live: document.getElementById("opt-live"),
  };

  var SAMPLE =
    "오늘 회의에서 새 기능 일정을 다시 잡았는데, 기획·디자인·개발이 한 줄로 길게 이어져 있어서 모바일에서 읽기가 조금 힘들었습니다. " +
    "그래서 발표 자료와 카드뉴스 문장을 미리 적당한 길이로 나눠 두면 현장에서도 수정이 줄어듭니다.\n\n" +
    "짧은 문장도 한 줄에 너무 길면 시선이 흐트러지니, 목표 글자 수만 정해 두고 자동으로 줄바꿈해 보세요.";

  var PUNCT_BREAK = /([.?!…]+["')\]]?\s*)/;

  function normalizeNewlines(text) {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function lineStats(text) {
    if (!text) return { lines: 0, max: 0 };
    var parts = text.split("\n");
    var max = 0;
    parts.forEach(function (p) {
      var len = p.length;
      if (len > max) max = len;
    });
    return { lines: parts.length, max: max };
  }

  function splitByPunct(block) {
    if (!opts.punct.checked) return [block];
    var chunks = [];
    var rest = block;
    while (rest.length) {
      var m = rest.match(PUNCT_BREAK);
      if (!m || m.index === undefined) {
        chunks.push(rest);
        break;
      }
      var idx = m.index + m[0].length;
      chunks.push(rest.slice(0, idx).trim());
      rest = rest.slice(idx).trim();
    }
    return chunks.filter(Boolean);
  }

  function wrapSegment(segment, limit) {
    segment = segment.trim();
    if (!segment) return [];
    if (segment.length <= limit) return [segment];

    var lines = [];
    var remaining = segment;

    while (remaining.length > limit) {
      var slice = remaining.slice(0, limit + 1);
      var breakAt = -1;

      if (opts.space.checked) {
        var lastSpace = slice.lastIndexOf(" ");
        if (lastSpace > 0) breakAt = lastSpace;
      }

      if (breakAt <= 0) breakAt = limit;

      var line = remaining.slice(0, breakAt).trim();
      if (!line) {
        line = remaining.slice(0, limit);
        breakAt = limit;
      }
      lines.push(line);
      remaining = remaining.slice(breakAt).trim();
    }

    if (remaining) lines.push(remaining);
    return lines;
  }

  function wrapBlock(block, limit) {
    var pieces = splitByPunct(block);
    var out = [];
    pieces.forEach(function (piece) {
      wrapSegment(piece, limit).forEach(function (line) {
        out.push(line);
      });
    });
    return out;
  }

  function wrapText(text, limit) {
    text = normalizeNewlines(text);
    if (!text.trim()) return "";

    if (opts.keepPara.checked) {
      var paragraphs = text.split(/\n\n+/);
      return paragraphs
        .map(function (para) {
          var logicalLines = para.split("\n");
          var wrapped = [];
          logicalLines.forEach(function (line) {
            if (!line.trim()) {
              wrapped.push("");
              return;
            }
            wrapBlock(line, limit).forEach(function (l) {
              wrapped.push(l);
            });
          });
          return wrapped.join("\n");
        })
        .join("\n\n");
    }

    var flat = text.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();
    return wrapBlock(flat, limit).join("\n");
  }

  function updatePresets(val) {
    presetBtns.forEach(function (btn) {
      var n = Number(btn.getAttribute("data-len"));
      var on = n === val;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function runWrap() {
    var limit = Number(maxLen.value) || 32;
    var src = textIn.value;
    var result = wrapText(src, limit);
    textOut.value = result;
    copyBtn.disabled = !result;

    var before = lineStats(normalizeNewlines(src));
    var after = lineStats(result);
    statHint.textContent =
      "줄 수 " +
      before.lines +
      " → " +
      after.lines +
      " · 가장 긴 줄 " +
      before.max +
      "자 → " +
      after.max +
      "자 (목표 " +
      limit +
      "자)";
  }

  maxLen.addEventListener("input", function () {
    maxLenVal.textContent = maxLen.value;
    updatePresets(Number(maxLen.value));
    if (opts.live.checked) runWrap();
  });

  presetBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var n = Number(btn.getAttribute("data-len"));
      maxLen.value = String(n);
      maxLenVal.textContent = String(n);
      updatePresets(n);
      runWrap();
    });
  });

  Object.keys(opts).forEach(function (key) {
    opts[key].addEventListener("change", function () {
      if (opts.live.checked) runWrap();
    });
  });

  textIn.addEventListener("input", function () {
    if (opts.live.checked) runWrap();
  });

  wrapBtn.addEventListener("click", runWrap);

  copyBtn.addEventListener("click", function () {
    var t = textOut.value;
    if (!t) return;
    navigator.clipboard.writeText(t).then(function () {
      copyBtn.textContent = "복사됨";
      setTimeout(function () {
        copyBtn.textContent = "결과 복사";
      }, 1200);
    });
  });

  swapBtn.addEventListener("click", function () {
    if (!textOut.value) return;
    textIn.value = textOut.value;
    runWrap();
  });

  sampleBtn.addEventListener("click", function () {
    textIn.value = SAMPLE;
    runWrap();
  });

  clearBtn.addEventListener("click", function () {
    textIn.value = "";
    textOut.value = "";
    copyBtn.disabled = true;
    statHint.textContent = "줄 수 · 가장 긴 줄 글자 수가 표시됩니다.";
  });

  updatePresets(Number(maxLen.value));
})();
