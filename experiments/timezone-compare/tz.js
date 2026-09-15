(function () {
  var ZONES = [
    { id: "Asia/Seoul", label: "서울 (한국)" },
    { id: "UTC", label: "UTC (협정 세계시)" },
    { id: "America/Los_Angeles", label: "로스앤젤레스 (미 서부)" },
    { id: "America/New_York", label: "뉴욕 (미 동부)" },
    { id: "America/Chicago", label: "시카고 (미 중부)" },
    { id: "Europe/London", label: "런던 (영국)" },
    { id: "Europe/Paris", label: "파리 (프랑스)" },
    { id: "Europe/Berlin", label: "베를린 (독일)" },
    { id: "Asia/Tokyo", label: "도쿄 (일본)" },
    { id: "Asia/Shanghai", label: "상하이 (중국)" },
    { id: "Asia/Singapore", label: "싱가포르" },
    { id: "Asia/Dubai", label: "두바이 (UAE)" },
    { id: "Australia/Sydney", label: "시드니 (호주)" },
    { id: "Pacific/Auckland", label: "오클랜드 (뉴질랜드)" },
  ];

  var zoneById = {};
  ZONES.forEach(function (z) {
    zoneById[z.id] = z;
  });

  var selA = document.getElementById("zone-a");
  var selB = document.getElementById("zone-b");
  var tickTimer = null;

  function fillSelect(select) {
    ZONES.forEach(function (z) {
      var opt = document.createElement("option");
      opt.value = z.id;
      opt.textContent = z.label;
      select.appendChild(opt);
    });
  }

  function offsetMinutes(timeZone, date) {
    var d = date || new Date();
    try {
      var parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timeZone,
        timeZoneName: "longOffset",
      }).formatToParts(d);
      var name = "";
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].type === "timeZoneName") name = parts[i].value;
      }
      var m = name.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
      if (!m) return 0;
      var sign = m[1] === "-" ? -1 : 1;
      var h = parseInt(m[2], 10);
      var min = m[3] ? parseInt(m[3], 10) : 0;
      return sign * (h * 60 + min);
    } catch (e) {
      return 0;
    }
  }

  function formatUtcLabel(minutes) {
    if (minutes === 0) return "UTC+0";
    var sign = minutes > 0 ? "+" : "-";
    var abs = Math.abs(minutes);
    var h = Math.floor(abs / 60);
    var m = abs % 60;
    if (m === 0) return "UTC" + sign + h;
    return "UTC" + sign + h + ":" + String(m).padStart(2, "0");
  }

  function formatClock(timeZone, date) {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: timeZone,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(date);
  }

  function formatDateLine(timeZone, date) {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: timeZone,
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
  }

  function diffPhrase(minA, minB, labelA, labelB) {
    var delta = minB - minA;
    if (delta === 0) {
      return "<strong>" + labelB + "</strong>와(과) <strong>" + labelA + "</strong>는 같은 UTC 오프셋입니다.";
    }
    var abs = Math.abs(delta);
    var h = Math.floor(abs / 60);
    var m = abs % 60;
    var timePart = h ? h + "시간" : "";
    if (m) timePart += (timePart ? " " : "") + m + "분";
    if (delta > 0) {
      return "<strong>" + labelB + "</strong>가 <strong>" + labelA + "</strong>보다 " + timePart + " 빠릅니다.";
    }
    return "<strong>" + labelB + "</strong>가 <strong>" + labelA + "</strong>보다 " + timePart + " 느립니다.";
  }

  function shortLabel(id) {
    var z = zoneById[id];
    if (!z) return id;
    return z.label.split(" ")[0];
  }

  function render() {
    var idA = selA.value;
    var idB = selB.value;
    var now = new Date();
    var offA = offsetMinutes(idA, now);
    var offB = offsetMinutes(idB, now);

    document.getElementById("label-a").textContent = zoneById[idA].label;
    document.getElementById("label-b").textContent = zoneById[idB].label;
    document.getElementById("offset-a").textContent = formatUtcLabel(offA);
    document.getElementById("offset-b").textContent = formatUtcLabel(offB);
    document.getElementById("time-a").textContent = formatClock(idA, now);
    document.getElementById("time-b").textContent = formatClock(idB, now);
    document.getElementById("date-a").textContent = formatDateLine(idA, now);
    document.getElementById("date-b").textContent = formatDateLine(idB, now);
    document.getElementById("diff-text").innerHTML = diffPhrase(offA, offB, shortLabel(idA), shortLabel(idB));
  }

  function setPair(a, b) {
    selA.value = a;
    selB.value = b;
    render();
  }

  function swapZones() {
    var tmp = selA.value;
    selA.value = selB.value;
    selB.value = tmp;
    render();
  }

  fillSelect(selA);
  fillSelect(selB);
  setPair("Asia/Seoul", "UTC");

  selA.addEventListener("change", render);
  selB.addEventListener("change", render);
  document.getElementById("swap").addEventListener("click", swapZones);

  document.getElementById("presets").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-a]");
    if (!btn) return;
    setPair(btn.getAttribute("data-a"), btn.getAttribute("data-b"));
  });

  tickTimer = setInterval(render, 1000);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearInterval(tickTimer);
      tickTimer = null;
    } else if (!tickTimer) {
      render();
      tickTimer = setInterval(render, 1000);
    }
  });
})();
