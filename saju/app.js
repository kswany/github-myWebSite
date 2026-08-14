const form = document.querySelector("#saju-form");
const result = document.querySelector("#result");

function fillYears() {
  const year = document.querySelector("#year");
  const now = new Date().getFullYear();
  for (let y = now; y >= 1920; y--) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = `${y}년`;
    if (y === 1990) opt.selected = true;
    year.append(opt);
  }
}

function fillDays() {
  const y = Number(document.querySelector("#year").value);
  const m = Number(document.querySelector("#month").value);
  const day = document.querySelector("#day");
  const prev = Number(day.value) || 1;
  const last = new Date(y, m, 0).getDate();
  day.innerHTML = "";
  for (let d = 1; d <= last; d++) {
    const opt = document.createElement("option");
    opt.value = String(d);
    opt.textContent = `${d}일`;
    if (d === Math.min(prev, last)) opt.selected = true;
    day.append(opt);
  }
}

function fillTime() {
  const hour = document.querySelector("#hour");
  const minute = document.querySelector("#minute");
  for (let h = 0; h < 24; h++) {
    const opt = document.createElement("option");
    opt.value = String(h);
    opt.textContent = `${String(h).padStart(2, "0")}시`;
    if (h === 12) opt.selected = true;
    hour.append(opt);
  }
  for (let m = 0; m < 60; m += 10) {
    const opt = document.createElement("option");
    opt.value = String(m);
    opt.textContent = `${String(m).padStart(2, "0")}분`;
    minute.append(opt);
  }
}

function toggleTime() {
  const unknown = document.querySelector("#timeUnknown").checked;
  document.querySelector("#hour").disabled = unknown;
  document.querySelector("#minute").disabled = unknown;
}

function render(data) {
  const order = data.timeUnknown
    ? ["year", "month", "day"]
    : ["hour", "day", "month", "year"];
  const map = Object.fromEntries(data.pillars.map((p) => [p.key, p]));
  const shown = order.map((k) => map[k]).filter(Boolean);

  document.querySelector("#pillars").innerHTML = shown
    .map(
      (p) => `
      <article class="pillar">
        <div class="role">${p.label}</div>
        <div class="han"><span class="stem">${p.pillar.stemKo}</span><br><span class="branch">${p.pillar.branchKo}</span></div>
        <div class="meta">${p.pillar.hanja}<br>${p.stemGod} · ${p.stemEl}<br>지지 ${p.branchGod} · ${p.branchEl}</div>
      </article>`
    )
    .join("");

  const max = Math.max(...Object.values(data.counts), 1);
  const cls = { 목: "wood", 화: "fire", 토: "earth", 금: "metal", 수: "water" };
  document.querySelector("#elements").innerHTML = Saju.ELEMENTS.map(
    (el) => `
      <div class="bar-row">
        <span>${el}</span>
        <div class="bar-track"><div class="bar-fill ${cls[el]}" style="width:${(data.counts[el] / max) * 100}%"></div></div>
        <span>${data.counts[el]}</span>
      </div>`
  ).join("");

  document.querySelector("#luck").innerHTML = data.luck
    .map(
      (item) => `
      <div class="luck-item">
        <span>${item.age}세</span>
        <strong>${item.name}</strong>
        <span>${item.hanja}</span>
      </div>`
    )
    .join("");

  document.querySelector("#reading").textContent = data.reading;
  document.querySelector("#lichun").textContent = `${data.lichunNote}. 대운은 ${data.forward ? "순행" : "역행"}, 대략 ${data.startAge}세부터입니다.`;
  result.classList.add("show");
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

fillYears();
fillTime();
fillDays();
toggleTime();

document.querySelector("#year").addEventListener("change", fillDays);
document.querySelector("#month").addEventListener("change", fillDays);
document.querySelector("#timeUnknown").addEventListener("change", toggleTime);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = Saju.calculate({
    year: Number(document.querySelector("#year").value),
    month: Number(document.querySelector("#month").value),
    day: Number(document.querySelector("#day").value),
    hour: Number(document.querySelector("#hour").value),
    minute: Number(document.querySelector("#minute").value),
    gender: document.querySelector("input[name=gender]:checked").value,
    timeUnknown: document.querySelector("#timeUnknown").checked,
  });
  render(data);
});

document.querySelector("#reset").addEventListener("click", () => {
  result.classList.remove("show");
  form.reset();
  fillDays();
  toggleTime();
});
