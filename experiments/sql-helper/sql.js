(function () {
  "use strict";

  var queryType = "select";
  var whereIndex = 0;

  var typeTabs = document.querySelectorAll(".type-tab");
  var tableName = document.getElementById("table-name");
  var columns = document.getElementById("columns");
  var values = document.getElementById("values");
  var setClause = document.getElementById("set-clause");
  var fieldColumns = document.getElementById("field-columns");
  var fieldValues = document.getElementById("field-values");
  var fieldSet = document.getElementById("field-set");
  var columnsLabel = document.getElementById("columns-label");
  var whereBlock = document.getElementById("where-block");
  var whereList = document.getElementById("where-list");
  var addWhereBtn = document.getElementById("add-where");
  var generateBtn = document.getElementById("generate-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var clearBtn = document.getElementById("clear-btn");
  var outputWrap = document.getElementById("output-wrap");
  var sqlOutput = document.getElementById("sql-output");
  var copyBtn = document.getElementById("copy-btn");
  var copyHint = document.getElementById("copy-hint");

  function escapeIdentifier(name) {
    return name.replace(/`/g, "``");
  }

  function quoteValue(raw) {
    var trimmed = raw.trim();
    if (!trimmed) return "''";
    if (/^(NULL|null)$/i.test(trimmed)) return "NULL";
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return trimmed;
    if (
      (trimmed.charAt(0) === "'" && trimmed.charAt(trimmed.length - 1) === "'") ||
      (trimmed.charAt(0) === '"' && trimmed.charAt(trimmed.length - 1) === '"')
    ) {
      return trimmed;
    }
    return "'" + trimmed.replace(/'/g, "''") + "'";
  }

  function createWhereRow(data) {
    whereIndex += 1;
    var id = "where-" + whereIndex;
    var row = document.createElement("div");
    row.className = "where-row";
    row.dataset.id = String(whereIndex);

    var joinHtml =
      whereList.children.length > 0
        ? '<select class="join-select" aria-label="연결">' +
          '<option value="AND"' +
          (data && data.join === "OR" ? "" : " selected") +
          ">AND</option>" +
          '<option value="OR"' +
          (data && data.join === "OR" ? " selected" : "") +
          ">OR</option>" +
          "</select>"
        : '<span class="join-select" aria-hidden="true">WHERE</span>';

    row.innerHTML =
      joinHtml +
      '<input type="text" placeholder="열 이름" value="' +
      (data && data.column ? data.column : "") +
      '" aria-label="열">' +
      '<select aria-label="연산자">' +
      '<option value="="' +
      (data && data.op === "=" ? " selected" : "") +
      ">=</option>" +
      '<option value="!="' +
      (data && data.op === "!=" ? " selected" : "") +
      ">!=</option>" +
      '<option value=">"' +
      (data && data.op === ">" ? " selected" : "") +
      ">&gt;</option>" +
      '<option value="<"' +
      (data && data.op === "<" ? " selected" : "") +
      ">&lt;</option>" +
      '<option value=">="' +
      (data && data.op === ">=" ? " selected" : "") +
      ">&gt;=</option>" +
      '<option value="<="' +
      (data && data.op === "<=" ? " selected" : "") +
      ">&lt;=</option>" +
      '<option value="LIKE"' +
      (data && data.op === "LIKE" ? " selected" : "") +
      ">LIKE</option>" +
      '<option value="IN"' +
      (data && data.op === "IN" ? " selected" : "") +
      ">IN</option>" +
      '<option value="IS NULL"' +
      (data && data.op === "IS NULL" ? " selected" : "") +
      ">IS NULL</option>" +
      "</select>" +
      '<input type="text" placeholder="값" value="' +
      (data && data.value ? data.value : "") +
      '" aria-label="값">' +
      '<button type="button" class="remove-where" aria-label="조건 삭제">×</button>';

    row.querySelector(".remove-where").addEventListener("click", function () {
      row.remove();
      refreshWhereJoins();
    });

    var opSelect = row.querySelector("select:not(.join-select)");
    var valueInput = row.querySelector('input[aria-label="값"]');
    if (opSelect && valueInput) {
      opSelect.addEventListener("change", function () {
        if (opSelect.value === "IS NULL") {
          valueInput.value = "";
          valueInput.disabled = true;
        } else {
          valueInput.disabled = false;
        }
      });
      if (opSelect.value === "IS NULL") valueInput.disabled = true;
    }

    return row;
  }

  function refreshWhereJoins() {
    var rows = whereList.querySelectorAll(".where-row");
    rows.forEach(function (row, index) {
      var first = row.firstElementChild;
      if (index === 0) {
        if (first && first.classList.contains("join-select") && first.tagName === "SELECT") {
          var span = document.createElement("span");
          span.className = "join-select";
          span.textContent = "WHERE";
          span.setAttribute("aria-hidden", "true");
          row.replaceChild(span, first);
        }
      } else if (first && first.tagName === "SPAN") {
        var select = document.createElement("select");
        select.className = "join-select";
        select.setAttribute("aria-label", "연결");
        select.innerHTML = '<option value="AND" selected>AND</option><option value="OR">OR</option>';
        row.replaceChild(select, first);
      }
    });
  }

  function addWhereRow(data) {
    whereList.appendChild(createWhereRow(data));
    refreshWhereJoins();
  }

  function collectWhere() {
    var parts = [];
    var rows = whereList.querySelectorAll(".where-row");

    rows.forEach(function (row, index) {
      var inputs = row.querySelectorAll("input");
      var selects = row.querySelectorAll("select");
      var column = inputs[0] ? inputs[0].value.trim() : "";
      var op = selects.length > 1 ? selects[1].value : selects[0] ? selects[0].value : "=";
      var value = inputs[1] ? inputs[1].value.trim() : "";

      if (!column) return;

      var clause;
      if (op === "IS NULL") {
        clause = "`" + escapeIdentifier(column) + "` IS NULL";
      } else if (op === "IN") {
        clause = "`" + escapeIdentifier(column) + "` IN (" + (value || "1, 2") + ")";
      } else if (op === "LIKE") {
        clause = "`" + escapeIdentifier(column) + "` LIKE " + quoteValue(value || "%");
      } else {
        clause = "`" + escapeIdentifier(column) + "` " + op + " " + quoteValue(value);
      }

      if (index === 0) {
        parts.push(clause);
      } else {
        var joinEl = row.querySelector(".join-select");
        var join = joinEl && joinEl.tagName === "SELECT" ? joinEl.value : "AND";
        parts.push(join + " " + clause);
      }
    });

    return parts.length ? "WHERE " + parts.join(" ") : "";
  }

  function setType(type) {
    queryType = type;

    typeTabs.forEach(function (tab) {
      var active = tab.dataset.type === type;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    fieldColumns.classList.toggle("hidden", type === "delete");
    fieldValues.classList.toggle("hidden", type !== "insert");
    fieldSet.classList.toggle("hidden", type !== "update");
    whereBlock.classList.toggle("hidden", type === "insert");

    if (type === "insert") {
      columnsLabel.textContent = "넣을 열 (쉼표로 구분)";
      columns.placeholder = "name, age, city";
    } else if (type === "select") {
      columnsLabel.textContent = "가져올 열 (쉼표로 구분, * 가능)";
      columns.placeholder = "id, name, email";
    } else if (type === "update") {
      columnsLabel.textContent = "가져올 열 (사용 안 함 — UPDATE는 아래 SET 사용)";
      columns.placeholder = "";
    }
  }

  function generate() {
    var table = tableName.value.trim();
    if (!table) {
      sqlOutput.textContent = "-- 표 이름을 입력해 주세요.";
      outputWrap.hidden = false;
      copyHint.textContent = "";
      return;
    }

    var safeTable = "`" + escapeIdentifier(table) + "`";
    var where = queryType === "insert" ? "" : collectWhere();
    var sql = "";

    if (queryType === "select") {
      var cols = columns.value.trim() || "*";
      var colList = cols === "*" ? "*" : cols.split(",").map(function (c) {
        var part = c.trim();
        if (part === "*") return "*";
        return "`" + escapeIdentifier(part) + "`";
      }).join(", ");
      sql = "SELECT " + colList + "\nFROM " + safeTable;
      if (where) sql += "\n" + where;
      sql += ";";
    } else if (queryType === "insert") {
      var insertCols = columns.value.trim();
      var insertVals = values.value.trim();
      if (!insertCols || !insertVals) {
        sqlOutput.textContent = "-- INSERT는 열과 값을 모두 입력해 주세요.";
        outputWrap.hidden = false;
        copyHint.textContent = "";
        return;
      }
      var colNames = insertCols.split(",").map(function (c) {
        return "`" + escapeIdentifier(c.trim()) + "`";
      }).join(", ");
      var valList = insertVals.split(",").map(function (v) {
        return quoteValue(v);
      }).join(", ");
      sql = "INSERT INTO " + safeTable + " (" + colNames + ")\nVALUES (" + valList + ");";
    } else if (queryType === "update") {
      var setText = setClause.value.trim();
      if (!setText) {
        sqlOutput.textContent = "-- UPDATE는 바꿀 내용(SET)을 입력해 주세요.";
        outputWrap.hidden = false;
        copyHint.textContent = "";
        return;
      }
      sql = "UPDATE " + safeTable + "\nSET " + setText;
      if (where) sql += "\n" + where;
      sql += ";";
    } else if (queryType === "delete") {
      sql = "DELETE FROM " + safeTable;
      if (where) sql += "\n" + where;
      sql += ";";
    }

    sqlOutput.textContent = sql;
    outputWrap.hidden = false;
    copyHint.textContent = "MySQL 스타일로 만듭니다. 다른 DB는 문법을 조금 바꿔 쓰세요.";
  }

  function loadSample() {
    setType("select");
    tableName.value = "users";
    columns.value = "id, name, email";
    values.value = "";
    setClause.value = "";
    whereList.innerHTML = "";
    addWhereRow({ column: "status", op: "=", value: "active" });
    addWhereRow({ join: "AND", column: "age", op: ">=", value: "18" });
    generate();
  }

  function clearAll() {
    tableName.value = "";
    columns.value = "";
    values.value = "";
    setClause.value = "";
    whereList.innerHTML = "";
    outputWrap.hidden = true;
    sqlOutput.textContent = "";
    copyHint.textContent = "";
    copyBtn.classList.remove("copied");
    tableName.focus();
  }

  function copySql() {
    var text = sqlOutput.textContent;
    if (!text) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        copyBtn.classList.add("copied");
        copyBtn.textContent = "복사됨";
        setTimeout(function () {
          copyBtn.classList.remove("copied");
          copyBtn.textContent = "복사";
        }, 1600);
      });
      return;
    }

    var area = document.createElement("textarea");
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
    copyBtn.textContent = "복사됨";
  }

  typeTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setType(tab.dataset.type);
    });
  });

  addWhereBtn.addEventListener("click", function () {
    addWhereRow({});
  });

  generateBtn.addEventListener("click", generate);
  sampleBtn.addEventListener("click", loadSample);
  clearBtn.addEventListener("click", clearAll);
  copyBtn.addEventListener("click", copySql);

  tableName.addEventListener("keydown", function (e) {
    if (e.key === "Enter") generate();
  });

  setType("select");
  addWhereRow({});
})();
