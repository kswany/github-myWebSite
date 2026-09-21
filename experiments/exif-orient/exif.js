(function () {
  "use strict";

  var ORIENT_LABELS = {
    0: "값 없음 (기본 1로 봄)",
    1: "1 — 정상 (회전 없음)",
    2: "2 — 좌우 뒤집기",
    3: "3 — 180° 회전",
    4: "4 — 위아래 뒤집기",
    5: "5 — 90° 시계 + 좌우 뒤집기",
    6: "6 — 90° 시계 방향",
    7: "7 — 90° 반시계 + 좌우 뒤집기",
    8: "8 — 90° 반시계 방향",
  };

  var dropZone = document.getElementById("drop-zone");
  var fileIn = document.getElementById("file-in");
  var statusEl = document.getElementById("status");
  var resultBlock = document.getElementById("result-block");
  var metaName = document.getElementById("meta-name");
  var metaOrient = document.getElementById("meta-orient");
  var metaPixels = document.getElementById("meta-pixels");
  var metaVerdict = document.getElementById("meta-verdict");
  var explainEl = document.getElementById("explain");
  var imgBrowser = document.getElementById("img-browser");
  var canvasFixed = document.getElementById("canvas-fixed");
  var clearBtn = document.getElementById("clear-btn");

  var objectUrl = null;

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = "status" + (kind ? " " + kind : "");
  }

  function revokeUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  function readOrientation(buffer) {
    var view = new DataView(buffer);
    if (view.byteLength < 4 || view.getUint16(0, false) !== 0xffd8) {
      return null;
    }

    var offset = 2;
    while (offset + 4 < view.byteLength) {
      if (view.getUint8(offset) !== 0xff) break;
      var marker = view.getUint8(offset + 1);
      if (marker === 0xe1) {
        var exifLen = view.getUint16(offset + 2, false);
        var tiffStart = offset + 4;
        if (tiffStart + 8 > view.byteLength) break;
        var sig =
          String.fromCharCode(view.getUint8(tiffStart)) +
          String.fromCharCode(view.getUint8(tiffStart + 1)) +
          String.fromCharCode(view.getUint8(tiffStart + 2)) +
          String.fromCharCode(view.getUint8(tiffStart + 3));
        if (sig !== "Exif") return null;
        var little = view.getUint16(tiffStart + 6, false) === 0x4949;
        var ifd0 = tiffStart + 6 + view.getUint32(tiffStart + 10, little);
        if (ifd0 + 2 > view.byteLength) return null;
        var entries = view.getUint16(ifd0, little);
        for (var i = 0; i < entries; i++) {
          var entry = ifd0 + 2 + i * 12;
          if (entry + 12 > view.byteLength) break;
          if (view.getUint16(entry, little) === 0x0112) {
            return view.getUint16(entry + 8, little);
          }
        }
        return 1;
      }
      if (marker === 0xda || marker === 0xd9) break;
      var segLen = view.getUint16(offset + 2, false);
      if (segLen < 2) break;
      offset += 2 + segLen;
    }
    return null;
  }

  function drawWithOrientation(img, orientation) {
    var w = img.naturalWidth;
    var h = img.naturalHeight;
    var ctx = canvasFixed.getContext("2d");
    var swap = orientation >= 5 && orientation <= 8;
    canvasFixed.width = swap ? h : w;
    canvasFixed.height = swap ? w : h;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvasFixed.width, canvasFixed.height);

    switch (orientation) {
      case 2:
        ctx.translate(w, 0);
        ctx.scale(-1, 1);
        break;
      case 3:
        ctx.translate(w, h);
        ctx.rotate(Math.PI);
        break;
      case 4:
        ctx.translate(0, h);
        ctx.scale(1, -1);
        break;
      case 5:
        ctx.rotate(0.5 * Math.PI);
        ctx.scale(1, -1);
        break;
      case 6:
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(0, -h);
        break;
      case 7:
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(w, -h);
        ctx.scale(-1, 1);
        break;
      case 8:
        ctx.rotate(-0.5 * Math.PI);
        ctx.translate(-w, 0);
        break;
      default:
        break;
    }
    ctx.drawImage(img, 0, 0, w, h);
  }

  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      setStatus("이미지 파일만 올릴 수 있습니다.", "err");
      return;
    }

    revokeUrl();
    setStatus("읽는 중…", "");

    readArrayBufferFromFile(file, function (buffer) {
      var orientRaw = readOrientation(buffer);
      var orient = orientRaw === null ? 0 : orientRaw;
      if (orientRaw === null && file.type === "image/jpeg") {
        orient = 1;
      }

      objectUrl = URL.createObjectURL(file);
      imgBrowser.onload = function () {
        var nw = imgBrowser.naturalWidth;
        var nh = imgBrowser.naturalHeight;
        var effective = orient === 0 ? 1 : orient;
        var needsFix = effective !== 1;

        metaName.textContent = file.name;
        metaOrient.textContent = ORIENT_LABELS[effective] || String(effective);
        metaPixels.textContent = nw + " × " + nh + " px";

        if (orientRaw === null && file.type !== "image/jpeg") {
          metaVerdict.textContent = "EXIF 없음";
          metaVerdict.style.color = "#64748b";
          explainEl.textContent =
            "이 형식에는 EXIF 방향 태그가 없거나 읽지 못했습니다. 브라우저 미리보기만 참고하세요.";
          setStatus("미리보기를 표시했습니다.", "ok");
        } else if (needsFix) {
          metaVerdict.textContent = "회전 정보 있음";
          metaVerdict.style.color = "#d97706";
          explainEl.textContent =
            "EXIF에 회전·뒤집기 정보가 들어 있습니다. 일부 앱은 이 값을 무시해 사진이 눕혀 보일 수 있습니다. 오른쪽은 EXIF를 적용해 바로 세운 모습입니다.";
          setStatus("방향 태그가 1이 아닙니다. 두 미리보기를 비교해 보세요.", "warn");
        } else {
          metaVerdict.textContent = "정상 (1)";
          metaVerdict.style.color = "#059669";
          explainEl.textContent =
            "방향 값이 1(정상)입니다. 파일 자체는 눕혀 저장되지 않은 경우가 많습니다. 그래도 화면에서 이상하면 업로드하는 앱 설정을 확인해 보세요.";
          setStatus("방향 값은 정상입니다.", "ok");
        }

        drawWithOrientation(imgBrowser, effective);
        resultBlock.hidden = false;
      };
      imgBrowser.onerror = function () {
        setStatus("이미지를 불러오지 못했습니다.", "err");
      };
      imgBrowser.src = objectUrl;
    });
  }

  function readArrayBufferFromFile(file, cb) {
    var fr = new FileReader();
    fr.onload = function (e) {
      cb(e.target.result);
    };
    fr.onerror = function () {
      setStatus("파일을 읽지 못했습니다.", "err");
    };
    fr.readAsArrayBuffer(file);
  }

  dropZone.addEventListener("click", function () {
    fileIn.click();
  });
  dropZone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileIn.click();
    }
  });

  fileIn.addEventListener("change", function () {
    if (fileIn.files && fileIn.files[0]) handleFile(fileIn.files[0]);
  });

  ["dragenter", "dragover"].forEach(function (ev) {
    dropZone.addEventListener(ev, function (e) {
      e.preventDefault();
      dropZone.classList.add("is-drag");
    });
  });
  ["dragleave", "drop"].forEach(function (ev) {
    dropZone.addEventListener(ev, function (e) {
      e.preventDefault();
      dropZone.classList.remove("is-drag");
    });
  });
  dropZone.addEventListener("drop", function (e) {
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) handleFile(f);
  });

  clearBtn.addEventListener("click", function () {
    revokeUrl();
    imgBrowser.removeAttribute("src");
    resultBlock.hidden = true;
    fileIn.value = "";
    setStatus("파일을 올리면 방향 정보를 읽습니다.", "");
  });
})();
