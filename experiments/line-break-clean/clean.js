(function () {
  "use strict";

  var textIn = document.getElementById("text-in");
  var textOut = document.getElementById("text-out");
  var cleanBtn = document.getElementById("clean-btn");
  var copyBtn = document.getElementById("copy-btn");
  var swapBtn = document.getElementById("swap-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var clearBtn = document.getElementById("clear-btn");
  var statHint = document.getElementById("stat-hint");

  var opts = {
    trimEnd: document.getElementById("opt-trim-end"),
    blankOnly: document.getElementById("opt-blank-only"),
    empty: document.getElementById("opt-empty"),
    collapse: document.getElementById("opt-collapse"),
    unifyNl: document.getElementById("opt-unify-nl"),
    trimFile: document.getElementById("opt-trim-file"),
  };

  var SAMPLE =
    "첫 번째 문단입니다.   \r\n" +
    "\r\n" +
    "   \r\n" +
    "두 번째 문단.\r\n" +
    "\r\n" +
    "\r\n" +
    "\r\n" +
    "세 번째 문단입니다.\r\n" +
    "   ";

  function normalizeNewlines(text) {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function cleanText(raw) {
    var text = raw;
    if (opts.unifyNl.checked) text = normalizeNewlines(text);

    var lines = text.split("\n");
    var out = [];

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (opts.trimEnd.checked) line = line.replace(/\s+$/, "");

      var isEmpty = line.length === 0;
      var isBlankOnly = !isEmpty && /^\s+$/.test(line);

      if (isBlankOnly && opts.blankOnly.checked) continue;
      if (isEmpty && opts.empty.checked) continue;

      if (isEmpty && opts.collapse.checked) {
        if (out.length > 0 && out[out.length - 1] === "") continue;
      }

      out.push(line);
    }

    text = out.join("\n");
    if (opts.trimFile.checked) text = text.trim();
    return text;
  }

  function countLines(text) {
    if (!text) return 0;
    return text.split("\n").length;
  }

  function updateHint(before, after) {
    statHint.innerHTML =
      "정리 전 <strong>" +
      countLines(before) +
      "</strong>줄 · " +
      before.length +
      "글자 → 정리 후 <strong>" +
      countLines(after) +
      "</strong>줄 · " +
      after.length +
      "글자";
  }

  function runClean() {
    var before = textIn.value;
    var after = cleanText(before);
    textOut.value = after;
    copyBtn.disabled = !after;
    updateHint(before, after);
  }

  cleanBtn.addEventListener("click", runClean);

  Object.keys(opts).forEach(function (key) {
    opts[key].addEventListener("change", function () {
      if (textIn.value) runClean();
    });
  });

  textIn.addEventListener("input", function () {
    copyBtn.disabled = !textOut.value;
  });

  copyBtn.addEventListener("click", function () {
    var t = textOut.value;
    if (!t) return;
    navigator.clipboard.writeText(t).then(function () {
      var prev = copyBtn.textContent;
      copyBtn.textContent = "복사됨";
      setTimeout(function () {
        copyBtn.textContent = prev;
      }, 1400);
    });
  });

  swapBtn.addEventListener("click", function () {
    if (!textOut.value) return;
    textIn.value = textOut.value;
    textOut.value = "";
    copyBtn.disabled = true;
    statHint.textContent = "결과를 원본으로 옮겼습니다. 다시 정리할 수 있어요.";
  });

  sampleBtn.addEventListener("click", function () {
    textIn.value = SAMPLE;
    textOut.value = "";
    copyBtn.disabled = true;
    runClean();
  });

  clearBtn.addEventListener("click", function () {
    textIn.value = "";
    textOut.value = "";
    copyBtn.disabled = true;
    statHint.textContent = "줄 수 · 글자 수가 정리 전후로 표시됩니다.";
  });
})();
