const ICONS = [
  {
    id: "tree",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 56V34" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M32 14c-9 2-16 12-12 20 6-4 12-4 12-4s6 0 12 4c4-8-3-18-12-20z" fill="currentColor" opacity=".2"/><path d="M32 12c-10 3-17 14-12 22 7-5 12-4 12-4s5-1 12 4c5-8-2-19-12-22z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "fire",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 12s8 10 8 18c0 8-4 14-8 18-4-4-8-10-8-18 0-8 8-18 8-18z" fill="currentColor" opacity=".2"/><path d="M32 10c2 8 12 14 12 24 0 9-5 16-12 20-7-4-12-11-12-20 0-10 10-16 12-24z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 32c2 3 5 6 5 10 0 4-2 7-5 9-3-2-5-5-5-9 0-4 3-7 5-10z" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`,
  },
  {
    id: "mountain",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M8 50L26 22l10 16 6-10 14 22z" fill="currentColor" opacity=".18"/><path d="M8 50L26 20l10 18 6-12 14 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M22 50h28" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "coin",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="16" fill="currentColor" opacity=".15"/><circle cx="32" cy="32" r="16" fill="none" stroke="currentColor" stroke-width="2.5"/><rect x="26" y="26" width="12" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="2.2"/></svg>`,
  },
  {
    id: "water",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 28c6 0 6 8 12 8s6-8 12-8 6 8 12 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M12 40c6 0 6 8 12 8s6-8 12-8 6 8 12 8" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "flower",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="5" fill="currentColor"/><path d="M32 14c4 6 4 10 0 14-4-4-4-8 0-14zm0 22c4 6 4 10 0 14-4-4-4-8 0-14zM14 32c6 4 10 4 14 0-4-4-8-4-14 0zm22 0c6 4 10 4 14 0-4-4-8-4-14 0z" fill="currentColor" opacity=".22"/><path d="M32 16c3 5 3 9 0 12-3-3-3-7 0-12zm0 20c3 5 3 9 0 12-3-3-3-7 0-12zM16 32c5 3 9 3 12 0-3-3-7-3-12 0zm20 0c5 3 9 3 12 0-3-3-7-3-12 0z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "moon",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M38 14a16 16 0 1 0 10 28 18 18 0 1 1-10-28z" fill="currentColor" opacity=".18"/><path d="M38 14a16 16 0 1 0 10 28 18 18 0 1 1-10-28z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "bird",
    svg: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M12 36c10-2 16-10 20-18 2 8 8 14 20 16-10 2-16 6-20 14-2-8-10-12-20-12z" fill="currentColor" opacity=".18"/><path d="M12 36c10-2 16-10 20-18 2 8 8 14 20 16-10 2-16 6-20 14-2-8-10-12-20-12z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><circle cx="44" cy="32" r="1.6" fill="currentColor"/></svg>`,
  },
];

const BEST_KEY = "kswany-picture-match-best";

const board = document.querySelector("#board");
const movesEl = document.querySelector("#moves");
const timeEl = document.querySelector("#time");
const bestEl = document.querySelector("#best");
const overlay = document.querySelector("#overlay");
const summary = document.querySelector("#summary");

let deck = [];
let flipped = [];
let locked = false;
let moves = 0;
let matched = 0;
let startedAt = 0;
let timerId = 0;

function shuffle(list) {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function formatTime(ms) {
  return (ms / 1000).toFixed(1);
}

function loadBest() {
  const raw = localStorage.getItem(BEST_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function showBest() {
  const best = loadBest();
  bestEl.textContent = best ? `${formatTime(best.ms)}초 / ${best.moves}수` : "-";
}

function tick() {
  if (!startedAt) return;
  timeEl.textContent = formatTime(Date.now() - startedAt);
}

function startTimer() {
  if (startedAt) return;
  startedAt = Date.now();
  timerId = window.setInterval(tick, 100);
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = 0;
}

function win() {
  stopTimer();
  const ms = Date.now() - startedAt;
  tick();
  const prev = loadBest();
  const better = !prev || ms < prev.ms || (ms === prev.ms && moves < prev.moves);
  if (better) localStorage.setItem(BEST_KEY, JSON.stringify({ ms, moves }));
  showBest();
  summary.textContent = `${formatTime(ms)}초, ${moves}번 뒤집었습니다.${better ? " 최고 기록입니다." : ""}`;
  overlay.classList.add("show");
}

function flipBack() {
  const [a, b] = flipped;
  a.el.classList.remove("is-flipped");
  b.el.classList.remove("is-flipped");
  flipped = [];
  locked = false;
}

function onTile(event) {
  const btn = event.currentTarget;
  const index = Number(btn.dataset.index);
  const card = deck[index];
  if (!card || locked || btn.classList.contains("is-flipped") || btn.classList.contains("is-matched")) return;

  startTimer();
  btn.classList.add("is-flipped");
  flipped.push(card);
  if (flipped.length < 2) return;

  moves += 1;
  movesEl.textContent = String(moves);
  locked = true;

  const [a, b] = flipped;
  if (a.pair === b.pair) {
    a.el.classList.add("is-matched");
    b.el.classList.add("is-matched");
    flipped = [];
    locked = false;
    matched += 1;
    if (matched === ICONS.length) win();
    return;
  }

  window.setTimeout(flipBack, 650);
}

function render() {
  board.replaceChildren();
  deck.forEach((card, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "tile";
    btn.dataset.index = String(index);
    btn.setAttribute("aria-label", "카드 뒤집기");
    btn.innerHTML = `
      <span class="face back"></span>
      <span class="face front">${card.svg}</span>
    `;
    card.el = btn;
    btn.addEventListener("click", onTile);
    board.append(btn);
  });
}

function newGame() {
  stopTimer();
  overlay.classList.remove("show");
  flipped = [];
  locked = false;
  moves = 0;
  matched = 0;
  startedAt = 0;
  movesEl.textContent = "0";
  timeEl.textContent = "0.0";
  deck = shuffle(
    ICONS.flatMap((icon) => [
      { pair: icon.id, svg: icon.svg },
      { pair: icon.id, svg: icon.svg },
    ])
  );
  render();
}

document.querySelector("#restart").addEventListener("click", newGame);
document.querySelector("#again").addEventListener("click", newGame);

showBest();
newGame();
