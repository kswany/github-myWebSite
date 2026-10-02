(function () {
  "use strict";

  var MAX_ITEMS = 5;
  var STORAGE_KEY = "kswany-multi-dday-v1";

  var el = {
    form: document.getElementById("add-form"),
    label: document.getElementById("dday-label"),
    date: document.getElementById("dday-date"),
    btnAdd: document.getElementById("btn-add"),
    slotsLeft: document.getElementById("slots-left"),
    todayLabel: document.getElementById("today-label"),
    overview: document.getElementById("overview"),
    countUpcoming: document.getElementById("count-upcoming"),
    countToday: document.getElementById("count-today"),
    countPast: document.getElementById("count-past"),
    list: document.getElementById("dday-list"),
    emptyMsg: document.getElementById("empty-msg"),
    btnClearPast: document.getElementById("btn-clear-past"),
    btnResetAll: document.getElementById("btn-reset-all"),
  };

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function todayStart() {
    return startOfDay(new Date());
  }

  function formatTodayLabel() {
    var t = todayStart();
    return t.toLocaleDateString("ko-KR", {
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  }

  function diffDays(targetDateStr) {
    var target = startOfDay(new Date(targetDateStr + "T00:00:00"));
    var today = todayStart();
    return Math.round((target - today) / 86400000);
  }

  function loadItems() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_ITEMS).map(function (item) {
            return {
              id: String(item.id || uid()),
              label: String(item.label || "이름 없음").slice(0, 24),
              date: String(item.date || "").slice(0, 10),
            };
          }).filter(function (item) {
            return /^\d{4}-\d{2}-\d{2}$/.test(item.date);
          });
        }
      }
    } catch (e) {
      /* ignore */
    }
    return [];
  }

  function saveItems(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      /* ignore */
    }
  }

  function uid() {
    return "d-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  var items = loadItems();

  function sortItems(list) {
    return list.slice().sort(function (a, b) {
      var da = diffDays(a.date);
      var db = diffDays(b.date);
      if (da !== db) return da - db;
      return a.label.localeCompare(b.label, "ko");
    });
  }

  function badgeFor(diff) {
    if (diff === 0) return { text: "D-Day", cls: "is-today", sub: "바로 오늘입니다" };
    if (diff > 0) {
      return {
        text: "D-" + diff,
        cls: "is-upcoming",
        sub: diff + "일 남았습니다",
      };
    }
    var passed = Math.abs(diff);
    return {
      text: "+" + passed,
      cls: "is-past",
      sub: passed + "일 지났습니다",
    };
  }

  function formatDateLine(dateStr) {
    var d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  }

  function render() {
    el.todayLabel.textContent = formatTodayLabel();
    var left = MAX_ITEMS - items.length;
    el.slotsLeft.textContent = String(Math.max(0, left));
    el.btnAdd.disabled = items.length >= MAX_ITEMS;
    el.date.disabled = items.length >= MAX_ITEMS;
    el.label.disabled = items.length >= MAX_ITEMS;

    var upcoming = 0;
    var todayCount = 0;
    var past = 0;

    items.forEach(function (item) {
      var diff = diffDays(item.date);
      if (diff > 0) upcoming += 1;
      else if (diff === 0) todayCount += 1;
      else past += 1;
    });

    el.overview.hidden = items.length === 0;
    el.countUpcoming.textContent = String(upcoming);
    el.countToday.textContent = String(todayCount);
    el.countPast.textContent = String(past);

    el.list.innerHTML = "";
    sortItems(items).forEach(function (item) {
      var diff = diffDays(item.date);
      var badge = badgeFor(diff);
      var li = document.createElement("li");
      li.className = "dday-item " + badge.cls;
      li.setAttribute("data-id", item.id);

      var badgeEl = document.createElement("div");
      badgeEl.className = "dday-badge";
      badgeEl.textContent = badge.text;

      var body = document.createElement("div");
      body.className = "dday-body";
      var h3 = document.createElement("h3");
      h3.textContent = item.label;
      var pDate = document.createElement("p");
      pDate.textContent = formatDateLine(item.date);
      var pSub = document.createElement("p");
      pSub.textContent = badge.sub;
      body.appendChild(h3);
      body.appendChild(pDate);
      body.appendChild(pSub);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dday-remove";
      btn.textContent = "삭제";
      btn.setAttribute("aria-label", item.label + " 삭제");
      btn.addEventListener("click", function () {
        removeItem(item.id);
      });

      li.appendChild(badgeEl);
      li.appendChild(body);
      li.appendChild(btn);
      el.list.appendChild(li);
    });

    el.emptyMsg.style.display = items.length ? "none" : "block";
    el.btnClearPast.disabled = past === 0;
  }

  function removeItem(id) {
    items = items.filter(function (item) {
      return item.id !== id;
    });
    saveItems(items);
    render();
  }

  function clearPast() {
    var before = items.length;
    items = items.filter(function (item) {
      return diffDays(item.date) >= 0;
    });
    if (items.length === before) return;
    saveItems(items);
    render();
  }

  function resetAll() {
    if (items.length && !window.confirm("등록한 디데이를 모두 지울까요?")) return;
    items = [];
    saveItems(items);
    render();
  }

  function addItem(label, dateStr) {
    if (items.length >= MAX_ITEMS) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return;
    var name = label.trim() || "이름 없음";
    items.push({ id: uid(), label: name.slice(0, 24), date: dateStr });
    saveItems(items);
    el.label.value = "";
    el.date.value = "";
    render();
    el.label.focus();
  }

  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    addItem(el.label.value, el.date.value);
  });

  el.btnClearPast.addEventListener("click", clearPast);
  el.btnResetAll.addEventListener("click", resetAll);

  render();
})();
