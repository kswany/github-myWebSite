(function () {
  var input = document.getElementById("json-input");
  var output = document.getElementById("json-output");
  var indentSelect = document.getElementById("indent-select");
  var formatBtn = document.getElementById("format-btn");
  var minifyBtn = document.getElementById("minify-btn");
  var copyBtn = document.getElementById("copy-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var clearBtn = document.getElementById("clear-btn");
  var statusOk = document.getElementById("status-ok");
  var statusOkText = document.getElementById("status-ok-text");
  var statusErr = document.getElementById("status-err");
  var statusErrText = document.getElementById("status-err-text");
  var statHint = document.getElementById("stat-hint");

  var SAMPLE =
    '{"site":"kswany","features":["사주","게임","실험"],"stats":{"today":12,"total":340}}';

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

  function getIndent() {
    var value = indentSelect.value;
    if (value === "tab") return "\t";
    return Number(value) || 2;
  }

  function positionFromText(text, index) {
    var safeIndex = Math.max(0, Math.min(index, text.length));
    var before = text.slice(0, safeIndex);
    var lines = before.split(/\r\n|\r|\n/);
    var line = lines.length;
    var column = lines[lines.length - 1].length + 1;
    return { line: line, column: column, index: safeIndex };
  }

  function parsePositionFromMessage(message, text) {
    var match =
      message.match(/position\s+(\d+)/i) ||
      message.match(/at\s+line\s+(\d+)\s+column\s+(\d+)/i);

    if (!match) return null;

    if (match[2]) {
      return {
        line: Number(match[1]),
        column: Number(match[2]),
        index: null,
      };
    }

    return positionFromText(text, Number(match[1]));
  }

  function parseJson(text) {
    try {
      return { value: JSON.parse(text), error: null };
    } catch (err) {
      return { value: null, error: err };
    }
  }

  function describeError(text, err) {
    var message = err && err.message ? err.message : "알 수 없는 오류";
    var pos = parsePositionFromMessage(message, text);
    if (!pos) {
      return message.replace(/^JSON\.parse:\s*/i, "");
    }

    var snippet = "";
    var lines = text.split(/\r\n|\r|\n/);
    var lineText = lines[pos.line - 1];
    if (lineText !== undefined) {
      var pointer = " ".repeat(Math.max(0, pos.column - 1)) + "^";
      snippet =
        "\n\n" +
        pos.line +
        "번째 줄: " +
        lineText.trim().slice(0, 80) +
        (lineText.length > 80 ? "…" : "") +
        "\n" +
        pointer;
    }

    return (
      message.replace(/^JSON\.parse:\s*/i, "") +
      " (" +
      pos.line +
      "번째 줄, " +
      pos.column +
      "번째 글자)" +
      snippet
    );
  }

  function byteLength(text) {
    return new TextEncoder().encode(text).length;
  }

  function summarize(value, formatted) {
    var type = Array.isArray(value) ? "배열" : typeof value === "object" ? "객체" : "값";
    var count = 0;
    if (Array.isArray(value)) count = value.length;
    else if (value && typeof value === "object") count = Object.keys(value).length;

    var parts = [type];
    if (count) parts.push(count + "개 항목");
    parts.push(formatted.split(/\r\n|\r|\n/).length + "줄");
    parts.push(byteLength(formatted).toLocaleString("ko-KR") + "바이트");
    return parts.join(" · ");
  }

  function runFormat(minify) {
    var text = input.value.trim();
    hideStatus();
    output.value = "";

    if (!text) {
      showErr("JSON을 입력하거나 붙여 넣어 주세요.");
      statHint.textContent = "입력값은 서버로 보내지 않습니다.";
      return;
    }

    var parsed = parseJson(text);
    if (parsed.error) {
      showErr(describeError(text, parsed.error));
      statHint.textContent = "오류 위치를 확인한 뒤 다시 정리해 보세요.";
      return;
    }

    var formatted = minify
      ? JSON.stringify(parsed.value)
      : JSON.stringify(parsed.value, null, getIndent());

    output.value = formatted;
    showOk(minify ? "한 줄로 줄였습니다." : "보기 좋게 정리했습니다.");
    statHint.textContent = summarize(parsed.value, formatted);
  }

  function copyResult() {
    var text = output.value;
    if (!text) {
      showErr("먼저 정리하기를 눌러 결과를 만드세요.");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          showOk("결과를 복사했습니다.");
        },
        function () {
          fallbackCopy(text);
        }
      );
      return;
    }

    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    output.removeAttribute("readonly");
    output.select();
    try {
      document.execCommand("copy");
      showOk("결과를 복사했습니다.");
    } catch (err) {
      showErr("복사에 실패했습니다. 결과 칸에서 직접 선택해 복사해 주세요.");
    }
    output.setAttribute("readonly", "readonly");
    window.getSelection().removeAllRanges();
  }

  formatBtn.addEventListener("click", function () {
    runFormat(false);
  });

  minifyBtn.addEventListener("click", function () {
    runFormat(true);
  });

  copyBtn.addEventListener("click", copyResult);

  sampleBtn.addEventListener("click", function () {
    input.value = SAMPLE;
    output.value = "";
    hideStatus();
    statHint.textContent = "예시 JSON이 들어갔습니다. 정리하기를 눌러 보세요.";
    input.focus();
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    output.value = "";
    hideStatus();
    statHint.textContent = "입력값은 서버로 보내지 않습니다. 붙여 넣은 뒤 정리하기를 누르세요.";
    input.focus();
  });

  input.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runFormat(false);
    }
  });
})();
