(function () {
  "use strict";

  var LINES = [
    { text: "오늘도 이만큼 버텼다는 것만으로 충분해요.", mood: "comfort", tag: "위로" },
    { text: "완벽하지 않아도 괜찮아요. 지금 이 순간이면 됩니다.", mood: "comfort", tag: "위로" },
    { text: "마음이 무거우면 잠깐 멈춰도 돼요. 쉬는 것도 용기예요.", mood: "comfort", tag: "위로" },
    { text: "누구나 힘든 날이 있어요. 혼자가 아니에요.", mood: "comfort", tag: "위로" },
    { text: "작은 한 걸음도 앞으로 간 거예요.", mood: "comfort", tag: "위로" },
    { text: "오늘은 조금만 해도 괜찮아요. 내일은 더 가벼울 수 있어요.", mood: "comfort", tag: "위로" },
    { text: "울고 싶을 땐 울어도 돼요. 감정은 지나갑니다.", mood: "comfort", tag: "위로" },
    { text: "비교하지 마세요. 당신만의 속도가 있어요.", mood: "comfort", tag: "위로" },
    { text: "지금 이 순간, 숨 쉬고 있다는 것만으로도 대단해요.", mood: "comfort", tag: "위로" },
    { text: "실수해도 괜찮아요. 그게 사람이에요.", mood: "comfort", tag: "위로" },
    { text: "오늘 하루, 정말 수고 많았어요.", mood: "comfort", tag: "위로" },
    { text: "답이 없는 날도 있어요. 그냥 버티는 것도 방법이에요.", mood: "comfort", tag: "위로" },
    { text: "당신은 생각보다 훨씬 잘하고 있어요.", mood: "cheer", tag: "응원" },
    { text: "할 수 있어요. 아니, 이미 하고 있어요.", mood: "cheer", tag: "응원" },
    { text: "오늘의 당신, 내일의 당신이 고마워할 거예요.", mood: "cheer", tag: "응원" },
    { text: "포기하지 않은 당신, 정말 멋져요.", mood: "cheer", tag: "응원" },
    { text: "한 번 더 해보면, 분명 달라질 거예요.", mood: "cheer", tag: "응원" },
    { text: "작은 성공도 성공이에요. 축하해요!", mood: "cheer", tag: "응원" },
    { text: "당신의 노력은 분명 어딘가에 쌓여 있어요.", mood: "cheer", tag: "응원" },
    { text: "오늘도 한 걸음, 내일은 두 걸음.", mood: "cheer", tag: "응원" },
    { text: "믿어요. 당신은 해낼 수 있어요.", mood: "cheer", tag: "응원" },
    { text: "지금 이 순간, 당신 편이에요.", mood: "cheer", tag: "응원" },
    { text: "도전하는 당신, 이미 반은 성공이에요.", mood: "cheer", tag: "응원" },
    { text: "커피 한 잔 마시고, 다시 시작해요.", mood: "rest", tag: "휴식" },
    { text: "창밖을 잠깐 바라보세요. 하늘은 그대로예요.", mood: "rest", tag: "휴식" },
    { text: "눈을 감고 심호흡 세 번. 지금 이 순간만.", mood: "rest", tag: "휴식" },
    { text: "오늘은 일찍 자도 괜찮아요.", mood: "rest", tag: "휴식" },
    { text: "좋아하는 음악 한 곡, 잠깐만 들어볼까요?", mood: "rest", tag: "휴식" },
    { text: "스트레칭 한 번. 몸이 가벼워져요.", mood: "rest", tag: "휴식" },
    { text: "할 일 목록은 내일로 미뤄도 돼요.", mood: "rest", tag: "휴식" },
    { text: "따뜻한 차 한 잔의 여유를 가져보세요.", mood: "rest", tag: "휴식" },
    { text: "아무것도 안 해도 되는 시간, 5분만.", mood: "rest", tag: "휴식" },
    { text: "오늘은 쉬는 날로 정해도 괜찮아요.", mood: "rest", tag: "휴식" },
    { text: "고양이처럼 늘어져도 괜찮은 날이에요.", mood: "rest", tag: "휴식" },
    { text: "오늘의 행복: 간식 하나 더 먹기.", mood: "smile", tag: "웃음" },
    { text: "월요일도 금요일도, 결국 다 지나가요.", mood: "smile", tag: "웃음" },
    { text: "버그는 고치면 되고, 커피는 리필하면 돼요.", mood: "smile", tag: "웃음" },
    { text: "오늘의 계획: 계획 없이 살기.", mood: "smile", tag: "웃음" },
    { text: "엘리베이터 문 닫히기 전에 들어갔으면 성공.", mood: "smile", tag: "웃음" },
    { text: "양말 한 짝만 잃어도, 나머지 한 짝은 자유예요.", mood: "smile", tag: "웃음" },
    { text: "오늘도 누군가의 하루를 밝게 만든 당신.", mood: "smile", tag: "웃음" },
    { text: "배고프면 화도 나요. 일단 밥부터.", mood: "smile", tag: "웃음" },
    { text: "세상은 넓고, 침대는 따뜻해요.", mood: "smile", tag: "웃음" },
    { text: "오늘의 MVP: 당신의 존재.", mood: "smile", tag: "웃음" },
    { text: "실패? 그건 경험치 획득이에요.", mood: "smile", tag: "웃음" },
  ];

  var moodBar = document.querySelector(".mood-bar");
  var stageEl = document.getElementById("line-stage");
  var kickerEl = document.getElementById("line-kicker");
  var textEl = document.getElementById("line-text");
  var tagEl = document.getElementById("line-tag");
  var drawBtn = document.getElementById("draw-btn");
  var copyBtn = document.getElementById("copy-btn");
  var todayCountEl = document.getElementById("today-count");
  var lastLineEl = document.getElementById("last-line");

  var mood = "all";
  var lastIndex = -1;
  var currentText = "";

  var STORAGE_KEY = "daily-line-stats";

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function loadStats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveStats(stats) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {
      /* ignore */
    }
  }

  function updateHud() {
    var stats = loadStats();
    var key = todayKey();
    todayCountEl.textContent = String(stats[key] || 0);
    lastLineEl.textContent = stats.lastShort || "-";
  }

  function poolForMood() {
    if (mood === "all") return LINES.slice();
    return LINES.filter(function (item) {
      return item.mood === mood;
    });
  }

  function pickLine() {
    var pool = poolForMood();
    if (pool.length === 0) return null;
    if (pool.length === 1) return pool[0];

    var idx;
    var attempts = 0;
    do {
      idx = Math.floor(Math.random() * pool.length);
      attempts += 1;
    } while (pool[idx].text === currentText && attempts < 12);

    return pool[idx];
  }

  function setMood(next) {
    mood = next;
    moodBar.querySelectorAll(".mood-btn").forEach(function (btn) {
      var active = btn.getAttribute("data-mood") === next;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function showLine(item) {
    currentText = item.text;
    stageEl.setAttribute("data-tone", item.mood);
    stageEl.classList.remove("is-new");
    void stageEl.offsetWidth;
    stageEl.classList.add("is-new");
    kickerEl.textContent = "오늘의 한 줄";
    textEl.textContent = item.text;
    tagEl.textContent = "#" + item.tag;
    copyBtn.disabled = false;

    var stats = loadStats();
    var key = todayKey();
    stats[key] = (stats[key] || 0) + 1;
    stats.lastShort = item.text.length > 18 ? item.text.slice(0, 18) + "…" : item.text;
    saveStats(stats);
    updateHud();
  }

  function draw() {
    var item = pickLine();
    if (!item) {
      kickerEl.textContent = "확인";
      textEl.textContent = "이 분위기에 맞는 문장이 없어요.";
      tagEl.textContent = "";
      return;
    }
    showLine(item);
  }

  function copyLine() {
    if (!currentText) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentText).then(function () {
        copyBtn.textContent = "복사됨!";
        setTimeout(function () {
          copyBtn.textContent = "복사";
        }, 1400);
      });
      return;
    }
    var ta = document.createElement("textarea");
    ta.value = currentText;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      copyBtn.textContent = "복사됨!";
      setTimeout(function () {
        copyBtn.textContent = "복사";
      }, 1400);
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(ta);
  }

  moodBar.addEventListener("click", function (e) {
    var btn = e.target.closest(".mood-btn");
    if (!btn) return;
    setMood(btn.getAttribute("data-mood"));
  });

  drawBtn.addEventListener("click", draw);
  copyBtn.addEventListener("click", copyLine);

  updateHud();
})();
