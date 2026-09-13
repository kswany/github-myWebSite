(function () {
  "use strict";

  var ALGO_DESC = {
    "SHA-256": "SHA-256은 64자리 16진수. 파일·비밀번호 확인에 많이 씁니다.",
    "SHA-384": "SHA-384는 96자리 16진수. 더 긴 지문이 필요할 때 씁니다.",
    "SHA-512": "SHA-512는 128자리 16진수. 가장 긴 SHA 계열입니다.",
  };

  var inputEl = document.getElementById("hash-input");
  var resultEl = document.getElementById("hash-result");
  var metaEl = document.getElementById("input-meta");
  var modeDescEl = document.getElementById("mode-desc");
  var copyBtn = document.getElementById("copy-btn");
  var statusOk = document.getElementById("status-ok");
  var sampleBtn = document.getElementById("sample-btn");
  var clearBtn = document.getElementById("clear-btn");

  var algo = "SHA-256";
  var letterCase = "lower";
  var lastHash = "";
  var timer = null;

  function utf8Bytes(text) {
    return new TextEncoder().encode(text);
  }

  function bufferToHex(buffer) {
    var bytes = new Uint8Array(buffer);
    var hex = "";
    for (var i = 0; i < bytes.length; i++) {
      var h = bytes[i].toString(16);
      hex += h.length === 1 ? "0" + h : h;
    }
    return letterCase === "upper" ? hex.toUpperCase() : hex;
  }

  function updateMeta() {
    var text = inputEl.value;
    var len = utf8Bytes(text).length;
    metaEl.textContent = len + "바이트 (UTF-8)";
  }

  function setEmptyResult() {
    lastHash = "";
    resultEl.textContent = "입력하면 여기에 해시가 나옵니다";
    resultEl.classList.add("empty");
    copyBtn.disabled = true;
  }

  function runHash() {
    var text = inputEl.value;
    updateMeta();
    if (!text) {
      setEmptyResult();
      return;
    }

    if (!window.crypto || !window.crypto.subtle) {
      resultEl.textContent = "이 브라우저에서는 해시를 만들 수 없습니다.";
      resultEl.classList.remove("empty");
      copyBtn.disabled = true;
      return;
    }

    resultEl.textContent = "계산 중…";
    resultEl.classList.remove("empty");
    copyBtn.disabled = true;

    crypto.subtle
      .digest(algo, utf8Bytes(text))
      .then(function (buf) {
        lastHash = bufferToHex(buf);
        resultEl.textContent = lastHash;
        copyBtn.disabled = false;
      })
      .catch(function () {
        resultEl.textContent = "해시를 만들지 못했습니다. 입력을 확인해 주세요.";
        lastHash = "";
        copyBtn.disabled = true;
      });
  }

  function scheduleHash() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(runHash, 120);
  }

  function setAlgo(next) {
    algo = next;
    document.querySelectorAll(".mode-tab").forEach(function (btn) {
      var on = btn.getAttribute("data-algo") === algo;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
    modeDescEl.textContent = ALGO_DESC[algo] || "";
    runHash();
  }

  function setCase(next) {
    letterCase = next;
    document.querySelectorAll(".chip[data-case]").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-case") === letterCase);
    });
    if (lastHash) {
      lastHash = letterCase === "upper" ? lastHash.toUpperCase() : lastHash.toLowerCase();
      resultEl.textContent = lastHash;
    } else {
      runHash();
    }
  }

  function flashOk() {
    statusOk.hidden = false;
    clearTimeout(flashOk._t);
    flashOk._t = setTimeout(function () {
      statusOk.hidden = true;
    }, 2200);
  }

  function copyHash() {
    if (!lastHash) return;
    var done = function () {
      flashOk();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastHash).then(done).catch(function () {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }

    function fallbackCopy() {
      var ta = document.createElement("textarea");
      ta.value = lastHash;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        /* ignore */
      }
      document.body.removeChild(ta);
    }
  }

  document.querySelectorAll(".mode-tab").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setAlgo(btn.getAttribute("data-algo"));
    });
  });

  document.querySelectorAll(".chip[data-case]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setCase(btn.getAttribute("data-case"));
    });
  });

  inputEl.addEventListener("input", scheduleHash);
  copyBtn.addEventListener("click", copyHash);

  sampleBtn.addEventListener("click", function () {
    inputEl.value = "안녕, kswany 실험실!";
    scheduleHash();
    inputEl.focus();
  });

  clearBtn.addEventListener("click", function () {
    inputEl.value = "";
    setEmptyResult();
    updateMeta();
    statusOk.hidden = true;
    inputEl.focus();
  });

  updateMeta();
})();
