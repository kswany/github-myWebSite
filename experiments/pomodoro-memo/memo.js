(function () {
  "use strict";

  var STORAGE_KEY = "kswany-pomodoro-memo-v1";
  var RING_LEN = 2 * Math.PI * 52;
  var tickId = null;
  var pendingBreak = false;

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
    statMemos: document.getElementById("stat-memos"),
    memoList: document.getElementById("memo-list"),
    memoEmpty: document.getElementById("memo-empty"),
    overlay: document.getElementById("memo-overlay"),
    memoInput: document.getElementById("memo-input"),
    memoChar: document.getElementById("memo-char"),
    memoBadge: document.getElementById("memo-badge"),
    memoSave: document.getElementById("memo-save"),
    memoSkip: document.getElementById("memo-skip"),
    tabs: document.querySelectorAll(".mode-tab"),
  };

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
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
      todayCycles: 0,
      memos: [],
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        var base = defaultState();
        if (!Array.isArray(parsed.memos)) parsed.memos = [];
        return Object.assign(base, parsed);
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

  function rollDayIfNeeded() {
    var dk = todayKey();
    if (state.dayKey !== dk) {
      state.dayKey = dk;
      state.todayCycles = 0;
      state.memos = state.memos.filter(function (m) {
        return m.dayKey === dk;
      });
      saveState();
    }
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

  function playEndSound() {
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

  function syncTabs() {
    el.tabs.forEach(function (tab) {
      var isWork = tab.getAttribute("data-mode") === "work";
      var active = (isWork && state.mode === "work") || (!isWork && state.mode === "break");
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    el.stage.setAttribute("data-mode", state.mode);
    el.phaseLabel.textContent = state.mode === "work" ? "집중 시간" : "휴식 시간";
  }

  function remainingNow() {
    if (state.running && state.endsAt) {
      return Math.max(0, state.endsAt - Date.now());
    }
    if (state.remainingMs != null) return state.remainingMs;
    return durationMs(state.mode);
  }

  function progressRatio() {
    var total = durationMs(state.mode);
    var rem = remainingNow();
    return 1 - rem / total;
  }

  function updateUi() {
    rollDayIfNeeded();
    syncTabs();
    var rem = remainingNow();
    el.timeMain.textContent = formatMs(rem);
    setRing(progressRatio());

    if (state.running) {
      el.stage.classList.add("running");
      el.btnToggle.textContent = "일시정지";
      el.timeSub.textContent = state.mode === "work" ? "집중 중입니다." : "잠깐 쉬어 가세요.";
    } else {
      el.stage.classList.remove("running");
      el.btnToggle.textContent = "시작";
      if (pendingBreak) {
        el.timeSub.textContent = "회고를 저장하면 휴식으로 넘어갑니다.";
      } else if (rem <= 0) {
        el.timeSub.textContent = "시작을 눌러 다음 사이클을 돌려 보세요.";
      } else {
        el.timeSub.textContent = "시작을 누르면 타이머가 돌아갑니다.";
      }
    }

    el.workMin.value = String(state.workMin);
    el.workMinVal.textContent = String(state.workMin);
    el.breakMin.value = String(state.breakMin);
    el.breakMinVal.textContent = String(state.breakMin);
    el.soundOn.checked = state.sound;

    el.statToday.textContent = String(state.todayCycles);
    var todayMemos = state.memos.filter(function (m) {
      return m.dayKey === todayKey();
    });
    el.statMemos.textContent = String(todayMemos.filter(function (m) {
      return m.text;
    }).length);
    renderMemoList(todayMemos);
  }

  function formatTime(iso) {
    var d = new Date(iso);
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  }

  function renderMemoList(items) {
    el.memoList.innerHTML = "";
    var sorted = items.slice().sort(function (a, b) {
      return b.at - a.at;
    });
    if (!sorted.length) {
      el.memoEmpty.hidden = false;
      return;
    }
    el.memoEmpty.hidden = true;
    sorted.forEach(function (item) {
      var li = document.createElement("li");
      var time = document.createElement("time");
      time.dateTime = new Date(item.at).toISOString();
      time.textContent = formatTime(item.at);
      li.appendChild(time);
      var p = document.createElement("p");
      if (item.text) {
        p.textContent = item.text;
      } else {
        p.className = "memo-skip-tag";
        p.textContent = "메모 없이 넘어감";
      }
      li.appendChild(p);
      el.memoList.appendChild(li);
    });
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
      if (remainingNow() <= 0) {
        onPhaseComplete();
      } else {
        updateUi();
      }
    }, 250);
  }

  function openMemoDialog() {
    pendingBreak = true;
    state.running = false;
    state.endsAt = null;
    state.remainingMs = 0;
    saveState();
    stopTick();
    el.memoBadge.textContent = "집중 " + state.todayCycles + "사이클 완료";
    el.memoInput.value = "";
    el.memoChar.textContent = "0";
    el.overlay.hidden = false;
    el.memoInput.focus();
    updateUi();
    playEndSound();
  }

  function closeMemoDialog() {
    el.overlay.hidden = true;
    pendingBreak = false;
  }

  function startBreakAfterMemo(entry) {
    if (entry) {
      state.memos.unshift(entry);
      if (state.memos.length > 80) state.memos.length = 80;
    }
    closeMemoDialog();
    state.mode = "break";
    state.remainingMs = durationMs("break");
    state.running = true;
    state.endsAt = Date.now() + state.remainingMs;
    saveState();
    startTick();
    updateUi();
  }

  function onPhaseComplete() {
    stopTick();
    state.running = false;
    state.endsAt = null;
    state.remainingMs = 0;
    saveState();

    if (state.mode === "work") {
      state.todayCycles += 1;
      saveState();
      openMemoDialog();
      return;
    }

    playEndSound();
    state.mode = "work";
    state.remainingMs = durationMs("work");
    el.timeSub.textContent = "휴식이 끝났습니다. 다시 집중을 시작해 보세요.";
    saveState();
    updateUi();
  }

  function toggleRun() {
    if (pendingBreak) return;
    rollDayIfNeeded();
    if (state.running) {
      state.remainingMs = remainingNow();
      state.running = false;
      state.endsAt = null;
      stopTick();
    } else {
      if (state.remainingMs == null || state.remainingMs <= 0) {
        state.remainingMs = durationMs(state.mode);
      }
      state.running = true;
      state.endsAt = Date.now() + state.remainingMs;
      startTick();
    }
    saveState();
    updateUi();
  }

  function skipPhase() {
    if (pendingBreak) return;
    stopTick();
    state.running = false;
    state.endsAt = null;
    state.remainingMs = 0;
    saveState();
    if (state.mode === "work") {
      state.todayCycles += 1;
      saveState();
      openMemoDialog();
    } else {
      state.mode = "work";
      state.remainingMs = durationMs("work");
      saveState();
      updateUi();
    }
  }

  function resetAll() {
    if (pendingBreak) return;
    stopTick();
    state.running = false;
    state.endsAt = null;
    state.mode = "work";
    state.remainingMs = durationMs("work");
    saveState();
    updateUi();
  }

  function setMode(mode) {
    if (pendingBreak || state.running) return;
    state.mode = mode;
    state.remainingMs = durationMs(mode);
    saveState();
    updateUi();
  }

  el.btnToggle.addEventListener("click", toggleRun);
  el.btnSkip.addEventListener("click", skipPhase);
  el.btnReset.addEventListener("click", resetAll);

  el.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setMode(tab.getAttribute("data-mode"));
    });
  });

  el.workMin.addEventListener("input", function () {
    if (state.running || pendingBreak) return;
    state.workMin = Number(el.workMin.value);
    if (state.mode === "work") state.remainingMs = durationMs("work");
    saveState();
    updateUi();
  });

  el.breakMin.addEventListener("input", function () {
    if (state.running || pendingBreak) return;
    state.breakMin = Number(el.breakMin.value);
    if (state.mode === "break") state.remainingMs = durationMs("break");
    saveState();
    updateUi();
  });

  el.soundOn.addEventListener("change", function () {
    state.sound = el.soundOn.checked;
    saveState();
  });

  el.memoInput.addEventListener("input", function () {
    el.memoChar.textContent = String(el.memoInput.value.length);
  });

  function commitMemo(withText) {
    var text = withText ? el.memoInput.value.trim() : "";
    var entry = {
      dayKey: todayKey(),
      at: Date.now(),
      text: text,
    };
    startBreakAfterMemo(entry);
  }

  el.memoSave.addEventListener("click", function () {
    commitMemo(true);
  });

  el.memoSkip.addEventListener("click", function () {
    commitMemo(false);
  });

  el.overlay.addEventListener("click", function (e) {
    if (e.target === el.overlay) {
      /* keep dialog until user chooses */
    }
  });

  document.addEventListener("keydown", function (e) {
    if (el.overlay.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
    }
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      commitMemo(true);
    }
  });

  if (state.running && state.endsAt) {
    if (state.endsAt <= Date.now()) {
      onPhaseComplete();
    } else {
      startTick();
    }
  } else if (state.remainingMs == null) {
    state.remainingMs = durationMs(state.mode);
    saveState();
  }

  updateUi();
})();
