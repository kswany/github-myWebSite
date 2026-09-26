(function () {
  "use strict";

  var STORAGE_KEY = "kswany-bmi-tracker-v1";
  var LOG_KEY = "kswany-bmi-log-v1";

  var heightRange = document.getElementById("height-cm");
  var heightNum = document.getElementById("height-num");
  var weightRange = document.getElementById("weight-kg");
  var weightNum = document.getElementById("weight-num");
  var targetRange = document.getElementById("target-kg");
  var targetNum = document.getElementById("target-num");
  var weeklyRate = document.getElementById("weekly-rate");
  var weeklyRateVal = document.getElementById("weekly-rate-val");
  var bmiValue = document.getElementById("bmi-value");
  var bmiLabel = document.getElementById("bmi-label");
  var bmiBarFill = document.getElementById("bmi-bar-fill");
  var goalDiff = document.getElementById("goal-diff");
  var etaText = document.getElementById("eta-text");
  var etaDate = document.getElementById("eta-date");
  var logList = document.getElementById("log-list");
  var logEmpty = document.getElementById("log-empty");
  var presets = document.querySelectorAll(".preset[data-rate]");

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function loadSettings() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data.height) setPair(heightRange, heightNum, data.height);
      if (data.weight) setPair(weightRange, weightNum, data.weight);
      if (data.target) setPair(targetRange, targetNum, data.target);
      if (data.rate) {
        weeklyRate.value = data.rate;
        weeklyRateVal.textContent = Number(data.rate).toFixed(1);
        syncPresets(Number(data.rate));
      }
    } catch (e) {
      /* ignore */
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          height: Number(heightNum.value),
          weight: Number(weightNum.value),
          target: Number(targetNum.value),
          rate: Number(weeklyRate.value),
        })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function setPair(range, num, value) {
    var v = clamp(Number(value), Number(range.min), Number(range.max));
    range.value = v;
    num.value = v;
  }

  function linkPair(range, num, onChange) {
    range.addEventListener("input", function () {
      num.value = range.value;
      onChange();
    });
    num.addEventListener("change", function () {
      var v = clamp(Number(num.value), Number(range.min), Number(range.max));
      if (Number.isNaN(v)) v = Number(range.value);
      range.value = v;
      num.value = v;
      onChange();
    });
  }

  function bmiCategory(bmi) {
    if (bmi < 18.5) return { text: "저체중", tone: "low" };
    if (bmi < 23) return { text: "정상", tone: "ok" };
    if (bmi < 25) return { text: "과체중", tone: "warn" };
    return { text: "비만", tone: "high" };
  }

  function formatBmiBar(bmi) {
    var min = 15;
    var max = 35;
    var pct = ((bmi - min) / (max - min)) * 100;
    return clamp(pct, 4, 100);
  }

  function formatDateKr(d) {
    return (
      d.getFullYear() +
      "년 " +
      (d.getMonth() + 1) +
      "월 " +
      d.getDate() +
      "일"
    );
  }

  function recalc() {
    var h = Number(heightNum.value) / 100;
    var w = Number(weightNum.value);
    var target = Number(targetNum.value);
    var rate = Number(weeklyRate.value);

    if (!h || !w) return;

    var bmi = w / (h * h);
    var cat = bmiCategory(bmi);
    bmiValue.textContent = bmi.toFixed(1);
    bmiLabel.textContent = cat.text + " 구간 (참고)";
    bmiBarFill.style.width = formatBmiBar(bmi) + "%";

    var diff = w - target;
    var absDiff = Math.abs(diff);
    if (absDiff < 0.05) {
      goalDiff.textContent = "목표와 같음";
      etaText.textContent = "이미 목표 몸무게와 거의 같습니다. 유지에 집중해 보세요.";
      etaDate.textContent = "";
    } else if (diff > 0) {
      goalDiff.textContent = absDiff.toFixed(1) + " kg 감량 필요";
      var weeks = absDiff / rate;
      var days = Math.ceil(weeks * 7);
      etaText.textContent =
        "주당 " +
        rate.toFixed(1) +
        " kg씩 줄이면 대략 " +
        weeks.toFixed(1) +
        "주(약 " +
        days +
        "일) 걸립니다.";
      var finish = new Date();
      finish.setDate(finish.getDate() + days);
      etaDate.textContent = "오늘부터라면 대략 " + formatDateKr(finish) + " 무렵 목표에 도달.";
    } else {
      goalDiff.textContent = absDiff.toFixed(1) + " kg 증량 필요";
      var weeksGain = absDiff / rate;
      var daysGain = Math.ceil(weeksGain * 7);
      etaText.textContent =
        "주당 " +
        rate.toFixed(1) +
        " kg씩 늘리면 대략 " +
        weeksGain.toFixed(1) +
        "주(약 " +
        daysGain +
        "일) 걸립니다.";
      var finishGain = new Date();
      finishGain.setDate(finishGain.getDate() + daysGain);
      etaDate.textContent = "오늘부터라면 대략 " + formatDateKr(finishGain) + " 무렵 목표에 도달.";
    }

    saveSettings();
  }

  function syncPresets(rate) {
    presets.forEach(function (btn) {
      var r = Number(btn.getAttribute("data-rate"));
      btn.classList.toggle("active", Math.abs(r - rate) < 0.05);
    });
  }

  weeklyRate.addEventListener("input", function () {
    weeklyRateVal.textContent = Number(weeklyRate.value).toFixed(1);
    syncPresets(Number(weeklyRate.value));
    recalc();
  });

  presets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var r = Number(btn.getAttribute("data-rate"));
      weeklyRate.value = r;
      weeklyRateVal.textContent = r.toFixed(1);
      syncPresets(r);
      recalc();
    });
  });

  function readLog() {
    try {
      var raw = localStorage.getItem(LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function writeLog(entries) {
    try {
      localStorage.setItem(LOG_KEY, JSON.stringify(entries.slice(0, 30)));
    } catch (e) {
      /* ignore */
    }
  }

  function renderLog() {
    var entries = readLog();
    logList.querySelectorAll(".log-item").forEach(function (el) {
      el.remove();
    });
    if (!entries.length) {
      logEmpty.hidden = false;
      return;
    }
    logEmpty.hidden = true;
    entries.forEach(function (entry) {
      var li = document.createElement("li");
      li.className = "log-item";
      var time = document.createElement("time");
      time.dateTime = entry.date;
      time.textContent = entry.date.replace(/-/g, ".");
      var strong = document.createElement("strong");
      strong.textContent = entry.weight.toFixed(1) + " kg";
      li.appendChild(time);
      li.appendChild(strong);
      logList.appendChild(li);
    });
  }

  document.getElementById("save-weight").addEventListener("click", function () {
    var today = new Date();
    var key =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");
    var w = Number(weightNum.value);
    var entries = readLog().filter(function (e) {
      return e.date !== key;
    });
    entries.unshift({ date: key, weight: w });
    writeLog(entries);
    renderLog();
  });

  document.getElementById("clear-log").addEventListener("click", function () {
    if (!readLog().length) return;
    if (!window.confirm("저장한 체중 기록을 모두 지울까요?")) return;
    writeLog([]);
    renderLog();
  });

  linkPair(heightRange, heightNum, recalc);
  linkPair(weightRange, weightNum, recalc);
  linkPair(targetRange, targetNum, recalc);

  loadSettings();
  recalc();
  renderLog();
})();
