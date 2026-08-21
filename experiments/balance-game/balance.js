const STORAGE_KEY = "kswany-balance-game-last";

function photo(id) {
  return "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=900&q=70";
}

const QUESTIONS = [
  {
    q: "지금 더 먹고 싶은 쪽",
    a: { name: "치킨", hint: "바삭한 한 조각", photo: photo("photo-1626082927389-6cd097cdc6ec") },
    b: { name: "피자", hint: "치즈가 늘어나는 한 판", photo: photo("photo-1513104890138-7c749659a591") },
  },
  {
    q: "주말에 떠나면",
    a: { name: "바다", hint: "파도 소리와 바람", photo: photo("photo-1507525428034-b723cf961d3e") },
    b: { name: "산", hint: "숲길과 정상 바람", photo: photo("photo-1464822759023-fed622ff2c3b") },
  },
  {
    q: "창밖이 이런 날이면",
    a: { name: "비", hint: "창에 떨어지는 빗소리", photo: photo("photo-1515694346937-94d85e41e6f0") },
    b: { name: "눈", hint: "밤새 쌓인 하얀 아침", photo: photo("photo-1491002052546-bf38f669ada1") },
  },
  {
    q: "쉬는 날 오후에",
    a: { name: "이불 속", hint: "아무것도 안 하는 낮잠", photo: photo("photo-1541781774459-bb2af2f05b55") },
    b: { name: "바깥 산책", hint: "바람 맞으며 한 바퀴", photo: photo("photo-1441974231531-c6227db76b6e") },
  },
  {
    q: "일할 자리는",
    a: { name: "카페", hint: "커피 향과 창가 자리", photo: photo("photo-1495474472287-4d71bcdd2085") },
    b: { name: "우리 집", hint: "편한 옷과 내 책상", photo: photo("photo-1505691938895-1758d7feb511") },
  },
  {
    q: "더 좋아하는 계절",
    a: { name: "여름", hint: "긴 해와 차가운 음료", photo: photo("photo-1473496169904-658ba7c44d8a") },
    b: { name: "겨울", hint: "짧은 해와 따뜻한 손", photo: photo("photo-1418985991508-e47386d96a71") },
  },
  {
    q: "살고 싶은 풍경",
    a: { name: "도시 밤", hint: "불빛과 늦은 거리", photo: photo("photo-1514565131-fce0801e5785") },
    b: { name: "작은 마을", hint: "논밭과 낮은 지붕", photo: photo("photo-1500382017468-9049fed747ef") },
  },
  {
    q: "에너지가 살아나는 때",
    a: { name: "아침", hint: "해가 뜨는 고요한 시간", photo: photo("photo-1470252649378-9c29740c9fa8") },
    b: { name: "깊은 밤", hint: "모두가 잠든 뒤의 집중", photo: photo("photo-1519608487953-e999c86e7455") },
  },
];

const matchEl = document.getElementById("match");
const questionEl = document.getElementById("question");
const choiceA = document.getElementById("choice-a");
const choiceB = document.getElementById("choice-b");
const qNum = document.getElementById("q-num");
const lastPicksEl = document.getElementById("last-picks");
const progressFill = document.getElementById("progress-fill");
const resultPanel = document.getElementById("result");
const mosaic = document.getElementById("mosaic");
const resultTitle = document.getElementById("result-title");
const resultDesc = document.getElementById("result-desc");

let deck = [];
let index = 0;
let picks = [];
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
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && Array.isArray(data.names) ? data : null;
  } catch {
    return null;
  }
}

function saveLast(names) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ names: names, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

function showLast() {
  const last = loadLast();
  lastPicksEl.textContent = last ? last.names.slice(0, 3).join(" · ") : "-";
}

function fillCard(button, item) {
  button.classList.remove("is-picked", "is-dim");
  button.innerHTML =
    `<span class="pick-media"><img src="${item.photo}" alt="" /><span class="pick-overlay"></span></span>` +
    `<span class="pick-copy"><p class="name">${item.name}</p><p class="hint">${item.hint}</p></span>`;
  button.setAttribute("aria-label", item.name + " 고르기");
}

function updateHud() {
  qNum.textContent = String(Math.min(index + 1, deck.length));
  progressFill.style.width = `${(index / deck.length) * 100}%`;
}

function renderQuestion() {
  const item = deck[index];
  questionEl.hidden = false;
  matchEl.hidden = false;
  resultPanel.classList.remove("show");
  questionEl.textContent = item.q;
  fillCard(choiceA, item.a);
  fillCard(choiceB, item.b);
  updateHud();
  locked = false;
}

function resultCopy(names) {
  const cozy = ["치킨", "이불 속", "우리 집", "겨울", "작은 마을", "아침", "비"].filter((n) => names.includes(n)).length;
  if (cozy >= 5) {
    return {
      title: "오늘은 안쪽으로",
      desc: names.join(" · ") + ". 따뜻하고 익숙한 쪽으로 손이 갔어요.",
    };
  }
  if (cozy <= 3) {
    return {
      title: "오늘은 바깥으로",
      desc: names.join(" · ") + ". 넓고 새 쪽으로 마음이 기울었어요.",
    };
  }
  return {
    title: "오늘은 반반",
    desc: names.join(" · ") + ". 편한 것과 새로운 것을 같이 골랐어요.",
  };
}

function showResult() {
  locked = true;
  matchEl.hidden = true;
  questionEl.hidden = true;
  progressFill.style.width = "100%";
  resultPanel.classList.add("show");

  const names = picks.map((p) => p.name);
  mosaic.innerHTML = picks
    .map((p) => `<figure><img src="${p.photo}" alt="${p.name}" /></figure>`)
    .join("");

  const copy = resultCopy(names);
  resultTitle.textContent = copy.title;
  resultDesc.textContent = copy.desc;
  saveLast(names);
  showLast();
}

function pick(side) {
  if (locked || matchEl.hidden) return;
  locked = true;

  const item = deck[index];
  const chosen = item[side];
  const otherBtn = side === "a" ? choiceB : choiceA;
  const chosenBtn = side === "a" ? choiceA : choiceB;
  chosenBtn.classList.add("is-picked");
  otherBtn.classList.add("is-dim");
  picks.push(chosen);

  window.setTimeout(function () {
    index += 1;
    if (index >= deck.length) {
      showResult();
      return;
    }
    renderQuestion();
  }, 280);
}

function start() {
  deck = shuffle(QUESTIONS);
  index = 0;
  picks = [];
  locked = false;
  showLast();
  renderQuestion();
}

choiceA.addEventListener("click", function () {
  pick("a");
});
choiceB.addEventListener("click", function () {
  pick("b");
});
document.getElementById("again").addEventListener("click", start);
document.getElementById("restart").addEventListener("click", start);

start();
