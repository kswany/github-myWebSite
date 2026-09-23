(function () {
  "use strict";

  var CATEGORIES = [
    {
      id: "rice",
      label: "밥·면",
      foods: [
        { id: "rice-bowl", name: "공기밥", unit: "1공기", kcal: 210 },
        { id: "bibimbap", name: "비빔밥", unit: "1인분", kcal: 580 },
        { id: "kimchi-rice", name: "김치볶음밥", unit: "1인분", kcal: 520 },
        { id: "ramen", name: "라면", unit: "1봉", kcal: 500 },
        { id: "jajang", name: "짜장면", unit: "1그릇", kcal: 780 },
        { id: "jjamppong", name: "짬뽕", unit: "1그릇", kcal: 640 },
        { id: "naengmyeon", name: "냉면", unit: "1그릇", kcal: 450 },
        { id: "kimbap", name: "김밥", unit: "1줄", kcal: 320 },
      ],
    },
    {
      id: "protein",
      label: "고기·단백질",
      foods: [
        { id: "pork", name: "삼겹살", unit: "100g", kcal: 270 },
        { id: "chicken", name: "닭가슴살", unit: "100g", kcal: 165 },
        { id: "egg", name: "계란", unit: "1개", kcal: 75 },
        { id: "tofu", name: "두부", unit: "1/2모", kcal: 80 },
        { id: "sausage", name: "소시지", unit: "1개", kcal: 180 },
        { id: "tuna-can", name: "참치캔", unit: "1캔(소)", kcal: 120 },
      ],
    },
    {
      id: "bread",
      label: "빵·간식",
      foods: [
        { id: "bread-slice", name: "식빵", unit: "1장", kcal: 80 },
        { id: "croissant", name: "크로아상", unit: "1개", kcal: 230 },
        { id: "cookie", name: "과자", unit: "한 줌", kcal: 150 },
        { id: "icecream", name: "아이스크림", unit: "1개", kcal: 250 },
        { id: "chocolate", name: "초콜릿", unit: "1줄", kcal: 55 },
      ],
    },
    {
      id: "drink",
      label: "음료",
      foods: [
        { id: "americano", name: "아메리카노", unit: "1잔", kcal: 5 },
        { id: "latte", name: "카페라떼", unit: "1잔", kcal: 180 },
        { id: "milk-tea", name: "밀크티", unit: "1잔", kcal: 320 },
        { id: "cola", name: "콜라", unit: "250ml", kcal: 105 },
        { id: "juice", name: "주스", unit: "200ml", kcal: 90 },
        { id: "soju", name: "소주", unit: "1잔", kcal: 65 },
      ],
    },
    {
      id: "fruit",
      label: "과일·야채",
      foods: [
        { id: "apple", name: "사과", unit: "1개", kcal: 130 },
        { id: "banana", name: "바나나", unit: "1개", kcal: 90 },
        { id: "orange", name: "귤", unit: "3알", kcal: 70 },
        { id: "salad", name: "샐러드", unit: "1접시", kcal: 120 },
        { id: "kimchi", name: "김치", unit: "1접시", kcal: 25 },
      ],
    },
  ];

  var PORTIONS = [
    { mult: 0.5, label: "반" },
    { mult: 1, label: "1" },
    { mult: 1.5, label: "1.5" },
    { mult: 2, label: "2" },
  ];

  var catTabs = document.getElementById("cat-tabs");
  var foodGrid = document.getElementById("food-grid");
  var mealList = document.getElementById("meal-list");
  var mealEmpty = document.getElementById("meal-empty");
  var totalKcalEl = document.getElementById("total-kcal");
  var totalHint = document.getElementById("total-hint");
  var progressBar = document.getElementById("progress-bar");
  var dailyGoal = document.getElementById("daily-goal");
  var dailyGoalVal = document.getElementById("daily-goal-val");
  var clearAllBtn = document.getElementById("clear-all");
  var goalPresets = document.querySelectorAll(".preset[data-goal]");

  var activeCat = CATEGORIES[0].id;
  var items = [];
  var nextId = 1;

  function foodById(foodId) {
    for (var c = 0; c < CATEGORIES.length; c++) {
      var list = CATEGORIES[c].foods;
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === foodId) return list[i];
      }
    }
    return null;
  }

  function formatKcal(n) {
    return Math.round(n).toLocaleString("ko-KR");
  }

  function sumTotal() {
    var sum = 0;
    items.forEach(function (it) {
      sum += it.food.kcal * it.mult;
    });
    return sum;
  }

  function updateTotal() {
    var total = sumTotal();
    var goal = Number(dailyGoal.value) || 2000;
    totalKcalEl.textContent = formatKcal(total);

    var pct = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
    progressBar.style.width = pct + "%";
    progressBar.classList.remove("warn", "over");
    if (total > goal) {
      progressBar.classList.add("over");
      progressBar.style.width = "100%";
      totalHint.textContent =
        "목표보다 " + formatKcal(total - goal) + " kcal 많습니다. 참고용으로만 보세요.";
    } else if (total >= goal * 0.85) {
      progressBar.classList.add("warn");
      totalHint.textContent =
        "목표의 " + Math.round((total / goal) * 100) + "% · 남은 " + formatKcal(goal - total) + " kcal";
    } else if (total === 0) {
      totalHint.textContent = "음식을 눌러 목록에 담으세요.";
    } else {
      totalHint.textContent =
        "목표의 " + Math.round((total / goal) * 100) + "% · 남은 " + formatKcal(goal - total) + " kcal";
    }
  }

  function renderMeals() {
    var existing = mealList.querySelectorAll(".meal-item");
    existing.forEach(function (el) {
      el.remove();
    });

    if (items.length === 0) {
      mealEmpty.hidden = false;
      updateTotal();
      return;
    }

    mealEmpty.hidden = true;

    items.forEach(function (it) {
      var li = document.createElement("li");
      li.className = "meal-item";
      li.dataset.id = String(it.id);

      var info = document.createElement("div");
      info.className = "meal-info";
      var title = document.createElement("strong");
      title.textContent = it.food.name;
      var sub = document.createElement("span");
      sub.textContent = it.food.unit + " · 기준 " + formatKcal(it.food.kcal) + " kcal";
      info.appendChild(title);
      info.appendChild(sub);

      var kcal = document.createElement("div");
      kcal.className = "meal-kcal";
      kcal.textContent = formatKcal(it.food.kcal * it.mult) + " kcal";

      var portionRow = document.createElement("div");
      portionRow.className = "portion-row";
      var plabel = document.createElement("label");
      plabel.textContent = "분량";
      portionRow.appendChild(plabel);

      PORTIONS.forEach(function (p) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "portion-chip" + (it.mult === p.mult ? " active" : "");
        chip.textContent = p.label;
        chip.dataset.mult = String(p.mult);
        chip.addEventListener("click", function () {
          it.mult = p.mult;
          renderMeals();
        });
        portionRow.appendChild(chip);
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-btn";
      remove.textContent = "삭제";
      remove.addEventListener("click", function () {
        items = items.filter(function (x) {
          return x.id !== it.id;
        });
        renderMeals();
      });
      portionRow.appendChild(remove);

      li.appendChild(info);
      li.appendChild(kcal);
      li.appendChild(portionRow);
      mealList.appendChild(li);
    });

    updateTotal();
  }

  function addFood(foodId) {
    var food = foodById(foodId);
    if (!food) return;
    items.push({ id: nextId++, food: food, mult: 1 });
    renderMeals();
  }

  function renderFoodGrid() {
    foodGrid.innerHTML = "";
    var cat = CATEGORIES.filter(function (c) {
      return c.id === activeCat;
    })[0];
    if (!cat) return;

    cat.foods.forEach(function (f) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "food-btn";
      btn.setAttribute("role", "listitem");
      btn.innerHTML =
        "<strong>" +
        f.name +
        "</strong><span>" +
        f.unit +
        "</span><em>" +
        formatKcal(f.kcal) +
        " kcal</em>";
      btn.addEventListener("click", function () {
        addFood(f.id);
      });
      foodGrid.appendChild(btn);
    });
  }

  function renderTabs() {
    catTabs.innerHTML = "";
    CATEGORIES.forEach(function (cat) {
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "tab" + (cat.id === activeCat ? " active" : "");
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", cat.id === activeCat ? "true" : "false");
      tab.textContent = cat.label;
      tab.addEventListener("click", function () {
        activeCat = cat.id;
        renderTabs();
        renderFoodGrid();
      });
      catTabs.appendChild(tab);
    });
  }

  dailyGoal.addEventListener("input", function () {
    dailyGoalVal.textContent = dailyGoal.value;
    goalPresets.forEach(function (btn) {
      btn.classList.toggle("active", Number(btn.dataset.goal) === Number(dailyGoal.value));
    });
    updateTotal();
  });

  goalPresets.forEach(function (btn) {
    btn.addEventListener("click", function () {
      dailyGoal.value = btn.dataset.goal;
      dailyGoalVal.textContent = btn.dataset.goal;
      goalPresets.forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      updateTotal();
    });
  });

  clearAllBtn.addEventListener("click", function () {
    items = [];
    renderMeals();
  });

  renderTabs();
  renderFoodGrid();
  updateTotal();
})();
