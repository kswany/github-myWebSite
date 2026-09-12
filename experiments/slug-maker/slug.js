(function () {
  "use strict";

  var CHO = [
    "g",
    "kk",
    "n",
    "d",
    "tt",
    "r",
    "m",
    "b",
    "pp",
    "s",
    "ss",
    "",
    "j",
    "jj",
    "ch",
    "k",
    "t",
    "p",
    "h",
  ];
  var JUNG = [
    "a",
    "ae",
    "ya",
    "yae",
    "eo",
    "e",
    "yeo",
    "ye",
    "o",
    "wa",
    "wae",
    "oe",
    "yo",
    "u",
    "wo",
    "we",
    "wi",
    "yu",
    "eu",
    "ui",
    "i",
  ];
  var JONG = [
    "",
    "g",
    "kk",
    "gs",
    "n",
    "nj",
    "nh",
    "d",
    "l",
    "lg",
    "lm",
    "lb",
    "ls",
    "lt",
    "lp",
    "lh",
    "m",
    "b",
    "bs",
    "s",
    "ss",
    "ng",
    "j",
    "ch",
    "k",
    "t",
    "p",
    "h",
  ];

  var titleInput = document.getElementById("title-input");
  var slugResult = document.getElementById("slug-result");
  var slugPreview = document.getElementById("slug-preview");
  var copyBtn = document.getElementById("copy-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var clearBtn = document.getElementById("clear-btn");
  var keepEnglish = document.getElementById("keep-english");
  var statusOk = document.getElementById("status-ok");
  var statusOkText = document.getElementById("status-ok-text");
  var sepChips = document.querySelectorAll(".chip[data-sep]");

  var separator = "-";
  var statusTimer;

  function isHangul(ch) {
    var c = ch.charCodeAt(0);
    return c >= 0xac00 && c <= 0xd7a3;
  }

  function isHangulJamo(ch) {
    var c = ch.charCodeAt(0);
    return (c >= 0x3131 && c <= 0x318e) || (c >= 0x1100 && c <= 0x11ff);
  }

  function romanizeSyllable(ch) {
    var code = ch.charCodeAt(0) - 0xac00;
    if (code < 0 || code > 11171) return "";
    var cho = Math.floor(code / 588);
    var jung = Math.floor((code % 588) / 28);
    var jong = code % 28;
    return CHO[cho] + JUNG[jung] + JONG[jong];
  }

  function romanizeText(text) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (isHangul(ch)) {
        out += romanizeSyllable(ch);
      } else if (isHangulJamo(ch)) {
        out += "";
      } else {
        out += ch;
      }
    }
    return out;
  }

  function toSlug(raw, sep, keepEn) {
    var text = raw.trim();
    if (!text) return "";

    var roman = keepEn ? romanizeMixed(text) : romanizeText(text);
    roman = roman.toLowerCase();
    roman = roman.replace(/[^a-z0-9]+/g, sep);
    roman = roman.replace(new RegExp(sep + "+", "g"), sep);
    roman = roman.replace(new RegExp("^" + sep + "+|" + sep + "+$", "g"), "");
    return roman.slice(0, 80);
  }

  function romanizeMixed(text) {
    var out = "";
    var i = 0;
    while (i < text.length) {
      var ch = text[i];
      if (isHangul(ch)) {
        out += romanizeSyllable(ch);
        i += 1;
      } else if (/[A-Za-z0-9]/.test(ch)) {
        var word = "";
        while (i < text.length && /[A-Za-z0-9]/.test(text[i])) {
          word += text[i];
          i += 1;
        }
        out += word;
      } else {
        out += ch;
        i += 1;
      }
    }
    return out;
  }

  function updateUI() {
    statusOk.hidden = true;
    var slug = toSlug(titleInput.value, separator, keepEnglish.checked);
    if (!slug) {
      slugResult.textContent = titleInput.value.trim() ? "slug를 만들 수 없어요" : "제목을 입력하세요";
      slugResult.classList.add("empty");
      slugPreview.hidden = true;
      copyBtn.disabled = true;
      return;
    }
    slugResult.textContent = slug;
    slugResult.classList.remove("empty");
    slugPreview.textContent = "예: kswany.github.io/experiments/" + slug + "/";
    slugPreview.hidden = false;
    copyBtn.disabled = false;
  }

  function showOk(msg) {
    clearTimeout(statusTimer);
    statusOkText.textContent = msg;
    statusOk.hidden = false;
    statusTimer = setTimeout(function () {
      statusOk.hidden = true;
    }, 2200);
  }

  sepChips.forEach(function (btn) {
    btn.addEventListener("click", function () {
      sepChips.forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      separator = btn.getAttribute("data-sep") || "-";
      updateUI();
    });
  });

  titleInput.addEventListener("input", updateUI);
  keepEnglish.addEventListener("change", updateUI);

  copyBtn.addEventListener("click", function () {
    var slug = slugResult.textContent;
    if (!slug || slugResult.classList.contains("empty")) return;
    navigator.clipboard.writeText(slug).then(
      function () {
        showOk("slug를 복사했습니다.");
      },
      function () {
        showOk("복사에 실패했어요. 직접 선택해 주세요.");
      }
    );
  });

  sampleBtn.addEventListener("click", function () {
    titleInput.value = "2026 가을 웹 실험 메모";
    updateUI();
    titleInput.focus();
  });

  clearBtn.addEventListener("click", function () {
    titleInput.value = "";
    updateUI();
    titleInput.focus();
  });

  updateUI();
})();
