(function () {
  "use strict";

  var WEEK_KO = ["일", "월", "화", "수", "목", "금", "토"];
  var MONTH_KO = ["", "1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

  var fields = [
    { id: "f-min", min: 0, max: 59, name: "분" },
    { id: "f-hour", min: 0, max: 23, name: "시" },
    { id: "f-dom", min: 1, max: 31, name: "일" },
    { id: "f-mon", min: 1, max: 12, name: "월" },
    { id: "f-dow", min: 0, max: 6, name: "요일" },
  ];

  var summaryEl = document.getElementById("summary-text");
  var exprOneEl = document.getElementById("expr-one");
  var nextListEl = document.getElementById("next-list");
  var errorEl = document.getElementById("cron-error");
  var nextBlock = document.getElementById("next-block");

  function normalizeDow(list) {
    var out = {};
    list.forEach(function (n) {
      out[n === 7 ? 0 : n] = true;
    });
    return Object.keys(out)
      .map(function (k) {
        return parseInt(k, 10);
      })
      .sort(function (a, b) {
        return a - b;
      });
  }

  function getParts() {
    return fields.map(function (f) {
      return document.getElementById(f.id).value.trim();
    });
  }

  function setParts(parts) {
    fields.forEach(function (f, i) {
      document.getElementById(f.id).value = parts[i] || "*";
    });
  }

  function parsePart(raw, min, max, allowQuestion) {
    var part = (raw || "").trim();
    if (!part) throw new Error("빈 칸이 있습니다.");
    if (part === "?" && allowQuestion) return null;

    var values = {};
    var segments = part.split(",");
    for (var s = 0; s < segments.length; s++) {
      var seg = segments[s].trim();
      if (!seg) throw new Error("쉼표 사이가 비어 있습니다.");

      var step = 1;
      var base = seg;
      if (seg.indexOf("/") !== -1) {
        var slash = seg.split("/");
        if (slash.length !== 2) throw new Error("슬래시(/) 형식이 이상합니다.");
        base = slash[0];
        step = parseInt(slash[1], 10);
        if (!step || step < 1) throw new Error("간격 숫자는 1 이상이어야 합니다.");
      }

      var start;
      var end;
      if (base === "*") {
        start = min;
        end = max;
      } else if (base.indexOf("-") !== -1) {
        var range = base.split("-");
        if (range.length !== 2) throw new Error("범위(-) 형식이 이상합니다.");
        start = parseInt(range[0], 10);
        end = parseInt(range[1], 10);
      } else {
        start = parseInt(base, 10);
        end = parseInt(base, 10);
      }

      if (isNaN(start) || isNaN(end)) throw new Error("숫자가 아닌 값이 있습니다.");
      if (start < min || end > max || start > end) {
        throw new Error(min + "–" + max + " 사이 값만 쓸 수 있습니다.");
      }

      for (var v = start; v <= end; v += step) {
        values[v] = true;
      }
    }

    var list = Object.keys(values)
      .map(function (k) {
        return parseInt(k, 10);
      })
      .sort(function (a, b) {
        return a - b;
      });
    if (!list.length) throw new Error("조건에 맞는 값이 없습니다.");
    return list;
  }

  function describeList(list, kind) {
    if (list.length === kind.max - kind.min + 1) return "매" + kind.unit;

    if (list.length <= 4) {
      return list
        .map(function (n) {
          if (kind.unit === "요일") return WEEK_KO[n] + "요일";
          if (kind.unit === "월") return MONTH_KO[n];
          if (kind.unit === "시") return n + "시";
          if (kind.unit === "분") return n + "분";
          return n + "일";
        })
        .join(", ");
    }

    return list[0] + "–" + list[list.length - 1] + kind.unit + " (간격 " + list.length + "개)";
  }

  function describeStep(raw, kind) {
    if (raw.indexOf("/") === -1) return null;
    var slash = raw.split("/");
    var step = parseInt(slash[1], 10);
    var base = slash[0];
    if (base === "*" && kind.unit === "분") return step + "분마다";
    if (base === "*" && kind.unit === "시") return step + "시간마다";
    return null;
  }

  function buildSummary(parts, parsed) {
    var minRaw = parts[0];
    var hourRaw = parts[1];
    var domRaw = parts[2];
    var monRaw = parts[3];
    var dowRaw = parts[4];

    var minStep = describeStep(minRaw, { unit: "분", max: 59, min: 0 });
    if (minStep && hourRaw === "*" && domRaw === "*" && monRaw === "*" && dowRaw === "*") {
      return minStep + " 실행됩니다.";
    }

    var bits = [];

    if (monRaw !== "*") {
      bits.push(describeList(parsed.months, { unit: "월", min: 1, max: 12 }));
    }
    if (dowRaw !== "*" && domRaw === "*") {
      bits.push(describeList(parsed.dows, { unit: "요일", min: 0, max: 6 }));
    } else if (domRaw !== "*") {
      bits.push(describeList(parsed.days, { unit: "일", min: 1, max: 31 }));
    } else {
      bits.push("매일");
    }

    var timePart = "";
    if (hourRaw === "*" && minRaw === "*") {
      timePart = "매 분";
    } else if (hourRaw === "*") {
      timePart = describeList(parsed.minutes, { unit: "분", min: 0, max: 59 }) + "마다";
    } else {
      var h = parsed.hours;
      var m = parsed.minutes;
      if (h.length === 24 && m.length === 1 && m[0] === 0) {
        timePart = "매시 정각";
      } else if (h.length === 1 && m.length === 1) {
        var hour = h[0];
        var minute = m[0];
        var ampm = hour < 12 ? "오전" : "오후";
        var h12 = hour % 12;
        if (h12 === 0) h12 = 12;
        timePart = ampm + " " + h12 + "시 " + minute + "분";
      } else {
        timePart =
          describeList(h, { unit: "시", min: 0, max: 23 }) +
          " " +
          describeList(m, { unit: "분", min: 0, max: 59 });
      }
    }

    return bits.join(" ") + " " + timePart + "에 실행됩니다.";
  }

  function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function matches(parsed, date) {
    var min = date.getMinutes();
    var hour = date.getHours();
    var dom = date.getDate();
    var mon = date.getMonth() + 1;
    var dow = date.getDay();

    if (parsed.minutes.indexOf(min) === -1) return false;
    if (parsed.hours.indexOf(hour) === -1) return false;
    if (parsed.months.indexOf(mon) === -1) return false;

    var domAll = parsed.days.length === 31;
    var dowAll = parsed.dows.length === 7;

    if (!domAll && !dowAll) {
      return parsed.days.indexOf(dom) !== -1 || parsed.dows.indexOf(dow) !== -1;
    }
    if (!domAll && parsed.days.indexOf(dom) === -1) return false;
    if (!dowAll && parsed.dows.indexOf(dow) === -1) return false;
    return true;
  }

  function nextRuns(parsed, count) {
    var out = [];
    var cursor = new Date();
    cursor.setSeconds(0, 0);
    cursor = new Date(cursor.getTime() + 60000);

    var guard = 0;
    var maxSteps = 366 * 24 * 60;

    while (out.length < count && guard < maxSteps) {
      guard++;
      if (parsed.months.indexOf(cursor.getMonth() + 1) === -1) {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1, 0, 0, 0, 0);
        continue;
      }
      var dim = daysInMonth(cursor.getFullYear(), cursor.getMonth() + 1);
      if (cursor.getDate() > dim) {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1, 0, 0, 0, 0);
        continue;
      }
      if (matches(parsed, cursor)) out.push(new Date(cursor.getTime()));
      cursor = new Date(cursor.getTime() + 60000);
    }
    return out;
  }

  function formatDate(d) {
    var y = d.getFullYear();
    var mo = d.getMonth() + 1;
    var da = d.getDate();
    var h = d.getHours();
    var mi = d.getMinutes();
    var pad = function (n) {
      return n < 10 ? "0" + n : "" + n;
    };
    return (
      y +
      "년 " +
      mo +
      "월 " +
      da +
      "일 (" +
      WEEK_KO[d.getDay()] +
      ") " +
      pad(h) +
      ":" +
      pad(mi)
    );
  }

  function showError(msg) {
    errorEl.hidden = false;
    errorEl.textContent = msg;
    summaryEl.textContent = "표현식을 고쳐 주세요.";
    nextListEl.innerHTML = "";
    nextBlock.hidden = true;
  }

  function clearError() {
    errorEl.hidden = true;
    errorEl.textContent = "";
    nextBlock.hidden = false;
  }

  function refresh() {
    var parts = getParts();
    exprOneEl.textContent = parts.join(" ");

    try {
      var minutes = parsePart(parts[0], 0, 59, false);
      var hours = parsePart(parts[1], 0, 23, false);
      var domRaw = parts[2];
      var days =
        domRaw === "?" || domRaw === "*"
          ? null
          : parsePart(domRaw, 1, 31, false);
      var months = parsePart(parts[3], 1, 12, false);
      var dowsRaw = parts[4];
      var dows =
        dowsRaw === "?" || dowsRaw === "*"
          ? [0, 1, 2, 3, 4, 5, 6]
          : normalizeDow(parsePart(dowsRaw, 0, 7, false));

      if (dowsRaw !== "?" && parts[2] !== "?" && parts[2] !== "*" && dowsRaw !== "*") {
        /* both dom and dow set: OR semantics, ok */
      }

      var allDays = [];
      for (var d = 1; d <= 31; d++) allDays.push(d);

      var parsed = {
        minutes: minutes,
        hours: hours,
        days: days || allDays,
        months: months,
        dows: dows,
      };

      clearError();
      summaryEl.textContent = buildSummary(parts, parsed);

      var runs = nextRuns(parsed, 8);
      nextListEl.innerHTML = "";
      if (!runs.length) {
        var li = document.createElement("li");
        li.textContent = "1년 안에 맞는 시각을 찾지 못했습니다.";
        nextListEl.appendChild(li);
      } else {
        runs.forEach(function (dt, i) {
          var item = document.createElement("li");
          var t = document.createElement("time");
          t.dateTime = dt.toISOString();
          t.textContent = formatDate(dt);
          item.appendChild(t);
          if (i === 0) {
            var tag = document.createElement("span");
            tag.textContent = " · 가장 가까움";
            item.appendChild(tag);
          }
          nextListEl.appendChild(item);
        });
      }
    } catch (e) {
      showError(e.message || "표현식을 읽을 수 없습니다.");
    }
  }

  fields.forEach(function (f) {
    document.getElementById(f.id).addEventListener("input", refresh);
  });

  document.querySelectorAll(".preset").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var cron = btn.getAttribute("data-cron").trim().split(/\s+/);
      if (cron.length !== 5) return;
      setParts(cron);
      refresh();
    });
  });

  refresh();
})();
