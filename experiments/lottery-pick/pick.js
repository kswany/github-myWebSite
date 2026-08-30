(function () {
  "use strict";

  var tabList = document.getElementById("tab-list");
  var tabRange = document.getElementById("tab-range");
  var panelList = document.getElementById("panel-list");
  var panelRange = document.getElementById("panel-range");
  var itemsEl = document.getElementById("items");
  var itemCountEl = document.getElementById("item-count");
  var rangeMinEl = document.getElementById("range-min");
  var rangeMaxEl = document.getElementById("range-max");
  var stageEl = document.getElementById("draw-stage");
  var kickerEl = document.getElementById("draw-kicker");
  var valueEl = document.getElementById("draw-value");
  var subEl = document.getElementById("draw-sub");
  var drawBtn = document.getElementById("draw-btn");
  var resetBtn = document.getElementById("reset-btn");

  var mode = "list";
  var spinning = false;
  var spinTimer = null;

  function setMode(next) {
    mode = next;
    var isList = mode === "list";
    tabList.classList.toggle("active", isList);
    tabRange.classList.toggle("active", !isList);
    tabList.setAttribute("aria-selected", isList ? "true" : "false");
    tabRange.setAttribute("aria-selected", isList ? "false" : "true");
    panelList.classList.toggle("active", isList);
    panelRange.classList.toggle("active", !isList);
    panelList.hidden = !isList;
    panelRange.hidden = isList;
    updateCount();
  }

  function parseItems() {
    return itemsEl.value
      .split(/\r?\n/)
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line) {
        return line.length > 0;
      });
  }

  function updateCount() {
    itemCountEl.textContent = String(parseItems().length);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    subEl.textContent = "뽑기를 누르면 돌아갑니다";
  }

  function getPool() {
    if (mode === "list") {
      return parseItems();
    }
    var min = parseInt(rangeMinEl.value, 10);
    var max = parseInt(rangeMaxEl.value, 10);
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
      return { error: "숫자를 올바르게 넣어 주세요." };
    }
    if (min > max) {
      var tmp = min;
      min = max;
      max = tmp;
      rangeMinEl.value = String(min);
      rangeMaxEl.value = String(max);
    }
    if (max - min > 9999) {
      return { error: "범위는 1만 개 이하로 줄여 주세요." };
    }
    var nums = [];
    for (var i = min; i <= max; i += 1) {
      nums.push(String(i));
    }
    return nums;
  }

  function finishDraw(pool, winner) {
    stageEl.classList.remove("is-spinning");
    stageEl.classList.add("is-winner");
    kickerEl.textContent = "당첨";
    valueEl.textContent = winner;
    subEl.textContent =
      mode === "list"
        ? "총 " + pool.length + "개 중 하나입니다. 다시 뽑을 수 있어요."
        : pool.length + "개 숫자 중 하나입니다.";
    spinning = false;
    drawBtn.disabled = false;
  }

  function spinDraw(pool) {
    var winner = pool[randomInt(0, pool.length - 1)];
    var ticks = randomInt(14, 22);
    var step = 0;

    spinning = true;
    drawBtn.disabled = true;
    stageEl.classList.add("is-spinning");
    stageEl.classList.remove("is-winner");
    kickerEl.textContent = "섞는 중";
    subEl.textContent = "잠깐만요…";

    function tick() {
      var preview = pool[randomInt(0, pool.length - 1)];
      valueEl.textContent = preview;
      step += 1;
      if (step >= ticks) {
        finishDraw(pool, winner);
        return;
      }
      var delay = 40 + step * step * 2;
      spinTimer = setTimeout(tick, delay);
    }

    tick();
  }

  function draw() {
    if (spinning) return;
    var pool = getPool();
    if (pool && pool.error) {
      kickerEl.textContent = "확인";
      valueEl.textContent = "!";
      subEl.textContent = pool.error;
      stageEl.classList.remove("is-spinning", "is-winner");
      return;
    }
    if (!pool || pool.length === 0) {
      kickerEl.textContent = "확인";
      valueEl.textContent = "!";
      subEl.textContent =
        mode === "list" ? "목록에 항목을 한 줄 이상 적어 주세요." : "범위를 확인해 주세요.";
      stageEl.classList.remove("is-spinning", "is-winner");
      return;
    }
    if (pool.length === 1) {
      finishDraw(pool, pool[0]);
      return;
    }
    spinDraw(pool);
  }

  tabList.addEventListener("click", function () {
    setMode("list");
  });
  tabRange.addEventListener("click", function () {
    setMode("range");
  });
  itemsEl.addEventListener("input", updateCount);
  drawBtn.addEventListener("click", draw);
  resetBtn.addEventListener("click", showIdle);

  updateCount();
})();
