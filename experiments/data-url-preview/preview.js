(function () {
  var dataIn = document.getElementById("data-in");
  var mimeRow = document.getElementById("mime-row");
  var previewBtn = document.getElementById("preview-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var fileBtn = document.getElementById("file-btn");
  var fileIn = document.getElementById("file-in");
  var clearBtn = document.getElementById("clear-btn");
  var statusEl = document.getElementById("status");
  var previewLayout = document.getElementById("preview-layout");
  var previewImg = document.getElementById("preview-img");
  var metaSize = document.getElementById("meta-size");
  var metaMime = document.getElementById("meta-mime");
  var metaBytes = document.getElementById("meta-bytes");
  var metaRatio = document.getElementById("meta-ratio");

  var SAMPLE =
    "data:image/svg+xml;base64," +
    btoa(
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80" viewBox="0 0 120 80">' +
        '<rect width="120" height="80" rx="12" fill="#059669"/>' +
        '<text x="60" y="46" text-anchor="middle" fill="#fff" font-size="14" font-family="sans-serif">OK</text>' +
        "</svg>"
    );

  function selectedMime() {
    var checked = document.querySelector('input[name="mime"]:checked');
    return checked ? checked.value : "image/png";
  }

  function trimInput(raw) {
    return (raw || "").replace(/\s+/g, "").trim();
  }

  function looksLikeRawBase64(s) {
    if (!s || s.indexOf("data:") === 0) return false;
    return /^[A-Za-z0-9+/=_-]+$/.test(s) && s.length > 32;
  }

  function parseDataUrl(raw) {
    var text = trimInput(raw);
    if (!text) return { error: "문자열이 비어 있습니다." };

    if (text.indexOf("data:") === 0) {
      var comma = text.indexOf(",");
      if (comma === -1) return { error: "data URL 형식이 맞지 않습니다. base64, 뒤에 데이터가 있어야 합니다." };
      var header = text.slice(0, comma);
      var payload = text.slice(comma + 1);
      var mimeMatch = header.match(/^data:([^;]+)/i);
      var mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
      if (!/^image\//i.test(mime)) {
        return { error: "이미지 data URL만 미리볼 수 있습니다. (현재: " + mime + ")" };
      }
      if (!/;base64/i.test(header)) {
        return { error: "지금은 base64 인코딩된 data URL만 지원합니다." };
      }
      return { src: text, mime: mime, payload: payload };
    }

    if (looksLikeRawBase64(text)) {
      var guess = selectedMime();
      return {
        src: "data:" + guess + ";base64," + text,
        mime: guess,
        payload: text,
      };
    }

    return { error: "data URL 또는 Base64 문자열을 붙여 넣어 주세요." };
  }

  function formatBytesFromBase64(b64) {
    var len = b64.length;
    var padding = 0;
    if (b64.endsWith("==")) padding = 2;
    else if (b64.endsWith("=")) padding = 1;
    var bytes = Math.floor((len * 3) / 4) - padding;
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function gcd(a, b) {
    while (b) {
      var t = a % b;
      a = b;
      b = t;
    }
    return a || 1;
  }

  function formatRatio(w, h) {
    var g = gcd(w, h);
    return w / g + " : " + h / g;
  }

  function setStatus(msg, kind) {
    statusEl.textContent = msg;
    statusEl.classList.remove("ok", "err");
    if (kind) statusEl.classList.add(kind);
  }

  function updateMimeRowVisibility() {
    var raw = trimInput(dataIn.value);
    mimeRow.hidden = !looksLikeRawBase64(raw);
  }

  function runPreview() {
    var parsed = parseDataUrl(dataIn.value);
    if (parsed.error) {
      previewLayout.hidden = true;
      setStatus(parsed.error, "err");
      return;
    }

    setStatus("이미지를 불러오는 중…", null);
    previewImg.onload = function () {
      var w = previewImg.naturalWidth;
      var h = previewImg.naturalHeight;
      metaSize.textContent = w + " × " + h + " px";
      metaMime.textContent = parsed.mime;
      metaBytes.textContent = formatBytesFromBase64(parsed.payload);
      metaRatio.textContent = formatRatio(w, h);
      previewLayout.hidden = false;
      setStatus("미리보기를 표시했습니다.", "ok");
    };
    previewImg.onerror = function () {
      previewLayout.hidden = true;
      setStatus("이미지를 읽지 못했습니다. Base64가 깨졌거나 형식 추정이 틀렸을 수 있습니다.", "err");
    };
    previewImg.src = parsed.src;
  }

  previewBtn.addEventListener("click", runPreview);

  sampleBtn.addEventListener("click", function () {
    dataIn.value = SAMPLE;
    updateMimeRowVisibility();
    runPreview();
  });

  fileBtn.addEventListener("click", function () {
    fileIn.click();
  });

  fileIn.addEventListener("change", function () {
    var file = fileIn.files && fileIn.files[0];
    if (!file) return;
    if (!file.type || file.type.indexOf("image/") !== 0) {
      setStatus("이미지 파일만 선택할 수 있습니다.", "err");
      fileIn.value = "";
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      dataIn.value = reader.result;
      updateMimeRowVisibility();
      runPreview();
    };
    reader.onerror = function () {
      setStatus("파일을 읽지 못했습니다.", "err");
    };
    reader.readAsDataURL(file);
    fileIn.value = "";
  });

  clearBtn.addEventListener("click", function () {
    dataIn.value = "";
    previewImg.removeAttribute("src");
    previewLayout.hidden = true;
    mimeRow.hidden = true;
    setStatus("비웠습니다. 다시 붙여 넣어 주세요.", null);
  });

  dataIn.addEventListener("input", updateMimeRowVisibility);

  document.querySelectorAll('input[name="mime"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      if (looksLikeRawBase64(trimInput(dataIn.value)) && !previewLayout.hidden) {
        runPreview();
      }
    });
  });
})();
