(function () {
  "use strict";

  var STORAGE_KEY = "kswany-daily-spend-v1";

  var el = {
    form: document.getElementById("add-form"),
    amount: document.getElementById("amount-input"),
    memo: document.getElementById("memo-input"),
    list: document.getElementById("spend-list"),
    empty: document.getElementById("empty-msg"),
    total: document.getElementById("total-amount"),
    count: document.getElementById("item-count"),
    todayLabel: document.getElementById("today-label"),
    clear: document.getElementById("btn-clear"),
  };

  function todayKey() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }

  function todayLabelText() {
    var d = new Date();
    return d.getMonth() + 1 + "월 " + d.getDate() + "일";
  }

  function formatWon(n) {
    return Number(n).toLocaleString("ko-KR") + "원";
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.dayKey === todayKey() && Array.isArray(parsed.items)) return parsed;
      }
    } catch (e) {
      /* ignore */
    }
    return { dayKey: todayKey(), items: [] };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      /* ignore */
    }
  }

  var state = loadState();

  function sumItems() {
    return state.items.reduce(function (acc, it) {
      return acc + (Number(it.amount) || 0);
    }, 0);
  }

  function render() {
    el.todayLabel.textContent = todayLabelText();
    el.list.innerHTML = "";
    state.items.slice().reverse().forEach(function (item) {
      var li = document.createElement("li");
      li.className = "spend-item";
      li.dataset.id = item.id;

      var memo = document.createElement("p");
      memo.className = "spend-memo" + (item.memo ? "" : " muted");
      memo.textContent = item.memo || "메모 없음";

      var amount = document.createElement("p");
      amount.className = "spend-amount";
      amount.textContent = formatWon(item.amount);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "spend-delete";
      del.textContent = "삭제";
      del.setAttribute("aria-label", formatWon(item.amount) + " 지출 삭제");

      li.appendChild(memo);
      li.appendChild(amount);
      li.appendChild(del);
      el.list.appendChild(li);
    });

    el.total.textContent = formatWon(sumItems());
    el.count.textContent = String(state.items.length);
    el.empty.hidden = state.items.length > 0;
  }

  function addItem(amount, memo) {
    state.items.push({
      id: String(Date.now()) + "-" + Math.random().toString(36).slice(2, 7),
      amount: amount,
      memo: memo,
    });
    saveState(state);
    render();
  }

  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    var amount = Math.floor(Number(el.amount.value));
    if (!amount || amount < 1) {
      el.amount.focus();
      return;
    }
    var memo = (el.memo.value || "").trim();
    addItem(amount, memo);
    el.amount.value = "";
    el.memo.value = "";
    el.amount.focus();
  });

  el.list.addEventListener("click", function (e) {
    var btn = e.target.closest(".spend-delete");
    if (!btn) return;
    var li = btn.closest(".spend-item");
    if (!li) return;
    var id = li.dataset.id;
    state.items = state.items.filter(function (it) {
      return it.id !== id;
    });
    saveState(state);
    render();
  });

  el.clear.addEventListener("click", function () {
    if (!state.items.length) return;
    if (!window.confirm("오늘 적어 둔 지출을 모두 지울까요?")) return;
    state.items = [];
    saveState(state);
    render();
  });

  render();
})();
