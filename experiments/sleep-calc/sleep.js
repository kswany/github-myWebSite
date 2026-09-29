(function () {
  "use strict";

  var CYCLE_MIN = 90;
  var FALL_ASLEEP_MIN = 15;
  var ADULT_MIN = 7 * 60;
  var ADULT_MAX = 9 * 60;

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function parseTime(str) {
    if (!str) return null;
    var parts = str.split(":");
    if (parts.length < 2) return null;
    var h = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  }

  function formatTime12(minOfDay) {
    var m = ((minOfDay % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60);
    var min = m % 60;
    var ap = h >= 12 ? "오후" : "오전";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return ap + " " + h12 + ":" + pad2(min);
  }

  function formatDuration(totalMin) {
    var h = Math.floor(totalMin / 60);
    var m = totalMin % 60;
    if (h === 0) return m + "분";
    if (m === 0) return h + "시간";
    return h + "시간 " + m + "분";
  }

  function sleepMinutes(bedMin, wakeMin) {
    if (bedMin == null || wakeMin == null) return null;
    var diff = wakeMin - bedMin;
    if (diff <= 0) diff += 1440;
    return diff;
  }

  function qualityClass(minutes) {
    if (minutes < ADULT_MIN) return "warn";
    if (minutes <= ADULT_MAX) return "good";
    return "";
  }

  function qualityMessage(minutes) {
    if (minutes < 5 * 60) return "너무 짧아요. 낮잠이나 보충 수면이 필요할 수 있어요.";
    if (minutes < ADULT_MIN) return "성인 권장(7~9시간)보다 조금 짧아요. 가능하면 일찍 자 보세요.";
    if (minutes <= ADULT_MAX) return "성인 권장 범위 안에 들어와요. 좋은 편이에요.";
    if (minutes <= 10 * 60) return "9시간을 넘었어요. 몸 상태에 맞게 조절해 보세요.";
    return "꽤 긴 수면이에요. 과도한 피로 회복일 수 있어요.";
  }

  function updateDuration() {
    var bed = parseTime(document.getElementById("bed-time").value);
    var wake = parseTime(document.getElementById("wake-time").value);
    var hero = document.getElementById("duration-hero");
    var main = document.getElementById("duration-main");
    var sub = document.getElementById("duration-sub");
    var kicker = document.getElementById("duration-kicker");

    if (bed == null || wake == null) {
      hero.className = "result-hero";
      kicker.textContent = "시각을 고르세요";
      main.textContent = "-";
      sub.textContent = "잠든 시각과 일어난 시각을 넣으면 수면 길이를 계산합니다.";
      return;
    }

    var mins = sleepMinutes(bed, wake);
    hero.className = "result-hero " + qualityClass(mins);
    kicker.textContent = formatTime12(bed) + " ~ " + formatTime12(wake);
    main.textContent = formatDuration(mins);
    sub.textContent = qualityMessage(mins);
  }

  function buildCycles(wakeMin) {
    var list = document.getElementById("cycle-list");
    list.innerHTML = "";
    if (wakeMin == null) return;

    var cycles = [6, 5, 4, 3];
    var bestIdx = 1;

    cycles.forEach(function (n, idx) {
      var sleepMin = n * CYCLE_MIN + FALL_ASLEEP_MIN;
      var bedMin = wakeMin - sleepMin;
      var li = document.createElement("li");
      li.className = "cycle-item" + (idx === bestIdx ? " recommended" : "");

      var left = document.createElement("span");
      left.className = "cycle-bed";
      left.textContent = formatTime12(bedMin) + " 에 자기";

      var right = document.createElement("span");
      right.className = "cycle-meta";
      var hours = document.createElement("span");
      hours.className = "cycle-hours";
      hours.textContent = formatDuration(sleepMin);
      var label = document.createElement("span");
      label.className = "cycle-label";
      if (idx === bestIdx) {
        label.textContent = "추천 · " + n + "주기";
      } else {
        label.textContent = n + "주기 (90분 × " + n + ")";
      }
      right.appendChild(hours);
      right.appendChild(label);

      li.appendChild(left);
      li.appendChild(right);
      list.appendChild(li);
    });
  }

  function updateCycles() {
    var wake = parseTime(document.getElementById("target-wake").value);
    buildCycles(wake);
  }

  function setMode(mode) {
    document.querySelectorAll(".mode-tab").forEach(function (btn) {
      var on = btn.getAttribute("data-mode") === mode;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.getElementById("panel-duration").hidden = mode !== "duration";
    document.getElementById("panel-cycles").hidden = mode !== "cycles";
  }

  function setPresets() {
    document.querySelectorAll("[data-preset-bed]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.getElementById("bed-time").value = btn.getAttribute("data-preset-bed");
        document.getElementById("wake-time").value = btn.getAttribute("data-preset-wake");
        updateDuration();
      });
    });
    document.querySelectorAll("[data-preset-wake]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.getElementById("target-wake").value = btn.getAttribute("data-preset-wake");
        updateCycles();
      });
    });
  }

  function initDefaults() {
    var now = new Date();
    var wakeDefault = new Date(now);
    wakeDefault.setHours(7, 0, 0, 0);
    if (now.getHours() >= 10) wakeDefault.setDate(wakeDefault.getDate() + 1);

    document.getElementById("target-wake").value = pad2(wakeDefault.getHours()) + ":" + pad2(wakeDefault.getMinutes());

    var bed = new Date(wakeDefault.getTime() - (7 * 60 + 30) * 60000);
    document.getElementById("bed-time").value = pad2(bed.getHours()) + ":" + pad2(bed.getMinutes());
    document.getElementById("wake-time").value = pad2(wakeDefault.getHours()) + ":" + pad2(wakeDefault.getMinutes());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initDefaults();

    document.querySelectorAll(".mode-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setMode(btn.getAttribute("data-mode"));
      });
    });

    document.getElementById("bed-time").addEventListener("change", updateDuration);
    document.getElementById("wake-time").addEventListener("change", updateDuration);
    document.getElementById("target-wake").addEventListener("change", updateCycles);

    setPresets();
    updateDuration();
    updateCycles();
  });
})();
