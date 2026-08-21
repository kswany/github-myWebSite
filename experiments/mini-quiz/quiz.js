const STORAGE_KEY = "kswany-mini-quiz-last";

const TYPES = {
  rest: {
    id: "rest",
    title: "느긋한 휴식형",
    desc: "오늘은 천천히 가도 괜찮은 날이에요. 커피 한 잔, 가벼운 산책 정도면 충분합니다.",
    tags: ["여유", "회복", "천천히"],
    icon: "moon",
  },
  action: {
    id: "action",
    title: "바쁜 실행형",
    desc: "오늘은 손이 빨리 움직일수록 기분이 좋아지는 날이에요. 작은 일부터 바로 처리해 보세요.",
    tags: ["실행", "속도", "정리"],
    icon: "zap",
  },
  social: {
    id: "social",
    title: "사람 만나는형",
    desc: "오늘은 대화 한마디가 큰 힘이 되는 날이에요. 연락하고 싶은 사람에게 먼저 손을 뻗어 보세요.",
    tags: ["대화", "만남", "공유"],
    icon: "users",
  },
  focus: {
    id: "focus",
    title: "혼자 집중형",
    desc: "오늘은 방해받지 않을 때 가장 잘 나가는 날이에요. 25분짜리 집중 블록 하나만 잡아도 충분합니다.",
    tags: ["집중", "혼자", "몰입"],
    icon: "target",
  },
};

const QUESTIONS = [
  {
    q: "오늘 아침, 더 끌리는 쪽은?",
    a: { label: "천천히 시작", hint: "알람 끄고 잠깐 더 누워 있기", score: { rest: 2 } },
    b: { label: "바로 움직임", hint: "세수하고 바로 할 일로", score: { action: 2 } },
  },
  {
    q: "점심 때 하고 싶은 건?",
    a: { label: "혼자 조용히", hint: "혼자 먹거나 짧게 쉬기", score: { focus: 2 } },
    b: { label: "누군가랑", hint: "친구·동료와 함께", score: { social: 2 } },
  },
  {
    q: "오후 에너지는 어디로?",
    a: { label: "차분히 하나씩", hint: "급하지 않게 순서대로", score: { rest: 1, focus: 1 } },
    b: { label: "여러 일 동시에", hint: "손에 잡히는 대로 처리", score: { action: 2 } },
  },
  {
    q: "퇴근·수업 끝 후 그림은?",
    a: { label: "집에서 쉼", hint: "소파·침대·조용한 공간", score: { rest: 1, focus: 1 } },
    b: { label: "밖으로 나감", hint: "산책·카페·거리", score: { social: 1, action: 1 } },
  },
  {
    q: "오늘 밤 마무리는?",
    a: { label: "일찍 쉬기", hint: "몸을 풀고 빨리 잠들기", score: { rest: 2 } },
    b: { label: "조금 더 깨어 있기", hint: "책·영상·생각 정리", score: { focus: 1, action: 1 } },
  },
];

const ICONS = {
  moon:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>',
  zap:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  users:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  target:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
};

const questionEl = document.getElementById("question");
const choiceA = document.getElementById("choice-a");
const choiceB = document.getElementById("choice-b");
const choicesEl = document.getElementById("choices");
const qNum = document.getElementById("q-num");
const lastTypeEl = document.getElementById("last-type");
const progressFill = document.getElementById("progress-fill");
const resultPanel = document.getElementById("result");
const resultBadge = document.getElementById("result-badge");
const resultTitle = document.getElementById("result-title");
const resultDesc = document.getElementById("result-desc");
const resultTags = document.getElementById("result-tags");

let index = 0;
let scores = { rest: 0, action: 0, social: 0, focus: 0 };
let locked = false;

function loadLast() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && data.typeId ? data : null;
  } catch {
    return null;
  }
}

function saveLast(typeId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ typeId: typeId, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

function showLast() {
  const last = loadLast();
  lastTypeEl.textContent = last && TYPES[last.typeId] ? TYPES[last.typeId].title : "-";
}

function fillChoice(button, item) {
  button.classList.remove("is-picked", "is-dim");
  button.innerHTML = `<span class="label">${item.label}</span><span class="hint">${item.hint}</span>`;
  button.setAttribute("aria-label", item.label + " 고르기");
}

function updateHud() {
  qNum.textContent = String(Math.min(index + 1, QUESTIONS.length));
  progressFill.style.width = `${(index / QUESTIONS.length) * 100}%`;
}

function addScore(scoreMap) {
  Object.keys(scoreMap).forEach(function (key) {
    scores[key] = (scores[key] || 0) + scoreMap[key];
  });
}

function pickType() {
  const order = ["rest", "action", "social", "focus"];
  let best = order[0];
  let bestScore = scores[best];
  order.forEach(function (key) {
    if (scores[key] > bestScore) {
      best = key;
      bestScore = scores[key];
    }
  });
  return TYPES[best];
}

function renderQuestion() {
  const item = QUESTIONS[index];
  questionEl.hidden = false;
  choicesEl.hidden = false;
  resultPanel.classList.remove("show");
  questionEl.textContent = item.q;
  fillChoice(choiceA, item.a);
  fillChoice(choiceB, item.b);
  updateHud();
  locked = false;
}

function showResult(type) {
  locked = true;
  choicesEl.hidden = true;
  questionEl.hidden = true;
  progressFill.style.width = "100%";
  resultPanel.classList.add("show");

  resultBadge.innerHTML = ICONS[type.icon] || "";
  resultTitle.textContent = type.title;
  resultDesc.textContent = type.desc;
  resultTags.innerHTML = type.tags.map(function (tag) {
    return "<li>" + tag + "</li>";
  }).join("");

  saveLast(type.id);
  showLast();
}

function pick(side) {
  if (locked || choicesEl.hidden) return;
  locked = true;

  const item = QUESTIONS[index];
  const chosen = item[side];
  const otherBtn = side === "a" ? choiceB : choiceA;
  const chosenBtn = side === "a" ? choiceA : choiceB;
  chosenBtn.classList.add("is-picked");
  otherBtn.classList.add("is-dim");
  addScore(chosen.score);

  window.setTimeout(function () {
    index += 1;
    if (index >= QUESTIONS.length) {
      showResult(pickType());
      return;
    }
    renderQuestion();
  }, 260);
}

function start() {
  index = 0;
  scores = { rest: 0, action: 0, social: 0, focus: 0 };
  locked = false;
  showLast();
  renderQuestion();
}

function copyResult() {
  const title = resultTitle.textContent;
  const desc = resultDesc.textContent;
  const text = "오늘의 하루 타입: " + title + "\n" + desc;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(function () {
      window.prompt("아래 문장을 복사하세요.", text);
    });
    return;
  }
  window.prompt("아래 문장을 복사하세요.", text);
}

choiceA.addEventListener("click", function () {
  pick("a");
});
choiceB.addEventListener("click", function () {
  pick("b");
});
document.getElementById("again").addEventListener("click", start);
document.getElementById("restart").addEventListener("click", start);
document.getElementById("share").addEventListener("click", copyResult);

start();
