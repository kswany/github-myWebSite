const LAST_KEY = "kswany-food-worldcup-last";

const FOODS = [
  {
    id: "kimchi-jjigae",
    name: "김치찌개",
    hint: "매콤한 국물과 두부",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="20" ry="6" fill="currentColor" opacity=".16"/><path d="M12 34c2 10 10 16 20 16s18-6 20-16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 34h36" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M20 28c4-6 8-4 12 0 4-6 8-4 12 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="26" cy="38" r="2.2" fill="currentColor"/><circle cx="38" cy="40" r="2.2" fill="currentColor"/></svg>`,
  },
  {
    id: "doenjang-jjigae",
    name: "된장찌개",
    hint: "구수한 집밥 국물",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="20" ry="6" fill="currentColor" opacity=".16"/><path d="M12 34c2 10 10 16 20 16s18-6 20-16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16 34h32" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><rect x="24" y="30" width="8" height="8" rx="1.4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M36 32c4 0 6 4 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  {
    id: "bibimbap",
    name: "비빔밥",
    hint: "여러 나물을 한 그릇에",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="18" ry="6" fill="currentColor" opacity=".16"/><path d="M14 34c2 10 9 16 18 16s16-6 18-16" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="30" r="4" fill="currentColor"/><path d="M22 32c4-8 8-8 10-2M42 32c-4-8-8-8-10-2M24 36c6 4 10 4 16 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  {
    id: "bulgogi",
    name: "불고기",
    hint: "달콤하게 구운 고기",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="12" y="22" width="40" height="24" rx="4" fill="currentColor" opacity=".14"/><rect x="12" y="22" width="40" height="24" rx="4" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 30h28M18 38h20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M20 18c2 3 2 5 0 8M32 16c2 3 2 6 0 10M44 18c2 3 2 5 0 8" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>`,
  },
  {
    id: "samgyeopsal",
    name: "삼겹살",
    hint: "노릇하게 구운 살코기",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 28c8-8 28-8 36 0-2 10-8 16-18 16s-16-6-18-16z" fill="currentColor" opacity=".16"/><path d="M14 28c8-8 28-8 36 0-2 10-8 16-18 16s-16-6-18-16z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 30c6-4 22-4 28 0M20 36c6-3 18-3 24 0" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>`,
  },
  {
    id: "naengmyeon",
    name: "냉면",
    hint: "시원한 면과 육수",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="18" ry="6" fill="currentColor" opacity=".16"/><path d="M14 32c2 10 9 16 18 16s16-6 18-16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M20 30c6 8 8 8 12 2 4 8 8 8 12 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="44" cy="24" r="5" fill="none" stroke="currentColor" stroke-width="2.1"/></svg>`,
  },
  {
    id: "tteokbokki",
    name: "떡볶이",
    hint: "매콤달콤한 가래떡",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="10" y="24" width="44" height="20" rx="10" fill="currentColor" opacity=".14"/><rect x="10" y="24" width="44" height="20" rx="10" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 32h10M28 36h12M22 28h16" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><circle cx="48" cy="34" r="3" fill="currentColor"/></svg>`,
  },
  {
    id: "gimbap",
    name: "김밥",
    hint: "한 입에 쏘옥 마는 밥",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="22" cy="32" r="12" fill="currentColor" opacity=".14"/><circle cx="42" cy="32" r="12" fill="currentColor" opacity=".14"/><circle cx="22" cy="32" r="12" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="42" cy="32" r="12" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="22" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="42" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  },
  {
    id: "ramyeon",
    name: "라면",
    hint: "뜨거운 면발과 국물",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="18" ry="6" fill="currentColor" opacity=".16"/><path d="M14 34c2 10 9 16 18 16s16-6 18-16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 30c8 6 10-6 18 2 6 6 8-2 12 4" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M20 36c8 5 12-4 20 2" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><path d="M46 18l4 14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  {
    id: "fried-chicken",
    name: "닭튀김",
    hint: "바삭한 다리 한 조각",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M22 44c-4 4-8 4-10 2 4-8 8-18 18-26 10-2 18 4 20 12-10 2-18 6-28 12z" fill="currentColor" opacity=".16"/><path d="M22 44c-4 4-8 4-10 2 4-8 8-18 18-26 10-2 18 4 20 12-10 2-18 6-28 12z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="44" cy="24" r="2" fill="currentColor"/></svg>`,
  },
  {
    id: "mandu",
    name: "만두",
    hint: "포근하게 찐 한 입",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M14 36c4-12 32-12 36 0-2 10-10 14-18 14s-16-4-18-14z" fill="currentColor" opacity=".16"/><path d="M14 36c4-12 32-12 36 0-2 10-10 14-18 14s-16-4-18-14z" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M24 28c2 6 4 8 8 10M32 26c0 8 0 10 0 14M40 28c-2 6-4 8-8 10" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>`,
  },
  {
    id: "sundubu",
    name: "순두부찌개",
    hint: "부드러운 두부와 국물",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="20" ry="6" fill="currentColor" opacity=".16"/><path d="M12 34c2 10 10 16 20 16s18-6 20-16" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="22" y="28" width="12" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2.1"/><circle cx="40" cy="36" r="3" fill="currentColor"/><path d="M18 26c4-4 8-2 10 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  {
    id: "galbitang",
    name: "갈비탕",
    hint: "맑은 국물에 갈비",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="20" ry="6" fill="currentColor" opacity=".16"/><path d="M12 34c2 10 10 16 20 16s18-6 20-16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M22 30c8-2 12 6 20 4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M26 36c4 0 6-4 10-4s8 4 12 2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  },
  {
    id: "japchae",
    name: "잡채",
    hint: "고소한 당면과 채소",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="44" rx="20" ry="8" fill="currentColor" opacity=".14"/><ellipse cx="32" cy="44" rx="20" ry="8" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M16 40c10 6 22-6 32 2M18 44c8 4 16-4 28 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M24 34l4 8M40 32l-4 10" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/></svg>`,
  },
  {
    id: "kalguksu",
    name: "칼국수",
    hint: "넓적한 면과 따뜻한 국",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="32" cy="46" rx="18" ry="6" fill="currentColor" opacity=".16"/><path d="M14 34c2 10 9 16 18 16s16-6 18-16" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M18 32h28M18 37h22M22 28h18" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "hotteok",
    name: "호떡",
    hint: "달콤한 속 가득한 빵",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="16" fill="currentColor" opacity=".16"/><circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" stroke-width="2.5"/><circle cx="32" cy="32" r="7" fill="none" stroke="currentColor" stroke-width="2.1"/><path d="M32 18v6M46 32h-6M32 46v-6M18 32h6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
];

const ROUND_LABEL = {
  16: "16강",
  8: "8강",
  4: "4강",
  2: "결승",
};

const matchEl = document.querySelector("#match");
const overlay = document.querySelector("#overlay");
const choiceA = document.querySelector("#choice-a");
const choiceB = document.querySelector("#choice-b");
const roundName = document.querySelector("#round-name");
const matchNum = document.querySelector("#match-num");
const matchTotal = document.querySelector("#match-total");
const lastWinnerEl = document.querySelector("#last-winner");
const winnerArt = document.querySelector("#winner-art");
const winnerName = document.querySelector("#winner-name");
const winnerHint = document.querySelector("#winner-hint");

let round = [];
let nextRound = [];
let index = 0;
let locked = false;

function shuffle(list) {
  const next = list.slice();
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}

function loadLast() {
  try {
    return localStorage.getItem(LAST_KEY) || "";
  } catch {
    return "";
  }
}

function saveLast(name) {
  try {
    localStorage.setItem(LAST_KEY, name);
  } catch {
    // ignore quota / private mode
  }
}

function showLast() {
  lastWinnerEl.textContent = loadLast() || "-";
}

function fillCard(button, food) {
  button.innerHTML =
    `<span class="art">${food.svg}</span>` +
    `<p class="name">${food.name}</p>` +
    `<p class="hint">${food.hint}</p>`;
  button.dataset.id = food.id;
  button.setAttribute("aria-label", food.name + " 고르기");
}

function currentPair() {
  return [round[index], round[index + 1]];
}

function renderMatch() {
  overlay.classList.remove("show");
  matchEl.hidden = false;
  const pair = currentPair();
  fillCard(choiceA, pair[0]);
  fillCard(choiceB, pair[1]);
  roundName.textContent = ROUND_LABEL[round.length] || "대결";
  matchNum.textContent = String(index / 2 + 1);
  matchTotal.textContent = String(round.length / 2);
  locked = false;
}

function showWinner(food) {
  matchEl.hidden = true;
  overlay.classList.add("show");
  winnerArt.innerHTML = food.svg;
  winnerName.textContent = food.name;
  winnerHint.textContent = food.hint + ". 오늘 한 끼로 어떠세요?";
  roundName.textContent = "우승";
  matchNum.textContent = "1";
  matchTotal.textContent = "1";
  saveLast(food.name);
  showLast();
}

function pick(food) {
  if (locked || matchEl.hidden) return;
  locked = true;
  nextRound.push(food);
  index += 2;
  if (index < round.length) {
    renderMatch();
    return;
  }
  if (nextRound.length === 1) {
    showWinner(nextRound[0]);
    return;
  }
  round = nextRound;
  nextRound = [];
  index = 0;
  renderMatch();
}

function start() {
  locked = false;
  round = shuffle(FOODS);
  nextRound = [];
  index = 0;
  showLast();
  renderMatch();
}

choiceA.addEventListener("click", function () {
  pick(currentPair()[0]);
});

choiceB.addEventListener("click", function () {
  pick(currentPair()[1]);
});

document.querySelector("#again").addEventListener("click", start);
document.querySelector("#restart").addEventListener("click", start);

start();
