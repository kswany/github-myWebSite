(function () {
  "use strict";

  var MENUS = {
    all: [],
    korean: [
      { name: "김치찌개", tip: "밥 한 공기는 기본이에요." },
      { name: "된장찌개", tip: "두부랑 호박 넣으면 든든해요." },
      { name: "비빔밥", tip: "고추장 양 조절이 포인트." },
      { name: "제육볶음", tip: "밥 비벼 먹기 좋아요." },
      { name: "불고기", tip: "양파랑 같이 구우면 달콤해요." },
      { name: "순두부찌개", tip: "계란 풀어 넣으면 부드러워요." },
      { name: "삼겹살", tip: "상추 싸 먹기 좋은 날." },
      { name: "갈비탕", tip: "국물까지 다 드세요." },
      { name: "냉면", tip: "더울 때는 시원한 게 최고." },
      { name: "김밥", tip: "가볍게 한 줄이면 충분해요." },
    ],
    chinese: [
      { name: "짜장면", tip: "단무지랑 같이." },
      { name: "짬뽕", tip: "매운 국물이 당길 때." },
      { name: "탕수육", tip: "바삭한 튀김옷이 포인트." },
      { name: "마라탕", tip: "매운 단계는 천천히 올려요." },
      { name: "볶음밥", tip: "계란 프라이 올리면 완성." },
      { name: "깐풍기", tip: "밥이랑 같이 먹기 좋아요." },
      { name: "유린기", tip: "새콤달콤 소스가 일품." },
      { name: "마파두부", tip: "밥 비벼 먹기 딱이에요." },
    ],
    japanese: [
      { name: "돈카츠", tip: "소스 두 번 찍어도 OK." },
      { name: "규동", tip: "양파랑 같이 비벼 보세요." },
      { name: "라멘", tip: "국물 온도 먼저 확인." },
      { name: "초밥", tip: "간장은 살짝만." },
      { name: "우동", tip: "따뜻한 국물이 속 편해요." },
      { name: "가츠동", tip: "계란 올린 버전도 좋아요." },
      { name: "오므라이스", tip: "케첩 그림은 선택." },
    ],
    western: [
      { name: "파스타", tip: "면 삶은 직후가 제일 맛있어요." },
      { name: "피자", tip: "한 조각씩 천천히." },
      { name: "햄버거", tip: "감자튀김 세트도 괜찮아요." },
      { name: "샐러드", tip: "단백질 토핑 하나 더." },
      { name: "스테이크", tip: "굽기는 취향대로." },
      { name: "리조또", tip: "치즈 한 스푼 더." },
      { name: "샌드위치", tip: "들고 다니기 편해요." },
    ],
    snack: [
      { name: "떡볶이", tip: "치즈 추가는 선택." },
      { name: "김치볶음밥", tip: "계란 후라이 올리면 완성." },
      { name: "라면", tip: "계란·치즈·파는 취향." },
      { name: "순대", tip: "국물이랑 같이." },
      { name: "튀김", tip: "소스는 살짝만." },
      { name: "만두", tip: "군만두 vs 찐만두 고민." },
      { name: "핫도그", tip: "길거리 간식 기분." },
    ],
    light: [
      { name: "샐러드", tip: "드레싱은 따로." },
      { name: "포케", tip: "밥 양 조절하기." },
      { name: "샌드위치", tip: "채소 많은 쪽으로." },
      { name: "죽", tip: "속이 편할 때." },
      { name: "두부샐러드", tip: "단백질 보충." },
      { name: "요거트볼", tip: "과일·견과류 토핑." },
      { name: "수프", tip: "빵 한 조각이면 든든." },
    ],
  };

  var CATEGORIES = [
    { id: "all", label: "전체" },
    { id: "korean", label: "한식" },
    { id: "chinese", label: "중식" },
    { id: "japanese", label: "일식" },
    { id: "western", label: "양식" },
    { id: "snack", label: "분식" },
    { id: "light", label: "가볍게" },
  ];

  (function buildAll() {
    var seen = {};
    var merged = [];
    ["korean", "chinese", "japanese", "western", "snack", "light"].forEach(function (key) {
      MENUS[key].forEach(function (item) {
        if (!seen[item.name]) {
          seen[item.name] = true;
          merged.push(item);
        }
      });
    });
    MENUS.all = merged;
  })();

  var catGrid = document.getElementById("cat-grid");
  var stageEl = document.getElementById("draw-stage");
  var kickerEl = document.getElementById("draw-kicker");
  var valueEl = document.getElementById("draw-value");
  var subEl = document.getElementById("draw-sub");
  var drawBtn = document.getElementById("draw-btn");
  var resetBtn = document.getElementById("reset-btn");

  var selectedCat = "all";
  var spinning = false;
  var spinTimer = null;

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getPool() {
    return MENUS[selectedCat] || MENUS.all;
  }

  function clearSpin() {
    if (spinTimer) {
      clearTimeout(spinTimer);
      spinTimer = null;
    }
    spinning = false;
    stageEl.classList.remove("is-spinning", "is-winner");
    drawBtn.disabled = false;
  }

  function showIdle() {
    clearSpin();
    kickerEl.textContent = "준비됐어요";
    valueEl.textContent = "?";
    subEl.textContent = "카테고리를 고른 뒤 점메추를 눌러 주세요";
  }

  function finishDraw(pool, winner) {
    stageEl.classList.remove("is-spinning");
    stageEl.classList.add("is-winner");
    kickerEl.textContent = "오늘은 이거!";
    valueEl.textContent = winner.name;
    subEl.textContent = winner.tip + " · 총 " + pool.length + "개 중 하나예요.";
    spinning = false;
    drawBtn.disabled = false;
  }

  function spinDraw(pool) {
    var winner = pool[randomInt(0, pool.length - 1)];
    var ticks = randomInt(12, 20);
    var step = 0;

    spinning = true;
    drawBtn.disabled = true;
    stageEl.classList.add("is-spinning");
    stageEl.classList.remove("is-winner");
    kickerEl.textContent = "고르는 중";
    subEl.textContent = "잠깐만요…";

    function tick() {
      var preview = pool[randomInt(0, pool.length - 1)];
      valueEl.textContent = preview.name;
      step += 1;
      if (step >= ticks) {
        finishDraw(pool, winner);
        return;
      }
      var delay = 45 + step * step * 2;
      spinTimer = setTimeout(tick, delay);
    }

    tick();
  }

  function draw() {
    if (spinning) return;
    var pool = getPool();
    if (!pool.length) {
      kickerEl.textContent = "확인";
      valueEl.textContent = "!";
      subEl.textContent = "목록이 비어 있어요.";
      return;
    }
    if (pool.length === 1) {
      finishDraw(pool, pool[0]);
      return;
    }
    spinDraw(pool);
  }

  function setCategory(id) {
    selectedCat = id;
    var buttons = catGrid.querySelectorAll(".cat-btn");
    buttons.forEach(function (btn) {
      var active = btn.getAttribute("data-cat") === id;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
    var label = CATEGORIES.find(function (c) {
      return c.id === id;
    });
    subEl.textContent =
      (label ? label.label : "전체") + " · " + getPool().length + "개 메뉴 중 하나를 뽑아요.";
    if (!spinning && valueEl.textContent === "?") {
      kickerEl.textContent = "준비됐어요";
    }
  }

  CATEGORIES.forEach(function (cat) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cat-btn" + (cat.id === selectedCat ? " active" : "");
    btn.setAttribute("data-cat", cat.id);
    btn.setAttribute("aria-pressed", cat.id === selectedCat ? "true" : "false");
    btn.textContent = cat.label;
    btn.addEventListener("click", function () {
      setCategory(cat.id);
    });
    catGrid.appendChild(btn);
  });

  drawBtn.addEventListener("click", draw);
  resetBtn.addEventListener("click", showIdle);

  setCategory("all");
})();
