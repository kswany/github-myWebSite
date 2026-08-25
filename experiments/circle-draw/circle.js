(function () {
  "use strict";

  var STORAGE_KEY = "circle-draw-best";
  var MIN_POINTS = 24;
  var MIN_RADIUS = 40;

  var canvas = document.getElementById("draw-canvas");
  var ctx = canvas.getContext("2d");
  var drawWrap = canvas.parentElement;
  var drawHint = document.getElementById("draw-hint");
  var resultMsg = document.getElementById("result-msg");
  var clearBtn = document.getElementById("clear-btn");
  var statLast = document.getElementById("stat-last");
  var statBest = document.getElementById("stat-best");
  var statTries = document.getElementById("stat-tries");

  var drawing = false;
  var points = [];
  var tries = 0;
  var best = loadBest();

  function loadBest() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    var n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
  }

  function saveBest(value) {
    localStorage.setItem(STORAGE_KEY, String(value));
  }

  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    redraw();
  }

  function getPos(event) {
    var rect = canvas.getBoundingClientRect();
    var clientX = event.clientX;
    var clientY = event.clientY;
    if (event.touches && event.touches.length) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }

  function drawPath(path, color, width) {
    if (path.length < 2) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.moveTo(path[0].x, path[0].y);
    for (var i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();
  }

  function drawGuide(center, radius) {
    ctx.save();
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = "rgba(15, 118, 110, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function redraw() {
    clearCanvas();
    if (points.length > 1) {
      drawPath(points, "#0f766e", 3);
    }
  }

  function mean(values) {
    var sum = 0;
    for (var i = 0; i < values.length; i++) sum += values[i];
    return sum / values.length;
  }

  function scoreCircle(path) {
    if (path.length < MIN_POINTS) {
      return { ok: false, reason: "too-short" };
    }

    var cx = 0;
    var cy = 0;
    for (var i = 0; i < path.length; i++) {
      cx += path[i].x;
      cy += path[i].y;
    }
    cx /= path.length;
    cy /= path.length;

    var distances = [];
    for (var j = 0; j < path.length; j++) {
      var dx = path[j].x - cx;
      var dy = path[j].y - cy;
      distances.push(Math.sqrt(dx * dx + dy * dy));
    }

    var avgRadius = mean(distances);
    if (avgRadius < MIN_RADIUS) {
      return { ok: false, reason: "too-small" };
    }

    var variance = 0;
    for (var k = 0; k < distances.length; k++) {
      var diff = distances[k] - avgRadius;
      variance += diff * diff;
    }
    variance /= distances.length;
    var stdDev = Math.sqrt(variance);

    var first = path[0];
    var last = path[path.length - 1];
    var gap = Math.hypot(first.x - last.x, first.y - last.y);
    var gapRatio = gap / avgRadius;

    var roundness = 1 - stdDev / avgRadius;
    var closure = Math.max(0, 1 - Math.max(0, gapRatio - 0.15) * 2.2);
    var score = Math.round(Math.max(0, Math.min(100, roundness * closure * 100)));

    return {
      ok: true,
      score: score,
      center: { x: cx, y: cy },
      radius: avgRadius,
    };
  }

  function feedback(score) {
    if (score >= 95) return { text: "거의 완벽한 원이에요!", cls: "is-great" };
    if (score >= 85) return { text: "아주 둥글어요. 한 번 더?", cls: "is-great" };
    if (score >= 70) return { text: "꽤 그럴듯한 원이에요.", cls: "is-good" };
    if (score >= 50) return { text: "원에 가까워지고 있어요.", cls: "" };
    if (score >= 30) return { text: "조금 더 고르게 그려 보세요.", cls: "" };
    return { text: "시작점과 끝점을 맞춰 보세요.", cls: "" };
  }

  function showFail(reason) {
    resultMsg.className = "result-msg";
    if (reason === "too-short") {
      resultMsg.textContent = "조금 더 길게 그려 주세요.";
    } else {
      resultMsg.textContent = "원을 더 크게 그려 보세요.";
    }
  }

  function finishDraw() {
    drawing = false;
    drawWrap.classList.remove("is-drawing");

    var result = scoreCircle(points);
    if (!result.ok) {
      showFail(result.reason);
      return;
    }

    tries += 1;
    statTries.textContent = String(tries);
    statLast.textContent = result.score + "%";
    resultMsg.className = "result-msg " + feedback(result.score).cls;
    resultMsg.textContent = feedback(result.score).text;

    if (best === null || result.score > best) {
      best = result.score;
      saveBest(best);
    }
    statBest.textContent = best === null ? "-" : best + "%";

    drawWrap.classList.add("has-result");
    clearCanvas();
    drawPath(points, "#0f766e", 3);
    drawGuide(result.center, result.radius);
  }

  function resetBoard() {
    points = [];
    drawing = false;
    drawWrap.classList.remove("is-drawing", "has-result");
    resultMsg.className = "result-msg";
    resultMsg.textContent = "";
    drawHint.textContent = "누른 채로 원을 그리세요";
    clearCanvas();
  }

  function startDraw(event) {
    event.preventDefault();
    resetBoard();
    drawing = true;
    drawWrap.classList.add("is-drawing");
    points = [getPos(event)];
    redraw();
  }

  function moveDraw(event) {
    if (!drawing) return;
    event.preventDefault();
    var pos = getPos(event);
    var last = points[points.length - 1];
    if (Math.hypot(pos.x - last.x, pos.y - last.y) < 2) return;
    points.push(pos);
    redraw();
  }

  function endDraw(event) {
    if (!drawing) return;
    if (event.type === "mouseup" && event.target !== canvas) return;
    finishDraw();
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", moveDraw);
  window.addEventListener("mouseup", endDraw);

  canvas.addEventListener(
    "touchstart",
    function (e) {
      startDraw(e);
    },
    { passive: false }
  );
  canvas.addEventListener(
    "touchmove",
    function (e) {
      moveDraw(e);
    },
    { passive: false }
  );
  canvas.addEventListener("touchend", endDraw);
  canvas.addEventListener("touchcancel", endDraw);

  clearBtn.addEventListener("click", resetBoard);

  window.addEventListener("resize", resizeCanvas);

  statBest.textContent = best === null ? "-" : best + "%";
  resizeCanvas();
})();
