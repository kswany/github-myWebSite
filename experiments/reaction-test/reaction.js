(function () {
  var STORAGE_KEY = "reaction-test-scores";
  var MIN_DELAY = 1200;
  var MAX_DELAY = 4500;

  var pad = document.getElementById("pad");
  var padKicker = document.getElementById("pad-kicker");
  var padMain = document.getElementById("pad-main");
  var padSub = document.getElementById("pad-sub");
  var statBest = document.getElementById("stat-best");
  var statAvg = document.getElementById("stat-avg");
  var statCount = document.getElementById("stat-count");
  var resetBtn = document.getElementById("reset");

  var state = "idle";
  var timerId = null;
  var readyAt = 0;

  function loadScores() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(function (n) { return typeof n === "number" && n > 0; }) : [];
    } catch (e) {
      return [];
    }
  }

  function saveScores(scores) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(-20)));
  }

  function formatMs(ms) {
    return Math.round(ms) + "ms";
  }

  function renderStats() {
    var scores = loadScores();
    statCount.textContent = String(scores.length);

    if (!scores.length) {
      statBest.textContent = "-";
      statAvg.textContent = "-";
      return;
    }

    var best = Math.min.apply(null, scores);
    statBest.textContent = formatMs(best);

    var recent = scores.slice(-5);
    var sum = recent.reduce(function (acc, n) { return acc + n; }, 0);
    statAvg.textContent = formatMs(sum / recent.length);
  }

  function clearTimer() {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function setPadClass(className) {
    pad.className = "reaction-pad" + (className ? " " + className : "");
  }

  function setIdle() {
    state = "idle";
    clearTimer();
    setPadClass("");
    padKicker.textContent = "준비";
    padMain.textContent = "시작하기";
    padSub.textContent = "버튼을 눌러 첫 시도를 시작하세요";
    pad.disabled = false;
  }

  function setWaiting() {
    state = "waiting";
    setPadClass("is-waiting");
    padKicker.textContent = "대기";
    padMain.textContent = "기다리세요…";
    padSub.textContent = "초록색이 되면 바로 누르세요. 너무 일찍 누르면 실패입니다";
    pad.disabled = false;

    var delay = MIN_DELAY + Math.random() * (MAX_DELAY - MIN_DELAY);
    timerId = setTimeout(function () {
      timerId = null;
      setReady();
    }, delay);
  }

  function setReady() {
    state = "ready";
    readyAt = performance.now();
    setPadClass("is-ready");
    padKicker.textContent = "지금!";
    padMain.textContent = "클릭!";
    padSub.textContent = "초록색이 보이면 바로 누르세요";
  }

  function setEarly() {
    state = "early";
    clearTimer();
    setPadClass("is-early");
    padKicker.textContent = "실패";
    padMain.textContent = "너무 빨라요";
    padSub.textContent = "초록색이 되기 전에 눌렀습니다. 다시 시도해 보세요";
  }

  function setResult(ms) {
    state = "result";
    clearTimer();
    setPadClass("is-result");
    padKicker.textContent = "결과";
    padMain.textContent = formatMs(ms);

    var scores = loadScores();
    scores.push(ms);
    saveScores(scores);
    renderStats();

    if (scores.length === 1 || ms === Math.min.apply(null, scores)) {
      padSub.textContent = "새 최고 기록입니다! 한 번 더 도전해 보세요";
    } else {
      padSub.textContent = "한 번 더 눌러 다음 시도를 시작하세요";
    }
  }

  pad.addEventListener("click", function () {
    if (state === "idle" || state === "result" || state === "early") {
      setWaiting();
      return;
    }

    if (state === "waiting") {
      setEarly();
      return;
    }

    if (state === "ready") {
      var elapsed = performance.now() - readyAt;
      setResult(elapsed);
    }
  });

  resetBtn.addEventListener("click", function () {
    localStorage.removeItem(STORAGE_KEY);
    renderStats();
    setIdle();
  });

  renderStats();
  setIdle();
})();
