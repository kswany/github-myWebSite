(function () {
  var input = document.getElementById("text-input");
  var clearBtn = document.getElementById("clear-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var statCharsAll = document.getElementById("stat-chars-all");
  var statCharsNoSpace = document.getElementById("stat-chars-no-space");
  var statLines = document.getElementById("stat-lines");
  var statBytes = document.getElementById("stat-bytes");
  var statHint = document.getElementById("stat-hint");

  var SAMPLE =
    "안녕하세요!\n" +
    "글자 수를 바로 세어 보는 작은 도구입니다.\n" +
    "공백, 줄바꿈, 이모지도 함께 계산해요 🙂";

  function formatNumber(value) {
    return value.toLocaleString("ko-KR");
  }

  function countLines(text) {
    if (!text) return 0;
    return text.split(/\r\n|\r|\n/).length;
  }

  function countBytes(text) {
    return new TextEncoder().encode(text).length;
  }

  function update() {
    var text = input.value;
    var charsAll = text.length;
    var charsNoSpace = text.replace(/\s/g, "").length;
    var lines = countLines(text);
    var bytes = countBytes(text);

    statCharsAll.textContent = formatNumber(charsAll);
    statCharsNoSpace.textContent = formatNumber(charsNoSpace);
    statLines.textContent = formatNumber(lines);
    statBytes.textContent = formatNumber(bytes);

    if (!text) {
      statHint.textContent = "공백·줄바꿈·이모지도 모두 세어 줍니다.";
      return;
    }

    statHint.textContent =
      "공백 " +
      formatNumber(charsAll - charsNoSpace) +
      "자 · 줄 " +
      formatNumber(lines) +
      "줄 · UTF-8 " +
      formatNumber(bytes) +
      "바이트";
  }

  input.addEventListener("input", update);

  clearBtn.addEventListener("click", function () {
    input.value = "";
    input.focus();
    update();
  });

  sampleBtn.addEventListener("click", function () {
    input.value = SAMPLE;
    input.focus();
    update();
  });

  update();
})();
