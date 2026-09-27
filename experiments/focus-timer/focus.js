(function () {
  "use strict";

  var STORAGE_KEY = "kswany-focus-timer-v1";
  var RING_LEN = 2 * Math.PI * 52;
  var tickId = null;

  var el = {
    stage: document.getElementById("timer-stage"),
    ring: document.getElementById("ring-progress"),
    phaseLabel: document.getElementById("phase-label"),
    timeMain: document.getElementById("time-main"),
    timeSub: document.getElementById("time-sub"),
    btnToggle: document.getElementById("btn-toggle"),
    btnSkip: document.getElementById("btn-skip"),
    btnReset: document.getElementById("btn-reset"),
    workMin: document.getElementById("work-min"),
    workMinVal: document.getElementById("work-min-val"),
    breakMin: document.getElementById("break-min"),
    breakMinVal: document.getElementById("break-min-val"),
    soundOn: document.getElementById("sound-on"),
    statToday: document.getElementById("stat-today"),
    statWeek: document.getElementById("stat-week"),
    tabs: document.querySelectorAll(".mode-tab"),
  };

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function weekKey() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    var yearStart = new Date(d.getFullYear(), 0, 1);
    var week = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return d.getFullYear() + "-W" + String(week).padStart(2, "0");
  }

  function defaultState() {
    return {
      mode: "work",
      running: false,
      endsAt: null,
      remainingMs: null,
      workMin: 25,
      breakMin: 5,
      sound: true,
      dayKey: todayKey(),
      weekKey: weekKey(),
      todayCount: 0,
      weekCount: 0,
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        return Object.assign(defaultState(), parsed);
      }
    } catch (e) {
      /* ignore */
    }
    return defaultState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  var state = loadState();

  function rollCountersIfNeeded() {
    var dk = todayKey();
    var wk = weekKey();
    var changed = false;
    if (state.dayKey !== dk) {
      state.dayKey = dk;
      state.todayCount = 0;
      changed = true;
    }
    if (state.weekKey !== wk) {
      state.weekKey = wk;
      state.weekCount = 0;
      changed = true;
    }
    if (changed) saveState();
  }

  function durationMs(mode) {
    var min = mode === "work" ? state.workMin : state.breakMin;
    return min * 60 * 1000;
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function formatMs(ms) {
    var total = Math.max(0, Math.ceil(ms / 1000));
    var m = Math.floor(total / 60);
    var s = total % 60;
    return pad(m) + ":" + pad(s);
  }

  function setRing(progress) {
    var p = Math.min(1, Math.max(0, progress));
    el.ring.style.strokeDasharray = String(RING_LEN);
    el.ring.style.strokeDashoffset = String(RING_LEN * (1 - p));
  }

  function updateStatsUi() {
    el.statToday.textContent = String(state.todayCount);
    el.statWeek.textContent = String(state.weekCount);
  }

  function syncSettingsUi() {
    el.workMin.value = String(state.workMin);
    el.workMinVal.textContent = String(state.workMin);
    el.breakMin.value = String(state.breakMin);
    el.breakMinVal.textContent = String(state.breakMin);
    el.soundOn.checked = state.sound;
  }

  function setMode(mode, resetTime) {
    state.mode = mode;
    el.stage.setAttribute("data-mode", mode);
    el.tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-mode") === mode;
      tab.classList.toggle("active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    el.phaseLabel.textContent = mode === "work" ? "집중 시간" : "휴식 시간";
    if (resetTime || !state.running) {
      state.endsAt = null;
      state.remainingMs = durationMs(mode);
    }
    render();
  }

  function render() {
    rollCountersIfNeeded();
    var total = durationMs(state.mode);
    var remain = state.remainingMs;
    if (state.running && state.endsAt) {
      remain = state.endsAt - Date.now();
      if (remain <= 0) {
        remain = 0;
      }
    }
    if (remain == null) remain = total;

    el.timeMain.textContent = formatMs(remain);
    setRing(total > 0 ? remain / total : 0);

    el.stage.classList.toggle("running", state.running);

    if (state.running) {
      el.btnToggle.textContent = "일시정지";
      el.timeSub.textContent = state.mode === "work" ? "집중 중입니다. 잠시만 더!" : "휴식 중입니다. 스트레칭해 보세요.";
    } else {
      el.btnToggle.textContent = remain < total && remain > 0 ? "계속" : "시작";
      el.timeSub.textContent =
        state.mode === "work"
          ? state.workMin + "분 집중 후 " + state.breakMin + "분 휴식으로 넘어갑니다."
          : "휴식이 끝나면 다시 집중 시간으로 돌아갑니다.";
    }

    updateStatsUi();
    document.title = formatMs(remain) + " · 집중 타이머 — kswany";
  }

  function stopTick() {
    if (tickId) {
      clearInterval(tickId);
      tickId = null;
    }
  }

  function startTick() {
    stopTick();
    tickId = setInterval(function () {
      if (!state.running) return;
      if (state.endsAt && Date.now() >= state.endsAt) {
        onPhaseComplete();
        return;
      }
      render();
    }, 250);
  }

  function playBeep() {
    if (!state.sound) return;
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = state.mode === "work" ? 880 : 660;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      /* ignore */
    }
  }

  function onPhaseComplete() {
    stopTick();
    state.running = false;
    state.endsAt = null;
    state.remainingMs = 0;
    playBeep();

    if (state.mode === "work") {
      state.todayCount += 1;
      state.weekCount += 1;
      saveState();
      setMode("break", true);
      el.timeSub.textContent = "집중 한 세트를 마쳤어요. 잠깐 쉬어 가세요.";
    } else {
      setMode("work", true);
      el.timeSub.textContent = "휴식이 끝났어요. 다시 집중해 볼까요?";
    }
    render();
  }

  function startTimer() {
    if (state.running) return;
    var remain = state.remainingMs != null ? state.remainingMs : durationMs(state.mode);
    if (remain <= 0) remain = durationMs(state.mode);
    state.remainingMs = remain;
    state.endsAt = Date.now() + remain;
    state.running = true;
    saveState();
    startTick();
    render();
  }

  function pauseTimer() {
    if (!state.running) return;
    if (state.endsAt) {
      state.remainingMs = Math.max(0, state.endsAt - Date.now());
    }
    state.running = false;
    state.endsAt = null;
    stopTick();
    saveState();
    render();
  }

  function resetTimer() {
    stopTick();
    state.running = false;
    state.endsAt = null;
    state.remainingMs = durationMs(state.mode);
    saveState();
    render();
  }

  function skipPhase() {
    var wasWork = state.mode === "work";
    stopTick();
    state.running = false;
    state.endsAt = null;
    setMode(wasWork ? "break" : "work", true);
    saveState();
    render();
  }

  el.btnToggle.addEventListener("click", function () {
    if (state.running) pauseTimer();
    else startTimer();
  });

  el.btnReset.addEventListener("click", resetTimer);

  el.btnSkip.addEventListener("click", function () {
    if (state.running) pauseTimer();
    skipPhase();
  });

  el.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      if (state.running) pauseTimer();
      setMode(tab.getAttribute("data-mode"), true);
      saveState();
    });
  });

  function onSettingChange() {
    if (state.running) pauseTimer();
    state.workMin = Number(el.workMin.value);
    state.breakMin = Number(el.breakMin.value);
    el.workMinVal.textContent = String(state.workMin);
    el.breakMinVal.textContent = String(state.breakMin);
    state.remainingMs = durationMs(state.mode);
    saveState();
    render();
  }

  el.workMin.addEventListener("input", onSettingChange);
  el.breakMin.addEventListener("input", onSettingChange);

  el.soundOn.addEventListener("change", function () {
    state.sound = el.soundOn.checked;
    saveState();
  });

  el.ring.style.strokeDasharray = String(RING_LEN);
  syncSettingsUi();
  setMode(state.mode, !state.running && state.remainingMs == null);
  if (state.running && state.endsAt) {
    if (Date.now() >= state.endsAt) onPhaseComplete();
    else startTick();
  } else if (state.remainingMs != null && !state.running) {
    render();
  } else {
    state.remainingMs = durationMs(state.mode);
    render();
  }
})();
