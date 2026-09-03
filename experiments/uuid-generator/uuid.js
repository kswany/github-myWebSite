(function () {
  "use strict";

  var count = 1;
  var uuids = [];

  var chipRow = document.querySelector(".chip-row");
  var uppercaseToggle = document.getElementById("uppercase");
  var uuidList = document.getElementById("uuid-list");
  var stageKicker = document.getElementById("stage-kicker");
  var generateBtn = document.getElementById("generate-btn");
  var copyBtn = document.getElementById("copy-btn");
  var clearBtn = document.getElementById("clear-btn");
  var statusOk = document.getElementById("status-ok");
  var statusOkText = document.getElementById("status-ok-text");

  function createUuidV4() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    var hex = Array.from(bytes, function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");

    return (
      hex.slice(0, 8) +
      "-" +
      hex.slice(8, 12) +
      "-" +
      hex.slice(12, 16) +
      "-" +
      hex.slice(16, 20) +
      "-" +
      hex.slice(20)
    );
  }

  function formatUuid(value) {
    return uppercaseToggle.checked ? value.toUpperCase() : value;
  }

  function render() {
    uuidList.innerHTML = "";

    if (!uuids.length) {
      var empty = document.createElement("li");
      empty.className = "uuid-empty";
      empty.textContent = "아래 버튼을 누르면 UUID v4가 나옵니다";
      uuidList.appendChild(empty);
      stageKicker.textContent = "아직 없음";
      copyBtn.disabled = true;
      return;
    }

    uuids.forEach(function (id) {
      var li = document.createElement("li");
      li.textContent = formatUuid(id);
      uuidList.appendChild(li);
    });

    stageKicker.textContent = uuids.length + "개 생성됨";
    copyBtn.disabled = false;
  }

  function hideStatus() {
    statusOk.hidden = true;
  }

  function showStatus(message) {
    statusOkText.textContent = message;
    statusOk.hidden = false;
    window.setTimeout(hideStatus, 2200);
  }

  function generate() {
    uuids = [];
    for (var i = 0; i < count; i += 1) {
      uuids.push(createUuidV4());
    }
    render();
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  chipRow.addEventListener("click", function (event) {
    var btn = event.target.closest("[data-count]");
    if (!btn) return;

    chipRow.querySelectorAll(".chip").forEach(function (chip) {
      chip.classList.remove("active");
    });
    btn.classList.add("active");
    count = Number(btn.getAttribute("data-count")) || 1;
  });

  uppercaseToggle.addEventListener("change", render);

  generateBtn.addEventListener("click", function () {
    hideStatus();
    generate();
  });

  copyBtn.addEventListener("click", function () {
    if (!uuids.length) return;
    var text = uuids.map(formatUuid).join("\n");
    copyText(text)
      .then(function () {
        showStatus(uuids.length > 1 ? uuids.length + "개를 복사했습니다." : "복사했습니다.");
      })
      .catch(function () {
        showStatus("복사에 실패했습니다. 직접 선택해 주세요.");
      });
  });

  clearBtn.addEventListener("click", function () {
    hideStatus();
    uuids = [];
    render();
  });

  render();
})();
