(function () {
  "use strict";

  var DURATION_SEC = 30;
  var STORAGE_KEY = "kswany-typing-speed-v1";

  var SENTENCES = [
    "오늘은 커피 한 잔과 함께 천천히 하루를 시작해 보자.",
    "비 오는 날에는 창밖을 보며 책 한 권 읽기 좋다.",
    "친구에게 짧은 안부 문자를 보내면 기분이 한결 가벼워진다.",
    "저녁 산책은 하루의 피로를 조금씩 풀어 주는 시간이다.",
    "새로운 취미를 시작할 때는 작은 목표부터 세우면 부담이 적다.",
    "주말 아침에는 늦잠 대신 햇살 가득한 창가에 앉아 보자.",
    "일기를 쓰면 하루를 정리하는 데 도움이 되고 마음이 편해진다.",
    "따뜻한 국물 요리는 몸과 마음을 동시에 녹여 주는 기분이다.",
    "집중이 필요할 때는 알림을 끄고 짧은 타이머를 켜 보자.",
    "작은 실수는 배움의 일부니까 너무 자책하지 않아도 된다.",
    "좋아하는 음악을 틀고 청소하면 시간이 금방 지나간다.",
    "물을 자주 마시면 오후의 졸림이 조금 덜한 편이다.",
  ];

  var state = {
    running: false,
    target: "",
    timerId: null,
    endAt: 0,
    tickId: null,
  };

  function pickSentence(exclude) {
    var pool = SENTENCES.filter(function (s) {
      return s !== exclude;
    });
    if (pool.length === 0) pool = SENTENCES.slice();
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(entry) {
    var list = loadHistory();
    list.unshift(entry);
    if (list.length > 5) list = list.slice(0, 5);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      /* ignore */
    }
    renderHistory();
  }

  function renderHistory() {
    var list = loadHistory();
    var block = document.getElementById("history-block");
    var ul = document.getElementById("history-list");
    if (!block || !ul) return;
    if (list.length === 0) {
      block.hidden = true;
      return;
    }
    block.hidden = false;
    ul.innerHTML = "";
    list.forEach(function (item) {
      var li = document.createElement("li");
      li.textContent =
        "분당 " +
        item.cpm +
        "타 · 정확도 " +
        item.acc +
        "% · " +
        item.chars +
        "글자";
      ul.appendChild(li);
    });
  }

  function compareStats(target, typed) {
    var len = typed.length;
    var correct = 0;
    for (var i = 0; i < len; i++) {
      if (typed[i] === target[i]) correct++;
    }
    var acc = len === 0 ? 100 : Math.round((correct / len) * 100);
    return { correct: correct, typedLen: len, acc: acc };
  }

  function renderTargetHighlight(target, typed) {
    var html = "";
    var max = Math.max(target.length, typed.length);
    for (var i = 0; i < max; i++) {
      var t = typed[i];
      var g = target[i];
      if (t === undefined) {
        html += '<span class="char-pending">' + escapeHtml(g || "") + "</span>";
      } else if (g === undefined) {
        html += '<span class="char-bad">' + escapeHtml(t) + "</span>";
      } else if (t === g) {
        html += '<span class="char-ok">' + escapeHtml(t) + "</span>";
      } else {
        html += '<span class="char-bad">' + escapeHtml(t) + "</span>";
      }
    }
    return html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function updateLiveStats() {
    var input = document.getElementById("typing-input");
    var targetEl = document.getElementById("target-text");
    var accEl = document.getElementById("stat-acc");
    var cpmEl = document.getElementById("stat-cpm");
    var typed = input.value;
    targetEl.innerHTML = renderTargetHighlight(state.target, typed);
    var stats = compareStats(state.target, typed);
    accEl.textContent = stats.acc + "%";
    if (!state.running && stats.typedLen === 0) {
      cpmEl.textContent = "-";
      return stats;
    }
    var elapsed = DURATION_SEC;
    if (state.running && state.endAt) {
      elapsed = Math.max(0.5, DURATION_SEC - (state.endAt - Date.now()) / 1000);
    }
    var cpm = Math.round((stats.correct / elapsed) * 60);
    cpmEl.textContent = String(cpm);
    return stats;
  }

  function setRunning(on) {
    state.running = on;
    var input = document.getElementById("typing-input");
    var btnStart = document.getElementById("btn-start");
    var btnSkip = document.getElementById("btn-skip");
    input.disabled = !on;
    btnSkip.disabled = on;
    var timeBox = document.querySelector(".score-grid .score-box:first-child");
    if (on) {
      btnStart.textContent = "연습 중…";
      btnStart.disabled = true;
      if (timeBox) timeBox.classList.add("running");
      input.focus();
    } else {
      btnStart.textContent = "다시 30초 시작";
      btnStart.disabled = false;
      if (timeBox) timeBox.classList.remove("running");
    }
  }

  function finishRun() {
    if (!state.running) return;
    clearInterval(state.tickId);
    state.tickId = null;
    state.running = false;
    state.endAt = 0;

    var input = document.getElementById("typing-input");
    input.disabled = true;
    document.getElementById("btn-start").disabled = false;
    document.getElementById("btn-start").textContent = "다시 30초 시작";
    document.getElementById("btn-skip").disabled = false;
    document.getElementById("stat-time").textContent = "0";
    var timeBox = document.querySelector(".score-grid .score-box:first-child");
    if (timeBox) timeBox.classList.remove("running");

    var stats = compareStats(state.target, input.value);
    var cpm = Math.round((stats.correct / DURATION_SEC) * 60);

    var hero = document.getElementById("result-hero");
    var main = document.getElementById("result-main");
    var sub = document.getElementById("result-sub");
    hero.hidden = false;
    main.textContent = "분당 " + cpm + "타 · 정확도 " + stats.acc + "%";
    sub.textContent =
      stats.correct +
      "글자를 맞췄고, 총 " +
      stats.typedLen +
      "글자를 입력했어요." +
      gradeMessage(cpm, stats.acc);

    saveHistory({ cpm: cpm, acc: stats.acc, chars: stats.correct, at: Date.now() });
    updateLiveStats();
  }

  function gradeMessage(cpm, acc) {
    if (acc < 85) return " 정확도를 먼저 올려 보세요.";
    if (cpm >= 350) return " 아주 빠른 편이에요!";
    if (cpm >= 250) return " 꽤 빠른 속도예요.";
    if (cpm >= 180) return " 조금만 더 연습하면 더 빨라질 거예요.";
    return " 천천히 맞추는 연습부터 해도 좋아요.";
  }

  function startRun() {
    finishRunSilent();
    state.target = pickSentence(state.target);
    document.getElementById("target-text").innerHTML = renderTargetHighlight(state.target, "");
    var input = document.getElementById("typing-input");
    input.value = "";
    input.disabled = false;
    document.getElementById("result-hero").hidden = true;
    document.getElementById("stat-acc").textContent = "100%";
    document.getElementById("stat-cpm").textContent = "0";

    setRunning(true);
    state.endAt = Date.now() + DURATION_SEC * 1000;
    document.getElementById("stat-time").textContent = String(DURATION_SEC);

    state.tickId = setInterval(function () {
      var left = Math.ceil((state.endAt - Date.now()) / 1000);
      if (left <= 0) {
        finishRun();
        return;
      }
      document.getElementById("stat-time").textContent = String(left);
      updateLiveStats();
    }, 100);
  }

  function finishRunSilent() {
    if (state.tickId) clearInterval(state.tickId);
    state.tickId = null;
    state.running = false;
  }

  function newSentenceOnly() {
    if (state.running) return;
    state.target = pickSentence(state.target);
    document.getElementById("target-text").innerHTML = renderTargetHighlight(state.target, "");
    document.getElementById("typing-input").value = "";
    document.getElementById("stat-acc").textContent = "-";
    document.getElementById("stat-cpm").textContent = "-";
    document.getElementById("result-hero").hidden = true;
  }

  function init() {
    state.target = pickSentence("");
    document.getElementById("target-text").innerHTML = renderTargetHighlight(state.target, "");

    document.getElementById("btn-start").addEventListener("click", startRun);
    document.getElementById("btn-skip").addEventListener("click", newSentenceOnly);
    document.getElementById("typing-input").addEventListener("input", function () {
      if (state.running) updateLiveStats();
    });

    renderHistory();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
