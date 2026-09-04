(function () {
  "use strict";

  var MAX_TEXT = 20000;
  var MAX_MATCHES = 200;

  var patternInput = document.getElementById("pattern-input");
  var textInput = document.getElementById("text-input");
  var testBtn = document.getElementById("test-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var clearBtn = document.getElementById("clear-btn");
  var statusOk = document.getElementById("status-ok");
  var statusOkText = document.getElementById("status-ok-text");
  var statusErr = document.getElementById("status-err");
  var statusErrText = document.getElementById("status-err-text");
  var highlightBox = document.getElementById("highlight-box");
  var matchCount = document.getElementById("match-count");
  var matchListWrap = document.getElementById("match-list-wrap");
  var matchList = document.getElementById("match-list");
  var statHint = document.getElementById("stat-hint");
  var flagChips = document.querySelectorAll(".flag-chip");
  var quickPatterns = document.querySelectorAll("[data-pattern]");

  var SAMPLE = {
    pattern: "\\d{2,4}년",
    text:
      "2026년 9월 계획\n" +
      "전화 010-1234-5678\n" +
      "이메일 hello@kswany.test\n" +
      "1999년부터 웹을 만들었어요.\n" +
      "숫자만: 42, 1000, 3.14",
  };

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getFlags() {
    var flags = "";
    flagChips.forEach(function (chip) {
      if (chip.getAttribute("aria-pressed") === "true") {
        flags += chip.getAttribute("data-flag");
      }
    });
    return flags || "g";
  }

  function hideStatus() {
    statusOk.hidden = true;
    statusErr.hidden = true;
  }

  function showOk(message) {
    hideStatus();
    statusOkText.textContent = message;
    statusOk.hidden = false;
  }

  function showErr(message) {
    hideStatus();
    statusErrText.textContent = message;
    statusErr.hidden = false;
  }

  function setPlaceholder(message) {
    highlightBox.innerHTML = '<span class="placeholder">' + escapeHtml(message) + "</span>";
    matchCount.textContent = "—";
    matchListWrap.hidden = true;
    matchList.innerHTML = "";
  }

  function buildHighlight(text, matches) {
    if (!matches.length) {
      return escapeHtml(text);
    }

    var html = "";
    var last = 0;

    matches.forEach(function (match) {
      html += escapeHtml(text.slice(last, match.index));
      html += "<mark>" + escapeHtml(match[0]) + "</mark>";
      last = match.index + match[0].length;
    });

    html += escapeHtml(text.slice(last));
    return html;
  }

  function renderMatchList(matches) {
    matchList.innerHTML = "";

    matches.forEach(function (match, index) {
      var li = document.createElement("li");
      li.innerHTML =
        '<span class="match-index">#' +
        (index + 1) +
        '</span><span class="match-value">' +
        escapeHtml(match[0]) +
        '</span><span class="match-pos">' +
        match.index +
        "번째 글자</span>";
      matchList.appendChild(li);
    });

    matchListWrap.hidden = matches.length === 0;
  }

  function runTest() {
    var pattern = patternInput.value;
    var text = textInput.value;

    if (!pattern && !text) {
      hideStatus();
      setPlaceholder("패턴과 글을 넣으면 맞는 부분이 색으로 표시됩니다");
      statHint.textContent = "입력값은 서버로 보내지 않습니다. 글을 붙여 넣으면 자동으로 시험합니다.";
      return;
    }

    if (!pattern) {
      hideStatus();
      setPlaceholder("패턴을 먼저 넣어 주세요");
      statHint.textContent = "위에 정규식 패턴을 입력하세요.";
      return;
    }

    if (!text) {
      hideStatus();
      setPlaceholder("시험할 글을 넣어 주세요");
      statHint.textContent = "아래 칸에 글을 붙여 넣으면 바로 확인합니다.";
      return;
    }

    if (text.length > MAX_TEXT) {
      showErr("글은 " + MAX_TEXT.toLocaleString("ko-KR") + "자까지 넣을 수 있습니다.");
      setPlaceholder("글 길이를 줄여 주세요");
      return;
    }

    var regex;
    try {
      regex = new RegExp(pattern, getFlags());
    } catch (err) {
      showErr(err.message || "패턴을 읽을 수 없습니다.");
      setPlaceholder("패턴을 고쳐 주세요");
      statHint.textContent = "슬래시(/)는 넣지 않아도 됩니다. 옵션은 오른쪽 g·i·m 버튼으로 고릅니다.";
      return;
    }

    var matches = [];
    if (regex.global) {
      var match;
      while ((match = regex.exec(text)) !== null) {
        matches.push(match);
        if (match[0].length === 0) {
          regex.lastIndex += 1;
        }
        if (matches.length >= MAX_MATCHES) {
          break;
        }
      }
    } else {
      var single = regex.exec(text);
      if (single) {
        matches.push(single);
      }
    }

    highlightBox.innerHTML = buildHighlight(text, matches);
    matchCount.textContent = matches.length.toLocaleString("ko-KR") + "개 일치";
    renderMatchList(matches);

    if (matches.length) {
      showOk(matches.length.toLocaleString("ko-KR") + "개가 패턴과 일치합니다.");
    } else {
      hideStatus();
    }

    statHint.textContent =
      [...text].length.toLocaleString("ko-KR") +
      "글자 · 패턴 /" +
      pattern +
      "/" +
      getFlags();
  }

  flagChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var pressed = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", pressed ? "false" : "true");
      runTest();
    });
  });

  quickPatterns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      patternInput.value = btn.getAttribute("data-pattern");
      patternInput.focus();
      runTest();
    });
  });

  patternInput.addEventListener("input", runTest);
  textInput.addEventListener("input", runTest);
  testBtn.addEventListener("click", runTest);

  sampleBtn.addEventListener("click", function () {
    patternInput.value = SAMPLE.pattern;
    textInput.value = SAMPLE.text;
    runTest();
  });

  clearBtn.addEventListener("click", function () {
    patternInput.value = "";
    textInput.value = "";
    hideStatus();
    setPlaceholder("패턴과 글을 넣으면 맞는 부분이 색으로 표시됩니다");
    statHint.textContent = "입력값은 서버로 보내지 않습니다. 글을 붙여 넣으면 자동으로 시험합니다.";
    patternInput.focus();
  });

  setPlaceholder("패턴과 글을 넣으면 맞는 부분이 색으로 표시됩니다");
})();
