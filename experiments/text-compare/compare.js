(function () {
  "use strict";

  var textA = document.getElementById("text-a");
  var textB = document.getElementById("text-b");
  var compareBtn = document.getElementById("compare-btn");
  var swapBtn = document.getElementById("swap-btn");
  var clearBtn = document.getElementById("clear-btn");
  var stats = document.getElementById("stats");
  var resultWrap = document.getElementById("result-wrap");
  var resultHint = document.getElementById("result-hint");
  var diffView = document.getElementById("diff-view");
  var statSame = document.getElementById("stat-same");
  var statChanged = document.getElementById("stat-changed");
  var statRemoved = document.getElementById("stat-removed");
  var statAdded = document.getElementById("stat-added");

  function splitLines(text) {
    if (!text) return [];
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  }

  function lcsTable(a, b) {
    var rows = a.length + 1;
    var cols = b.length + 1;
    var table = new Array(rows);

    for (var i = 0; i < rows; i += 1) {
      table[i] = new Array(cols).fill(0);
    }

    for (var r = 1; r < rows; r += 1) {
      for (var c = 1; c < cols; c += 1) {
        if (a[r - 1] === b[c - 1]) {
          table[r][c] = table[r - 1][c - 1] + 1;
        } else {
          table[r][c] = Math.max(table[r - 1][c], table[r][c - 1]);
        }
      }
    }

    return table;
  }

  function buildDiff(a, b) {
    var table = lcsTable(a, b);
    var i = a.length;
    var j = b.length;
    var stack = [];

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
        stack.push({ type: "same", left: a[i - 1], right: b[j - 1], leftNum: i, rightNum: j });
        i -= 1;
        j -= 1;
      } else if (j > 0 && (i === 0 || table[i][j - 1] >= table[i - 1][j])) {
        stack.push({ type: "added", left: "", right: b[j - 1], leftNum: null, rightNum: j });
        j -= 1;
      } else {
        stack.push({ type: "removed", left: a[i - 1], right: "", leftNum: i, rightNum: null });
        i -= 1;
      }
    }

    stack.reverse();

    var merged = [];
    var idx = 0;

    while (idx < stack.length) {
      var cur = stack[idx];
      var next = stack[idx + 1];

      if (cur.type === "removed" && next && next.type === "added") {
        merged.push({
          type: "changed",
          left: cur.left,
          right: next.right,
          leftNum: cur.leftNum,
          rightNum: next.rightNum,
        });
        idx += 2;
        continue;
      }

      merged.push(cur);
      idx += 1;
    }

    return merged;
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function markFor(type) {
    if (type === "same") return " ";
    if (type === "changed") return "~";
    if (type === "removed") return "-";
    if (type === "added") return "+";
    return " ";
  }

  function renderDiff(rows) {
    diffView.innerHTML = "";

    if (!rows.length) {
      diffView.innerHTML = '<p class="diff-empty">비교할 줄이 없습니다.</p>';
      return;
    }

    rows.forEach(function (row) {
      var el = document.createElement("div");
      el.className = "diff-row " + row.type;

      var leftText = row.type === "added" ? "" : row.left;
      var rightText = row.type === "removed" ? "" : row.right;

      el.innerHTML =
        '<span class="diff-num">' +
        (row.leftNum == null ? "" : row.leftNum) +
        "</span>" +
        '<span class="diff-num">' +
        (row.rightNum == null ? "" : row.rightNum) +
        "</span>" +
        '<span class="diff-mark">' +
        markFor(row.type) +
        "</span>" +
        '<span class="diff-text">' +
        escapeHtml(leftText || rightText) +
        (row.type === "changed"
          ? '<br><span style="opacity:0.55">→ </span>' + escapeHtml(rightText)
          : "") +
        "</span>";

      diffView.appendChild(el);
    });
  }

  function compare() {
    var linesA = splitLines(textA.value);
    var linesB = splitLines(textB.value);
    var rows = buildDiff(linesA, linesB);

    var same = 0;
    var changed = 0;
    var removed = 0;
    var added = 0;

    rows.forEach(function (row) {
      if (row.type === "same") same += 1;
      if (row.type === "changed") changed += 1;
      if (row.type === "removed") removed += 1;
      if (row.type === "added") added += 1;
    });

    statSame.textContent = String(same);
    statChanged.textContent = String(changed);
    statRemoved.textContent = String(removed);
    statAdded.textContent = String(added);

    stats.hidden = false;
    resultWrap.hidden = false;

    if (changed + removed + added === 0) {
      resultHint.textContent = "두 글이 완전히 같습니다.";
    } else {
      resultHint.textContent =
        "다른 줄 " +
        (changed + removed + added) +
        "개를 찾았습니다. -는 왼쪽만, +는 오른쪽만, ~는 내용이 바뀐 줄입니다.";
    }

    renderDiff(rows);
  }

  compareBtn.addEventListener("click", compare);

  swapBtn.addEventListener("click", function () {
    var temp = textA.value;
    textA.value = textB.value;
    textB.value = temp;
    compare();
  });

  clearBtn.addEventListener("click", function () {
    textA.value = "";
    textB.value = "";
    stats.hidden = true;
    resultWrap.hidden = true;
    diffView.innerHTML = "";
    textA.focus();
  });
})();
