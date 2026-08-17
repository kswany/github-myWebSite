const STORAGE_KEY = "kswany-reaction-test-records";
const MAX_RECORDS = 20;

const zone = document.getElementById("reaction-zone");
const zoneLabel = document.getElementById("zone-label");
const zoneHint = document.getElementById("zone-hint");
const statLast = document.getElementById("stat-last");
const statBest = document.getElementById("stat-best");
const statAvg = document.getElementById("stat-avg");
const recordList = document.getElementById("record-list");
const restartBtn = document.getElementById("restart");

let state = "idle";
let waitTimer = null;
let startTime = 0;

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n) => typeof n === "number" && n > 0) : [];
  } catch {
    return [];
  }
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)));
}

function formatMs(ms) {
  return `${Math.round(ms)} ms`;
}

function average(records) {
  if (!records.length) return null;
  const sum = records.reduce((acc, n) => acc + n, 0);
  return sum / records.length;
}

function renderStats(records) {
  const best = records.length ? Math.min(...records) : null;
  const avg = average(records);

  statLast.textContent = records.length ? formatMs(records[0]) : "-";
  statBest.textContent = best !== null ? formatMs(best) : "-";
  statAvg.textContent = avg !== null ? formatMs(avg) : "-";

  if (!records.length) {
    recordList.innerHTML = '<li class="lab-empty">아직 기록이 없습니다. 한 번 눌러 보세요.</li>';
    return;
  }

  recordList.innerHTML = records
    .map((ms, i) => {
      const isBest = ms === best;
      return `<li class="${isBest ? "best-row" : ""}"><span>${i + 1}번째</span><span class="ms">${formatMs(ms)}${isBest ? " · 최고" : ""}</span></li>`;
    })
    .join("");
}

function setState(next) {
  state = next;
  zone.className = `reaction-zone ${next}`;
}

function clearWaitTimer() {
  if (waitTimer !== null) {
    clearTimeout(waitTimer);
    waitTimer = null;
  }
}

function showIdle() {
  clearWaitTimer();
  setState("idle");
  zoneLabel.textContent = "시작하려면 누르세요";
  zoneHint.textContent = "초록색이 되면 바로 눌러 반응 시간을 재요.";
  zone.setAttribute("aria-label", "반응속도 테스트 시작");
}

function beginWaiting() {
  clearWaitTimer();
  setState("waiting");
  zoneLabel.textContent = "기다리세요…";
  zoneHint.textContent = "아직 빨간색이에요. 초록색이 될 때까지 기다리세요.";
  zone.setAttribute("aria-label", "초록색이 될 때까지 기다리기");

  const delay = 1200 + Math.random() * 2800;
  waitTimer = window.setTimeout(() => {
    waitTimer = null;
    setState("ready");
    startTime = performance.now();
    zoneLabel.textContent = "지금 누르세요!";
    zoneHint.textContent = "초록색이에요. 최대한 빨리 클릭하세요.";
    zone.setAttribute("aria-label", "지금 클릭하여 반응 시간 측정");
  }, delay);
}

function showTooSoon() {
  clearWaitTimer();
  setState("too-soon");
  zoneLabel.textContent = "너무 빨랐어요";
  zoneHint.textContent = "초록색 전에 누르면 기록되지 않아요. 다시 눌러 주세요.";
  zone.setAttribute("aria-label", "너무 일찍 클릭함, 다시 시도");
}

function finishRound(ms) {
  clearWaitTimer();
  setState("result");
  zoneLabel.textContent = formatMs(ms);
  zoneHint.textContent = "한 번 더 하려면 아래 버튼이나 이 영역을 누르세요.";
  zone.setAttribute("aria-label", `반응 시간 ${Math.round(ms)}밀리초`);

  const records = loadRecords();
  records.unshift(ms);
  saveRecords(records);
  renderStats(records);
}

function handleZoneClick() {
  if (state === "idle" || state === "result" || state === "too-soon") {
    beginWaiting();
    return;
  }

  if (state === "waiting") {
    showTooSoon();
    return;
  }

  if (state === "ready") {
    const elapsed = performance.now() - startTime;
    finishRound(elapsed);
  }
}

zone.addEventListener("click", handleZoneClick);
zone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handleZoneClick();
  }
});

restartBtn.addEventListener("click", showIdle);

renderStats(loadRecords());
showIdle();
