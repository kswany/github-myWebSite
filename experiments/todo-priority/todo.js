(function () {
  "use strict";

  var MAX_TASKS = 3;
  var STORAGE_KEY = "kswany-todo-priority-v1";

  var el = {
    form: document.getElementById("add-form"),
    input: document.getElementById("task-input"),
    btnAdd: document.getElementById("btn-add"),
    list: document.getElementById("task-list"),
    emptyMsg: document.getElementById("empty-msg"),
    slotsLeft: document.getElementById("slots-left"),
    summaryCard: document.getElementById("summary-card"),
    summaryLines: document.getElementById("summary-lines"),
    btnClearDone: document.getElementById("btn-clear-done"),
    btnResetAll: document.getElementById("btn-reset-all"),
  };

  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, MAX_TASKS).map(function (t) {
            return {
              id: String(t.id || Date.now() + Math.random()),
              text: String(t.text || "").slice(0, 80),
              done: !!t.done,
            };
          });
        }
      }
    } catch (e) {
      /* ignore */
    }
    return [];
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      /* ignore */
    }
  }

  var tasks = loadTasks();

  function uid() {
    return "t-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function moveItem(index, delta) {
    var next = index + delta;
    if (next < 0 || next >= tasks.length) return;
    var tmp = tasks[index];
    tasks[index] = tasks[next];
    tasks[next] = tmp;
    saveTasks(tasks);
    render();
  }

  function removeTask(id) {
    tasks = tasks.filter(function (t) {
      return t.id !== id;
    });
    saveTasks(tasks);
    render();
  }

  function toggleDone(id) {
    tasks = tasks.map(function (t) {
      if (t.id === id) return { id: t.id, text: t.text, done: !t.done };
      return t;
    });
    saveTasks(tasks);
    render();
  }

  function clearDone() {
    tasks = tasks.filter(function (t) {
      return !t.done;
    });
    saveTasks(tasks);
    render();
  }

  function resetAll() {
    if (tasks.length && !window.confirm("할 일 목록을 모두 지울까요?")) return;
    tasks = [];
    saveTasks(tasks);
    render();
  }

  function addTask(text) {
    var trimmed = text.trim();
    if (!trimmed) return;
    if (tasks.length >= MAX_TASKS) return;
    tasks.push({ id: uid(), text: trimmed.slice(0, 80), done: false });
    saveTasks(tasks);
    el.input.value = "";
    render();
    el.input.focus();
  }

  function svgUp() {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5M5 12l7-7 7 7"/></svg>'
    );
  }

  function svgDown() {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 5v14M5 12l7 7 7-7"/></svg>'
    );
  }

  function svgTrash() {
    return (
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>'
    );
  }

  function render() {
    var left = MAX_TASKS - tasks.length;
    el.slotsLeft.textContent = String(left);
    el.btnAdd.disabled = left <= 0;
    el.input.disabled = left <= 0;
    if (left <= 0) {
      el.input.placeholder = "세 개까지 추가할 수 있어요";
    } else {
      el.input.placeholder = "할 일을 입력하세요";
    }

    el.list.innerHTML = "";
    tasks.forEach(function (task, index) {
      var rank = index + 1;
      var li = document.createElement("li");
      li.className = "task-item" + (task.done ? " done" : "");
      li.dataset.id = task.id;

      var badge = document.createElement("div");
      badge.className = "rank-badge";
      badge.setAttribute("data-rank", String(rank));
      badge.textContent = String(rank);
      badge.setAttribute("aria-label", rank + "순위");

      var main = document.createElement("div");
      main.className = "task-main";
      var p = document.createElement("p");
      p.className = "task-text";
      p.textContent = task.text;
      var label = document.createElement("label");
      label.className = "task-check";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = task.done;
      cb.dataset.action = "toggle";
      cb.dataset.id = task.id;
      label.appendChild(cb);
      label.appendChild(document.createTextNode("완료"));
      main.appendChild(p);
      main.appendChild(label);

      var controls = document.createElement("div");
      controls.className = "task-controls";

      var up = document.createElement("button");
      up.type = "button";
      up.className = "icon-btn";
      up.title = "위로";
      up.innerHTML = svgUp();
      up.disabled = index === 0;
      up.dataset.action = "up";
      up.dataset.index = String(index);

      var down = document.createElement("button");
      down.type = "button";
      down.className = "icon-btn";
      down.title = "아래로";
      down.innerHTML = svgDown();
      down.disabled = index === tasks.length - 1;
      down.dataset.action = "down";
      down.dataset.index = String(index);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "icon-btn";
      del.title = "삭제";
      del.innerHTML = svgTrash();
      del.dataset.action = "delete";
      del.dataset.id = task.id;

      controls.appendChild(up);
      controls.appendChild(down);
      controls.appendChild(del);

      li.appendChild(badge);
      li.appendChild(main);
      li.appendChild(controls);
      el.list.appendChild(li);
    });

    var hasTasks = tasks.length > 0;
    el.emptyMsg.style.display = hasTasks ? "none" : "block";
    el.summaryCard.hidden = !hasTasks;

    el.summaryLines.innerHTML = "";
    tasks.forEach(function (task, i) {
      var li = document.createElement("li");
      var num = document.createElement("span");
      num.className = "num";
      num.textContent = i + 1 + ".";
      li.appendChild(num);
      li.appendChild(document.createTextNode(" " + task.text + (task.done ? " (완료)" : "")));
      el.summaryLines.appendChild(li);
    });
  }

  el.form.addEventListener("submit", function (e) {
    e.preventDefault();
    addTask(el.input.value);
  });

  el.list.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-action]");
    if (!btn) return;
    var action = btn.dataset.action;
    if (action === "up") moveItem(Number(btn.dataset.index), -1);
    if (action === "down") moveItem(Number(btn.dataset.index), 1);
    if (action === "delete") removeTask(btn.dataset.id);
  });

  el.list.addEventListener("change", function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.action === "toggle") toggleDone(t.dataset.id);
  });

  el.btnClearDone.addEventListener("click", clearDone);
  el.btnResetAll.addEventListener("click", resetAll);

  render();
})();
