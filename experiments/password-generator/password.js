(function () {
  "use strict";

  var LOWER = "abcdefghijklmnopqrstuvwxyz";
  var UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var NUMBER = "0123456789";
  var SYMBOL = "!@#$%^&*()-_=+[]{}";

  var length = 12;
  var password = "";
  var masked = false;

  var chipRow = document.querySelector(".chip-row");
  var lengthRange = document.getElementById("length-range");
  var lengthOutput = document.getElementById("length-output");
  var useLower = document.getElementById("use-lower");
  var useUpper = document.getElementById("use-upper");
  var useNumber = document.getElementById("use-number");
  var useSymbol = document.getElementById("use-symbol");
  var stageKicker = document.getElementById("stage-kicker");
  var passwordValue = document.getElementById("password-value");
  var strength = document.getElementById("strength");
  var strengthFill = document.getElementById("strength-fill");
  var strengthLabel = document.getElementById("strength-label");
  var toggleBtn = document.getElementById("toggle-btn");
  var iconShow = toggleBtn.querySelector(".icon-show");
  var iconHide = toggleBtn.querySelector(".icon-hide");
  var generateBtn = document.getElementById("generate-btn");
  var copyBtn = document.getElementById("copy-btn");
  var statusOk = document.getElementById("status-ok");
  var statusOkText = document.getElementById("status-ok-text");

  function getPool() {
    var pool = "";
    if (useLower.checked) pool += LOWER;
    if (useUpper.checked) pool += UPPER;
    if (useNumber.checked) pool += NUMBER;
    if (useSymbol.checked) pool += SYMBOL;
    return pool;
  }

  function randomIndex(max) {
    var array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
  }

  function pickChar(from) {
    return from.charAt(randomIndex(from.length));
  }

  function shuffle(list) {
    var arr = list.slice();
    for (var i = arr.length - 1; i > 0; i -= 1) {
      var j = randomIndex(i + 1);
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  function buildRequiredSets() {
    var sets = [];
    if (useLower.checked) sets.push(LOWER);
    if (useUpper.checked) sets.push(UPPER);
    if (useNumber.checked) sets.push(NUMBER);
    if (useSymbol.checked) sets.push(SYMBOL);
    return sets;
  }

  function generatePassword() {
    var pool = getPool();
    if (!pool) {
      return "";
    }

    var required = buildRequiredSets();
    if (length < required.length) {
      return "";
    }

    var chars = required.map(pickChar);
    while (chars.length < length) {
      chars.push(pickChar(pool));
    }

    return shuffle(chars).join("");
  }

  function scorePassword(value) {
    if (!value) return { level: 0, label: "선택 필요" };

    var score = 0;
    if (value.length >= 12) score += 1;
    if (value.length >= 16) score += 1;
    if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
    if (/\d/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 1) return { level: 1, label: "약함 — 길이를 늘리거나 기호를 켜 보세요" };
    if (score === 2) return { level: 2, label: "보통 — 조금 더 길게 만들면 좋아요" };
    if (score === 3 || score === 4) return { level: 3, label: "좋음 — 일반 계정에 쓰기 무난합니다" };
    return { level: 4, label: "강함 — 추측하기 어렵습니다" };
  }

  function syncLengthUI() {
    lengthRange.value = String(length);
    lengthOutput.textContent = length + "자";
    chipRow.querySelectorAll(".chip").forEach(function (chip) {
      var chipLength = Number(chip.getAttribute("data-length"));
      chip.classList.toggle("active", chipLength === length);
    });
  }

  function renderPassword() {
    if (!password) {
      passwordValue.textContent = "버튼을 누르면 비밀번호가 나옵니다";
      passwordValue.classList.remove("is-masked");
      stageKicker.textContent = "아직 없음";
      strength.hidden = true;
      copyBtn.disabled = true;
      toggleBtn.disabled = true;
      return;
    }

    passwordValue.textContent = masked ? "•".repeat(password.length) : password;
    passwordValue.classList.toggle("is-masked", masked);
    stageKicker.textContent = length + "자 · " + getPool().length + "종 문자";
    copyBtn.disabled = false;
    toggleBtn.disabled = false;

    var result = scorePassword(password);
    strength.hidden = false;
    strengthFill.className = "strength-fill level-" + result.level;
    strengthLabel.textContent = "강도: " + result.label;
  }

  function hideStatus() {
    statusOk.hidden = true;
  }

  function showStatus(message) {
    statusOkText.textContent = message;
    statusOk.hidden = false;
    window.setTimeout(hideStatus, 2200);
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
    var btn = event.target.closest("[data-length]");
    if (!btn) return;
    length = Number(btn.getAttribute("data-length")) || 12;
    syncLengthUI();
    if (password) {
      password = generatePassword();
      renderPassword();
    }
  });

  lengthRange.addEventListener("input", function () {
    length = Number(lengthRange.value) || 12;
    syncLengthUI();
    if (password) {
      password = generatePassword();
      renderPassword();
    }
  });

  [useLower, useUpper, useNumber, useSymbol].forEach(function (input) {
    input.addEventListener("change", function () {
      if (!getPool()) {
        input.checked = true;
        showStatus("최소 한 종류는 켜 두어야 합니다.");
        return;
      }
      if (password) {
        password = generatePassword();
        renderPassword();
      }
    });
  });

  generateBtn.addEventListener("click", function () {
    hideStatus();
    if (!getPool()) {
      showStatus("문자 종류를 하나 이상 선택해 주세요.");
      return;
    }
    if (length < buildRequiredSets().length) {
      showStatus("길이가 선택한 문자 종류보다 짧습니다.");
      return;
    }
    password = generatePassword();
    masked = false;
    iconShow.hidden = false;
    iconHide.hidden = true;
    toggleBtn.setAttribute("aria-label", "비밀번호 숨기기");
    renderPassword();
  });

  toggleBtn.addEventListener("click", function () {
    if (!password) return;
    masked = !masked;
    iconShow.hidden = masked;
    iconHide.hidden = !masked;
    toggleBtn.setAttribute("aria-label", masked ? "비밀번호 보기" : "비밀번호 숨기기");
    renderPassword();
  });

  copyBtn.addEventListener("click", function () {
    if (!password) return;
    copyText(password)
      .then(function () {
        showStatus("복사했습니다.");
      })
      .catch(function () {
        showStatus("복사에 실패했습니다. 직접 선택해 주세요.");
      });
  });

  syncLengthUI();
  renderPassword();
})();
