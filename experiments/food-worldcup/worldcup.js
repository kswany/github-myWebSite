const LAST_KEY = "kswany-food-worldcup-last";

function photo(id) {
  return "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=900&q=70";
}

const FOODS = [
  { id: "kimchi-jjigae", name: "김치찌개", hint: "매콤한 국물과 두부", photo: photo("photo-1583224994076-ae9514109eb1") },
  { id: "doenjang-jjigae", name: "된장찌개", hint: "구수한 집밥 국물", photo: photo("photo-1547592166-23acba8d04f0") },
  { id: "bibimbap", name: "비빔밥", hint: "여러 나물을 한 그릇에", photo: photo("photo-1553163147-622ab57be1c7") },
  { id: "bulgogi", name: "불고기", hint: "달콤하게 구운 고기", photo: photo("photo-1590301157890-4810ed352733") },
  { id: "samgyeopsal", name: "삼겹살", hint: "노릇하게 구운 살코기", photo: photo("photo-1544025162-d766402d5b3b") },
  { id: "naengmyeon", name: "냉면", hint: "시원한 면과 육수", photo: photo("photo-1582878826629-29b7ad1cdc43") },
  { id: "tteokbokki", name: "떡볶이", hint: "매콤달콤한 가래떡", photo: photo("photo-1635363638580-c2809d049eee") },
  { id: "gimbap", name: "김밥", hint: "한 입에 쏘옥 마는 밥", photo: photo("photo-1617093727343-374698b1b08d") },
  { id: "ramyeon", name: "라면", hint: "뜨거운 면발과 국물", photo: photo("photo-1569718212165-3a8278d5f624") },
  { id: "fried-chicken", name: "닭튀김", hint: "바삭한 다리 한 조각", photo: photo("photo-1626082927389-6cd097cdc6ec") },
  { id: "mandu", name: "만두", hint: "포근하게 찐 한 입", photo: photo("photo-1496116218417-1a781b1c416c") },
  { id: "sundubu", name: "순두부찌개", hint: "부드러운 두부와 국물", photo: photo("photo-1574484284002-952d92456975") },
  { id: "galbitang", name: "갈비탕", hint: "맑은 국물에 갈비", photo: photo("photo-1476224203421-9ac39bcb3327") },
  { id: "japchae", name: "잡채", hint: "고소한 당면과 채소", photo: photo("photo-1512058564366-18510be2db19") },
  { id: "kalguksu", name: "칼국수", hint: "넓적한 면과 따뜻한 국", photo: photo("photo-1557872943-16a5ac26437e") },
  { id: "hotteok", name: "호떡", hint: "달콤한 속 가득한 빵", photo: photo("photo-1567620905732-2d1ec7ab7445") },
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
    `<span class="food-media"><img src="${food.photo}" alt="" /><span class="food-overlay"></span></span>` +
    `<span class="food-copy"><p class="name">${food.name}</p><p class="hint">${food.hint}</p></span>`;
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
  winnerArt.innerHTML = `<img src="${food.photo}" alt="${food.name}" />`;
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
