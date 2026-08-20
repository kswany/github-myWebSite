const STORAGE_KEY = "kswany-balance-game-last";

const QUESTIONS = [
  { q: "평생 하나만?", a: "치킨", b: "피자" },
  { q: "더 끌리는 휴식?", a: "낮잠", b: "산책" },
  { q: "친구 만날 때?", a: "먼저 연락", b: "연락 기다리기" },
  { q: "일할 때?", a: "카페", b: "집" },
  { q: "영상 볼 때?", a: "빨리감기", b: "끝까지" },
  { q: "장 볼 때?", a: "리스트", b: "눈에 보이는 대로" },
  { q: "메시지?", a: "이모티콘 많이", b: "짧게" },
  { q: "선택할 때?", a: "확실한 답", b: "글쎄…" },
];

const RESULTS = {
  a: {
    title: "A파 — 편하고 확실한 쪽",
    desc: "익숙한 선택, 계획, 빠른 결정 쪽으로 기울었어요. 새로운 것도 좋지만 먼저 안정을 찾는 편입니다.",
  },
  b: {
    title: "B파 — 여유와 즉흥 쪽",
    desc: "느긋하게, 상황에 맞춰, 끝까지 즐기는 쪽으로 기울었어요. 계획보다 흐름을 믿는 편입니다.",
  },
  tie: {
    title: "반반파 — 상황 따라 갈림",
    desc: "A와 B가 비슷해요. 때로는 확실하게, 때로는 유연하게. 밸런스를 잘 타는 타입입니다.",
  },
};

const qNum = document.getElementById("q-num");
const lastType = document.getElementById("last-type");
const progressFill = document.getElementById("progress-fill");
const quiz = document.getElementById("quiz");
const questionEl = document.getElementById("question");
const labelA = document.getElementById("label-a");
const labelB = document.getElementById("label-b");
const choiceA = document.getElementById("choice-a");
const choiceB = document.getElementById("choice-b");
const resultPanel = document.getElementById("result");
const resultBars = document.getElementById("result-bars");
const resultTitle = document.getElementById("result-title");
const resultDesc = document.getElementById("result-desc");
const againBtn = document.getElementById("again");
const restartBtn = document.getElementById("restart");

let index = 0;
let picks = { a: 0, b: 0 };

function loadLast() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data && typeof data.title === "string" ? data : null;
  } catch {
    return null;
  }
}

function saveLast(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function showLast() {
  const last = loadLast();
  lastType.textContent = last ? last.short : "-";
}

function updateProgress() {
  const pct = (index / QUESTIONS.length) * 100;
  progressFill.style.width = `${pct}%`;
  qNum.textContent = String(Math.min(index + 1, QUESTIONS.length));
}

function renderQuestion() {
  const item = QUESTIONS[index];
  questionEl.textContent = item.q;
  labelA.textContent = item.a;
  labelB.textContent = item.b;
  updateProgress();
}

function pick(side) {
  picks[side] += 1;
  index += 1;

  if (index >= QUESTIONS.length) {
    showResult();
    return;
  }

  renderQuestion();
}

function resolveType() {
  if (picks.a > picks.b) return "a";
  if (picks.b > picks.a) return "b";
  return "tie";
}

function showResult() {
  quiz.hidden = true;
  resultPanel.hidden = false;
  progressFill.style.width = "100%";

  const total = picks.a + picks.b;
  const pctA = Math.round((picks.a / total) * 100);
  const pctB = 100 - pctA;
  const type = resolveType();
  const info = RESULTS[type];

  resultBars.innerHTML = `
    <div class="bar-row">
      <span class="bar-tag">A</span>
      <div class="bar-track"><div class="bar-fill a" style="width:${pctA}%"></div></div>
      <span class="bar-pct">${pctA}%</span>
    </div>
    <div class="bar-row">
      <span class="bar-tag">B</span>
      <div class="bar-track"><div class="bar-fill b" style="width:${pctB}%"></div></div>
      <span class="bar-pct">${pctB}%</span>
    </div>
  `;

  resultTitle.textContent = info.title;
  resultDesc.textContent = info.desc;

  saveLast({
    short: info.title.replace(/ — .+$/, ""),
    title: info.title,
    a: picks.a,
    b: picks.b,
    at: Date.now(),
  });
  showLast();
}

function reset() {
  index = 0;
  picks = { a: 0, b: 0 };
  quiz.hidden = false;
  resultPanel.hidden = true;
  renderQuestion();
}

choiceA.addEventListener("click", () => pick("a"));
choiceB.addEventListener("click", () => pick("b"));
againBtn.addEventListener("click", reset);
restartBtn.addEventListener("click", reset);

showLast();
reset();
