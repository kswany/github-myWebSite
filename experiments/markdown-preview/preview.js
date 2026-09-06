(function () {
  "use strict";

  var SAMPLE =
    "# 오늘 메모\n\n" +
    "마크다운은 **굵게**, *기울임*, `코드`를 쉽게 쓸 수 있습니다.\n\n" +
    "## 할 일\n\n" +
    "- 글 초안 쓰기\n" +
    "- 미리보기 확인\n" +
    "- 링크 넣기: [kswany 홈](../../)\n\n" +
    "> 짧은 메모도 미리보기로 먼저 보면 편합니다.\n\n" +
    "```\n" +
    "console.log('안녕, 마크다운!');\n" +
    "```\n\n" +
    "---\n\n" +
    "1. 첫 번째\n" +
    "2. 두 번째";

  var input = document.getElementById("md-input");
  var preview = document.getElementById("preview-box");
  var liveToggle = document.getElementById("live-toggle");
  var statusOk = document.getElementById("status-ok");
  var statusOkText = document.getElementById("status-ok-text");
  var lastHtml = "";

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function sanitizeUrl(url) {
    var trimmed = url.trim();
    if (!trimmed) return "";
    var lower = trimmed.toLowerCase();
    if (lower.indexOf("javascript:") === 0 || lower.indexOf("data:") === 0) return "";
    return trimmed;
  }

  function inlineMarkdown(text) {
    var placeholders = [];
    var idx = 0;

    text = text.replace(/`([^`\n]+)`/g, function (_, code) {
      var key = "\x00C" + idx + "\x00";
      placeholders.push({ key: key, html: "<code>" + escapeHtml(code) + "</code>" });
      idx += 1;
      return key;
    });

    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, url) {
      var safe = sanitizeUrl(url);
      if (!safe) return escapeHtml(label);
      return (
        '<a href="' +
        escapeHtml(safe) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(label) +
        "</a>"
      );
    });

    text = text.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__([^_\n]+)__/g, "<strong>$1</strong>");
    text = text.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    text = text.replace(/_([^_\n]+)_/g, "<em>$1</em>");

    placeholders.forEach(function (item) {
      text = text.split(item.key).join(item.html);
    });

    return text;
  }

  function isHr(line) {
    return /^(\*{3,}|-{3,}|_{3,})\s*$/.test(line.trim());
  }

  function parseMarkdown(raw) {
    if (!raw.trim()) return "";

    var lines = raw.replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      if (line.trim().indexOf("```") === 0) {
        var fence = [];
        i += 1;
        while (i < lines.length && lines[i].trim().indexOf("```") !== 0) {
          fence.push(lines[i]);
          i += 1;
        }
        html.push("<pre><code>" + escapeHtml(fence.join("\n")) + "</code></pre>");
        i += 1;
        continue;
      }

      if (isHr(line)) {
        html.push("<hr />");
        i += 1;
        continue;
      }

      var heading = line.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        var level = heading[1].length;
        html.push(
          "<h" + level + ">" + inlineMarkdown(escapeHtml(heading[2])) + "</h" + level + ">"
        );
        i += 1;
        continue;
      }

      if (/^>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^>\s?/, ""));
          i += 1;
        }
        html.push(
          "<blockquote><p>" +
            inlineMarkdown(escapeHtml(quote.join(" "))) +
            "</p></blockquote>"
        );
        continue;
      }

      if (/^[-*+]\s+/.test(line)) {
        html.push("<ul>");
        while (i < lines.length && /^[-*+]\s+/.test(lines[i])) {
          var item = lines[i].replace(/^[-*+]\s+/, "");
          html.push("<li>" + inlineMarkdown(escapeHtml(item)) + "</li>");
          i += 1;
        }
        html.push("</ul>");
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        html.push("<ol>");
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          var numItem = lines[i].replace(/^\d+\.\s+/, "");
          html.push("<li>" + inlineMarkdown(escapeHtml(numItem)) + "</li>");
          i += 1;
        }
        html.push("</ol>");
        continue;
      }

      if (!line.trim()) {
        i += 1;
        continue;
      }

      var para = [line];
      i += 1;
      while (
        i < lines.length &&
        lines[i].trim() &&
        !/^(#{1,3}\s|[-*+]\s|\d+\.\s|>|```)/.test(lines[i]) &&
        !isHr(lines[i])
      ) {
        para.push(lines[i]);
        i += 1;
      }
      html.push("<p>" + inlineMarkdown(escapeHtml(para.join(" "))) + "</p>");
    }

    return html.join("");
  }

  function render() {
    var raw = input.value;
    if (!raw.trim()) {
      preview.innerHTML = '<p class="preview-empty">왼쪽에 글을 쓰면 여기에 표시됩니다.</p>';
      lastHtml = "";
      return;
    }
    lastHtml = parseMarkdown(raw);
    preview.innerHTML = lastHtml;
  }

  function flashOk(msg) {
    statusOkText.textContent = msg;
    statusOk.hidden = false;
    window.clearTimeout(flashOk.timer);
    flashOk.timer = window.setTimeout(function () {
      statusOk.hidden = true;
    }, 2200);
  }

  function copyHtml() {
    if (!lastHtml) {
      flashOk("복사할 내용이 없습니다.");
      return;
    }
    navigator.clipboard.writeText(lastHtml).then(
      function () {
        flashOk("HTML을 복사했습니다.");
      },
      function () {
        flashOk("복사에 실패했습니다.");
      }
    );
  }

  input.addEventListener("input", function () {
    if (liveToggle.checked) render();
  });

  document.getElementById("sample-btn").addEventListener("click", function () {
    input.value = SAMPLE;
    render();
    input.focus();
  });

  document.getElementById("clear-btn").addEventListener("click", function () {
    input.value = "";
    render();
    input.focus();
  });

  document.getElementById("copy-html-btn").addEventListener("click", copyHtml);

  liveToggle.addEventListener("change", function () {
    if (liveToggle.checked) render();
  });

  render();
})();
