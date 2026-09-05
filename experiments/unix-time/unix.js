(function () {
  "use strict";

  var nowDate = document.getElementById("now-date");
  var nowSec = document.getElementById("now-sec");
  var nowMs = document.getElementById("now-ms");
  var tsInput = document.getElementById("ts-input");
  var dateInput = document.getElementById("date-input");
  var timeInput = document.getElementById("time-input");
  var resultBlock = document.getElementById("result-block");
  var outReadable = document.getElementById("out-readable");
  var outSec = document.getElementById("out-sec");
  var outMs = document.getElementById("out-ms");
  var outIso = document.getElementById("out-iso");
  var resultBadge = document.getElementById("result-badge");
  var statusErr = document.getElementById("status-err");
  var statusErrText = document.getElementById("status-err-text");
  var statusOk = document.getElementById("status-ok");
  var statusOkText = document.getElementById("status-ok-text");

  var unitMode = "auto";
  var copyValues = { readable: "", sec: "", ms: "", iso: "" };

  var dateFmt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  var tzName = (function () {
    try {
      var parts = new Intl.DateTimeFormat("ko-KR", { timeZoneName: "short" }).formatToParts(new Date());
      var tz = parts.find(function (p) {
        return p.type === "timeZoneName";
      });
      return tz ? tz.value : "로컬";
    } catch (e) {
      return "로컬";
    }
  })();

  resultBadge.textContent = tzName + " 시간";

  function showError(msg) {
    statusOk.hidden = true;
    statusErrText.textContent = msg;
    statusErr.hidden = false;
    resultBlock.hidden = true;
  }

  function hideError() {
    statusErr.hidden = true;
  }

  function flashOk(text) {
    statusOkText.textContent = text || "복사했습니다.";
    statusOk.hidden = false;
    statusErr.hidden = true;
    window.clearTimeout(flashOk.timer);
    flashOk.timer = window.setTimeout(function () {
      statusOk.hidden = true;
    }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        flashOk("복사했습니다.");
      });
    }
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      flashOk("복사했습니다.");
    } catch (e) {
      showError("복사에 실패했습니다.");
    }
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function formatReadable(date) {
    return dateFmt.format(date);
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function toLocalDatetimeValue(date) {
    return (
      date.getFullYear() +
      "-" +
      pad2(date.getMonth() + 1) +
      "-" +
      pad2(date.getDate())
    );
  }

  function toLocalTimeValue(date) {
    return pad2(date.getHours()) + ":" + pad2(date.getMinutes()) + ":" + pad2(date.getSeconds());
  }

  function showResults(date) {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      showError("날짜를 만들 수 없습니다.");
      return;
    }

    var ms = date.getTime();
    var sec = Math.floor(ms / 1000);

    outReadable.textContent = formatReadable(date);
    outSec.textContent = String(sec);
    outMs.textContent = String(ms);
    outIso.textContent = date.toISOString();

    copyValues.readable = outReadable.textContent;
    copyValues.sec = outSec.textContent;
    copyValues.ms = outMs.textContent;
    copyValues.iso = outIso.textContent;

    hideError();
    resultBlock.hidden = false;
  }

  function parseTimestamp(raw, unit) {
    var cleaned = String(raw || "")
      .trim()
      .replace(/[,_\s]/g, "");
    if (!/^-?\d+(\.\d+)?$/.test(cleaned)) {
      return { error: "숫자만 넣어 주세요." };
    }

    var num = Number(cleaned);
    if (!isFinite(num)) {
      return { error: "숫자가 너무 큽니다." };
    }

    var ms;
    if (unit === "sec") {
      ms = num * 1000;
    } else if (unit === "ms") {
      ms = num;
    } else {
      var abs = Math.abs(num);
      var digits = String(Math.trunc(abs)).length;
      if (digits <= 10) {
        ms = num * 1000;
      } else if (digits <= 13) {
        ms = num;
      } else {
        return { error: "10자리(초) 또는 13자리(밀리초) 숫자를 넣어 주세요." };
      }
    }

    var date = new Date(ms);
    if (isNaN(date.getTime())) {
      return { error: "이 숫자로는 날짜를 만들 수 없습니다." };
    }
    return { date: date };
  }

  function updateNow() {
    var now = new Date();
    nowDate.textContent = formatReadable(now);
    nowSec.textContent = String(Math.floor(now.getTime() / 1000));
    nowMs.textContent = String(now.getTime());
  }

  function convertToDate() {
    var parsed = parseTimestamp(tsInput.value, unitMode);
    if (parsed.error) {
      showError(parsed.error);
      return;
    }
    showResults(parsed.date);
  }

  function convertToTs() {
    if (!dateInput.value) {
      showError("날짜를 고르세요.");
      return;
    }
    var timePart = timeInput.value || "00:00:00";
    var date = new Date(dateInput.value + "T" + timePart);
    if (isNaN(date.getTime())) {
      showError("날짜·시각 형식을 확인해 주세요.");
      return;
    }
    showResults(date);
  }

  function fillNowToInput() {
    var now = new Date();
    tsInput.value = String(Math.floor(now.getTime() / 1000));
    convertToDate();
  }

  function fillNowToDatetime() {
    var now = new Date();
    dateInput.value = toLocalDatetimeValue(now);
    timeInput.value = toLocalTimeValue(now);
    convertToTs();
  }

  function setupTabs() {
    var tabs = document.querySelectorAll(".tab");
    var panels = document.querySelectorAll(".tab-panel");

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var targetId = tab.getAttribute("aria-controls");
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach(function (panel) {
          var on = panel.id === targetId;
          panel.classList.toggle("active", on);
          panel.hidden = !on;
        });
        hideError();
      });
    });
  }

  function setupUnitChips() {
    document.querySelectorAll(".unit-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        unitMode = chip.getAttribute("data-unit");
        document.querySelectorAll(".unit-chip").forEach(function (c) {
          var on = c === chip;
          c.classList.toggle("active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        if (tsInput.value.trim()) convertToDate();
      });
    });
  }

  document.getElementById("convert-to-date-btn").addEventListener("click", convertToDate);
  document.getElementById("convert-to-ts-btn").addEventListener("click", convertToTs);
  document.getElementById("now-to-input-btn").addEventListener("click", fillNowToInput);
  document.getElementById("now-to-datetime-btn").addEventListener("click", fillNowToDatetime);
  document.getElementById("now-copy-sec").addEventListener("click", function () {
    copyText(nowSec.textContent);
  });

  document.getElementById("sample-ts-btn").addEventListener("click", function () {
    tsInput.value = "1725523200";
    convertToDate();
  });

  tsInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") convertToDate();
  });

  tsInput.addEventListener("input", function () {
    if (tsInput.value.trim()) convertToDate();
    else {
      hideError();
      resultBlock.hidden = true;
    }
  });

  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var kind = btn.getAttribute("data-copy");
      copyText(copyValues[kind] || "");
    });
  });

  setupTabs();
  setupUnitChips();
  updateNow();
  window.setInterval(updateNow, 1000);

  tsInput.value = String(Math.floor(Date.now() / 1000));
  convertToDate();
})();
