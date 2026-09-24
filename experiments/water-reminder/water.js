(function () {
  "use strict";

  var STORAGE_KEY = "kswany-water-reminder-v1";
  var tickId = null;
  var alerting = false;

  var el = {
    goalCups: document.getElementById("goal-cups"),
    goalCupsVal: document.getElementById("goal-cups-val"),
    intervalMin: document.getElementById("interval-min"),
    intervalMinVal: document.getElementById("interval-min-val"),
    countdown: document.getElementById("countdown"),
    timerStatus: document.getElementById("timer-status"),
    toggleTimer: document.getElementById("toggle-timer"),
    resetTimer: document.getElementById("reset-timer"),
    cupGrid: document.getElementById("cup-grid"),
    drunkCount: document.getElementById("drunk-count"),
    goalDisplay: document.getElementById("goal-display"),
    addCup: document.getElementById("add-cup"),
    undoCup: document.getElementById("undo-cup"),
    resetDay: document.getElementById("reset-day"),
    timerCard: document.querySelector(".timer-card"),
    presets: document.querySelectorAll(".preset[data-interval]"),
  };

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* ignore */
    }
    return {
      goalCups: 8,
      intervalMin: 60,
      timerOn: false,
      nextAt: null,
      dayKey: todayKey(),
      drunk: 0,
    };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  var state = loadState();

  function resetDayIfNeeded() {
    var key = todayKey();
    if (state.dayKey !== key) {
      state.dayKey = key;
      state.drunk = 0;
      saveState(state);
    }
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatRemain(ms) {
    if (ms <= 0) return "00:00";
    var totalSec = Math.ceil(ms / 1000);
    var h = Math.floor(totalSec / 3600);
    var m = Math.floor((totalSec % 3600) / 60);
    var s = totalSec % 60;
    if (h > 0) return h + ":" + pad(m) + ":" + pad(s);
    return pad(m) + ":" + pad(s);
  }

  function cupSvg() {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M8 2h8l-1 10a4 4 0 0 1-8 0L8 2z"/>' +
      '<path d="M12 12v6"/>' +
      '<path d="M8 22h8"/>' +
      "</svg>"
    );
  }

  function renderCups() {
    el.cupGrid.innerHTML = "";
    var goal = state.goalCups;
    el.goalDisplay.textContent = String(goal);
    el.drunkCount.textContent = String(state.drunk);

    for (var i = 0; i < goal; i++) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cup-btn" + (i < state.drunk ? " filled" : "");
      btn.setAttribute("role", "listitem");
      btn.setAttribute("aria-label", i + 1 + "번째 잔" + (i < state.drunk ? ", 마심" : ", 비어 있음"));
      btn.innerHTML = cupSvg() + "<span>" + (i + 1) + "</span>";
      (function (index) {
        btn.addEventListener("click", function () {
          if (index + 1 === state.drunk) {
            state.drunk = index;
          } else if (index === state.drunk) {
            state.drunk = index + 1;
          } else if (index < state.drunk) {
            state.drunk = index;
          } else {
            state.drunk = index + 1;
          }
          saveState(state);
          renderCups();
        });
      })(i);
      el.cupGrid.appendChild(btn);
    }
  }

  function syncInputs() {
    el.goalCups.value = String(state.goalCups);
    el.goalCupsVal.textContent = String(state.goalCups);
    el.intervalMin.value = String(state.intervalMin);
    el.intervalMinVal.textContent = String(state.intervalMin);
    el.presets.forEach(function (btn) {
      var v = Number(btn.getAttribute("data-interval"));
      btn.classList.toggle("active", v === state.intervalMin);
    });
  }

  function scheduleNextFromNow() {
    state.nextAt = Date.now() + state.intervalMin * 60 * 1000;
    saveState(state);
    clearAlert();
  }

  function clearAlert() {
    alerting = false;
    el.timerCard.classList.remove("alerting");
  }

  function playBeep() {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      /* ignore */
    }
  }

  function fireAlert() {
    alerting = true;
    el.timerCard.classList.add("alerting");
    el.timerStatus.textContent = "물 한 잔 마실 시간이에요! 잔을 눌러 기록하거나 알림을 확인하세요.";
    el.countdown.textContent = "지금!";
    playBeep();
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("물 마시기 알림", {
          body: "목표 " + state.goalCups + "잔 중 " + state.drunk + "잔 — 한 잔 마실까요?",
          tag: "water-reminder",
        });
      } catch (e) {
        /* ignore */
      }
    }
  }

  function updateTimerUi() {
    resetDayIfNeeded();
    if (!state.timerOn) {
      el.countdown.textContent = "—";
      el.timerStatus.textContent = "알림을 켜면 설정한 간격마다 알려 드립니다.";
      el.toggleTimer.textContent = "알림 켜기";
      el.toggleTimer.classList.remove("running");
      return;
    }
    el.toggleTimer.textContent = "알림 끄기";
    el.toggleTimer.classList.add("running");
    if (!state.nextAt) {
      scheduleNextFromNow();
    }
    var remain = state.nextAt - Date.now();
    if (remain <= 0 && !alerting) {
      fireAlert();
      return;
    }
    if (alerting) {
      el.countdown.textContent = "지금!";
      return;
    }
    el.countdown.textContent = formatRemain(remain);
    el.timerStatus.textContent =
      "오늘 " +
      state.drunk +
      "/" +
      state.goalCups +
      "잔 · 간격 " +
      state.intervalMin +
      "분 · 탭을 열어 두면 알림이 울립니다.";
  }

  function startTick() {
    if (tickId) return;
    tickId = setInterval(updateTimerUi, 500);
  }

  function stopTick() {
    if (tickId) {
      clearInterval(tickId);
      tickId = null;
    }
  }

  el.goalCups.addEventListener("input", function () {
    state.goalCups = Number(el.goalCups.value);
    el.goalCupsVal.textContent = String(state.goalCups);
    if (state.drunk > state.goalCups) state.drunk = state.goalCups;
    saveState(state);
    renderCups();
  });

  el.intervalMin.addEventListener("input", function () {
    state.intervalMin = Number(el.intervalMin.value);
    el.intervalMinVal.textContent = String(state.intervalMin);
    el.presets.forEach(function (btn) {
      var v = Number(btn.getAttribute("data-interval"));
      btn.classList.toggle("active", v === state.intervalMin);
    });
    saveState(state);
    if (state.timerOn) scheduleNextFromNow();
    updateTimerUi();
  });

  el.presets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      state.intervalMin = Number(btn.getAttribute("data-interval"));
      el.intervalMin.value = String(state.intervalMin);
      el.intervalMinVal.textContent = String(state.intervalMin);
      el.presets.forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      saveState(state);
      if (state.timerOn) scheduleNextFromNow();
      updateTimerUi();
    });
  });

  el.toggleTimer.addEventListener("click", function () {
    if (!state.timerOn) {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().then(function () {
          /* continue regardless */
        });
      }
      state.timerOn = true;
      scheduleNextFromNow();
    } else {
      state.timerOn = false;
      state.nextAt = null;
      clearAlert();
    }
    saveState(state);
    updateTimerUi();
  });

  el.resetTimer.addEventListener("click", function () {
    if (!state.timerOn) return;
    scheduleNextFromNow();
    updateTimerUi();
  });

  el.addCup.addEventListener("click", function () {
    if (state.drunk < state.goalCups) {
      state.drunk += 1;
      saveState(state);
      renderCups();
    }
    if (alerting && state.timerOn) {
      scheduleNextFromNow();
      updateTimerUi();
    }
  });

  el.undoCup.addEventListener("click", function () {
    if (state.drunk > 0) {
      state.drunk -= 1;
      saveState(state);
      renderCups();
    }
  });

  el.resetDay.addEventListener("click", function () {
    state.drunk = 0;
    saveState(state);
    renderCups();
  });

  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) updateTimerUi();
  });

  resetDayIfNeeded();
  syncInputs();
  renderCups();
  updateTimerUi();
  startTick();
})();
