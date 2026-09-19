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
    collapse: document.getElementById("opt-collapse"),
    tabs: document.getElementById("opt-tabs"),
    nbsp: document.getElementById("opt-nbsp"),
    trimLine: document.getElementById("opt-trim-line"),
    live: document.getElementById("opt-live"),
  };

  var SAMPLE =
    "첫   문장입니다.\t\t두   칸   띄어쓰기가   섞여   있어요.\n\n" +
    "두 번째 문단.\u00a0\u00a0특수\u3000공백도\u2003들어\u2009있습니다.\n" +
    "   줄 앞뒤 공백   \n";

  var SPECIAL_SPACE = /[\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/g;

  function normalizeNewlines(text) {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function countSpaces(text) {
    var m = text.match(/[ \t\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff]/g);
    return m ? m.length : 0;
  }

  function countLines(text) {
    if (!text) return 0;
    return text.split("\n").length;
  }

  function normalizeLine(line) {
    var out = line;
    if (opts.nbsp.checked) out = out.replace(SPECIAL_SPACE, " ");
    if (opts.tabs.checked) out = out.replace(/\t/g, " ");
    if (opts.collapse.checked) out = out.replace(/ +/g, " ");
    if (opts.trimLine.checked) out = out.trim();
    return out;
  }

  function normalizeText(raw) {
    var text = normalizeNewlines(raw);
    var lines = text.split("\n");
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      out.push(normalizeLine(lines[i]));
    }
    return out.join("\n");
  }

  function runClean() {
    var before = textIn.value;
    var after = normalizeText(before);
    textOut.value = after;
    copyBtn.disabled = after.length === 0;
    statHint.innerHTML =
      "공백 칸 <strong>" +
      countSpaces(before) +
      "</strong> → <strong>" +
      countSpaces(after) +
      "</strong> · 줄 <strong>" +
      countLines(before) +
      "</strong> → <strong>" +
      countLines(after) +
      "</strong>";
  }

  function copyResult() {
    var t = textOut.value;
    if (!t) return;
    navigator.clipboard.writeText(t).then(function () {
      copyBtn.textContent = "복사됨!";
      setTimeout(function () {
        copyBtn.textContent = "결과 복사";
      }, 1400);
    });
  }

  cleanBtn.addEventListener("click", runClean);
  copyBtn.addEventListener("click", copyResult);
  swapBtn.addEventListener("click", function () {
    textIn.value = textOut.value;
    runClean();
  });
  sampleBtn.addEventListener("click", function () {
    textIn.value = SAMPLE;
    runClean();
  });
  clearBtn.addEventListener("click", function () {
    textIn.value = "";
    textOut.value = "";
    copyBtn.disabled = true;
    statHint.textContent = "공백 칸 수 · 줄 수가 정리 전후로 표시됩니다.";
  });

  textIn.addEventListener("input", function () {
    if (opts.live.checked) runClean();
  });

  Object.keys(opts).forEach(function (key) {
    if (key === "live") return;
    opts[key].addEventListener("change", function () {
      if (textIn.value || textOut.value) runClean();
    });
  });

  opts.live.addEventListener("change", function () {
    if (opts.live.checked && textIn.value) runClean();
  });
})();
