(function () {
  var input = document.getElementById("encode-input");
  var output = document.getElementById("encode-output");
  var modeDesc = document.getElementById("mode-desc");
  var encodeBtn = document.getElementById("encode-btn");
  var decodeBtn = document.getElementById("decode-btn");
  var swapBtn = document.getElementById("swap-btn");
  var copyBtn = document.getElementById("copy-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var clearBtn = document.getElementById("clear-btn");
  var statusOk = document.getElementById("status-ok");
  var statusOkText = document.getElementById("status-ok-text");
  var statusErr = document.getElementById("status-err");
  var statusErrText = document.getElementById("status-err-text");
  var statHint = document.getElementById("stat-hint");
  var modeTabs = document.querySelectorAll(".mode-tab");

  var mode = "base64";

  var SAMPLES = {
    base64: "안녕하세요! kswany 웹 실험실",
    url: "검색어=한글&page=2&tag=웹 실험",
  };

  var MODE_DESC = {
    base64: "Base64는 바이너리·텍스트를 안전한 문자열로 바꿀 때 씁니다.",
    url: "URL 인코딩은 주소에 넣을 수 없는 글자를 % 형태로 바꿉니다.",
  };

  function hideStatus() {
    statusOk.hidden = true;
    statusErr.hidden = true;
  }

  function showOk(message) {
    hideStatus();
    statusOkText.textContent = message;
    statusOk.hidden = false;
  }

  function showErr(message) {
    hideStatus();
    statusErrText.textContent = message;
    statusErr.hidden = false;
  }

  function byteLength(text) {
    return new TextEncoder().encode(text).length;
  }

  function summarize(text) {
    var chars = [...text].length;
    var bytes = byteLength(text);
    return (
      chars.toLocaleString("ko-KR") +
      "글자 · " +
      bytes.toLocaleString("ko-KR") +
      "바이트"
    );
  }

  function base64Encode(text) {
    var bytes = new TextEncoder().encode(text);
    var binary = "";
    for (var i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function base64Decode(text) {
    var cleaned = text.replace(/\s/g, "");
    var binary = atob(cleaned);
    var bytes = new Uint8Array(binary.length);
    for (var i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  }

  function urlEncode(text) {
    return encodeURIComponent(text);
  }

  function urlDecode(text) {
    return decodeURIComponent(text);
  }

  function runTransform(direction) {
    var text = input.value;
    hideStatus();
    output.value = "";

    if (!text) {
      showErr("글을 입력하거나 붙여 넣어 주세요.");
      statHint.textContent = "입력값은 서버로 보내지 않습니다.";
      return;
    }

    try {
      var result;
      if (mode === "base64") {
        result = direction === "encode" ? base64Encode(text) : base64Decode(text);
      } else {
        result = direction === "encode" ? urlEncode(text) : urlDecode(text);
      }

      output.value = result;
      var label = mode === "base64" ? "Base64" : "URL";
      var action = direction === "encode" ? "인코딩" : "디코딩";
      showOk(label + " " + action + "을 완료했습니다.");
      statHint.textContent = summarize(result);
    } catch (err) {
      var hint =
        mode === "base64"
          ? "Base64 형식이 맞는지 확인해 주세요. 공백은 자동으로 빼고 시도합니다."
          : "URL 형식이 맞는지 확인해 주세요. % 뒤에는 두 자리 16진수가 와야 합니다.";
      showErr((err && err.message ? err.message : "변환에 실패했습니다.") + " " + hint);
      statHint.textContent = "오류 내용을 확인한 뒤 다시 시도해 보세요.";
    }
  }

  function swapValues() {
    var nextInput = output.value;
    if (!nextInput && !input.value) return;
    input.value = nextInput;
    output.value = "";
    hideStatus();
    statHint.textContent = "입력과 결과를 바꿨습니다. 다시 변환해 보세요.";
    input.focus();
  }

  function copyResult() {
    var text = output.value;
    if (!text) {
      showErr("먼저 인코딩 또는 디코딩을 눌러 결과를 만드세요.");
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          showOk("결과를 복사했습니다.");
        },
        function () {
          fallbackCopy(text);
        }
      );
      return;
    }

    fallbackCopy(text);
  }

  function fallbackCopy(text) {
    output.removeAttribute("readonly");
    output.select();
    try {
      document.execCommand("copy");
      showOk("결과를 복사했습니다.");
    } catch (err) {
      showErr("복사에 실패했습니다. 결과 칸에서 직접 선택해 복사해 주세요.");
    }
    output.setAttribute("readonly", "readonly");
    window.getSelection().removeAllRanges();
  }

  function setMode(nextMode) {
    mode = nextMode;
    modeTabs.forEach(function (tab) {
      var active = tab.getAttribute("data-mode") === mode;
      tab.classList.toggle("active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    modeDesc.textContent = MODE_DESC[mode];
    input.placeholder =
      mode === "base64"
        ? "예: 안녕하세요 또는 SGVsbG8="
        : "예: 검색어=한글&page=2";
    output.value = "";
    hideStatus();
    statHint.textContent = MODE_DESC[mode] + " 붙여 넣은 뒤 버튼을 누르세요.";
  }

  modeTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      setMode(tab.getAttribute("data-mode"));
    });
  });

  encodeBtn.addEventListener("click", function () {
    runTransform("encode");
  });

  decodeBtn.addEventListener("click", function () {
    runTransform("decode");
  });

  swapBtn.addEventListener("click", swapValues);

  copyBtn.addEventListener("click", copyResult);

  sampleBtn.addEventListener("click", function () {
    input.value = SAMPLES[mode];
    output.value = "";
    hideStatus();
    statHint.textContent = "예시 글이 들어갔습니다. 인코딩을 눌러 보세요.";
    input.focus();
  });

  clearBtn.addEventListener("click", function () {
    input.value = "";
    output.value = "";
    hideStatus();
    statHint.textContent = "입력값은 서버로 보내지 않습니다. 붙여 넣은 뒤 변환해 보세요.";
    input.focus();
  });

  input.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      runTransform("encode");
    }
  });
})();
