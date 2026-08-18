(function () {
  "use strict";

  var NS = "kswany-github-mywebsite";
  var BASE = "https://mantledb.sh/v2/" + NS;
  var KEY = "6382b1889fc88a67dbad3859692daf1f6dcb4bb5f9a4d6dead5cf0393728019c";
  var HEADERS = {
    "Content-Type": "application/json",
    "X-Mantle-Key": KEY,
  };
  var NICK_KEY = "kswany-lab-nick";
  var COUNTED_KEY = "kswany-lab-counted";
  var LAST_POST_KEY = "kswany-lab-guestbook-at";
  var VISIT_CAP = 50;
  var GUEST_CAP = 80;
  var MSG_MAX = 200;
  var guestCache = [];
  var posting = false;
  var FETCH_MS = 10000;
  var ADJ = [
    "고요한",
    "붉은",
    "늦은",
    "작은",
    "먼",
    "푸른",
    "느린",
    "반짝이는",
    "깊은",
    "따뜻한",
    "마른",
    "둥근",
    "옅은",
    "짧은",
    "높은",
  ];
  var NOUN = [
    "고양이",
    "여우",
    "학",
    "돌고래",
    "다람쥐",
    "참새",
    "너구리",
    "고슴도치",
    "고래",
    "제비",
    "달팽이",
    "부엉이",
    "사슴",
    "수달",
    "두루미",
  ];

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function nick() {
    try {
      var saved = sessionStorage.getItem(NICK_KEY);
      if (saved) return saved;
      var made = pick(ADJ) + " " + pick(NOUN);
      sessionStorage.setItem(NICK_KEY, made);
      return made;
    } catch (err) {
      return pick(ADJ) + " " + pick(NOUN);
    }
  }

  function kstDate() {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }

  function kstStamp() {
    return new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  }

  function pageLabel(pathname) {
    if (pathname.indexOf("/saju") !== -1) return "사주";
    if (pathname.indexOf("/games") !== -1) return "게임";
    if (pathname.indexOf("/guestbook") !== -1) return "방명록";
    if (pathname.indexOf("/reaction-test") !== -1) return "반응속도";
    if (pathname.indexOf("/food-worldcup") !== -1) return "음식 월드컵";
    if (pathname.indexOf("/experiments") !== -1) return "실험";
    return "홈";
  }

  function alreadyCounted() {
    try {
      return sessionStorage.getItem(COUNTED_KEY) === "1";
    } catch (err) {
      return false;
    }
  }

  function markCounted() {
    try {
      sessionStorage.setItem(COUNTED_KEY, "1");
    } catch (err) {
      /* ignore */
    }
  }

  function fetchOk(url, options, ms) {
    var ctrl = new AbortController();
    var timer = setTimeout(function () {
      ctrl.abort();
    }, ms || FETCH_MS);
    var opts = Object.assign({}, options || {}, { cache: "no-store", signal: ctrl.signal });
    return fetch(url, opts).finally(function () {
      clearTimeout(timer);
    });
  }

  async function read(path) {
    var res = await fetchOk(BASE + "/" + path, { headers: HEADERS });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("read-failed");
    return res.json();
  }

  async function write(path, body) {
    var res = await fetchOk(
      BASE + "/" + path,
      {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(body),
      },
      12000
    );
    if (!res.ok) throw new Error("write-failed");
  }

  async function ensure(path, fallback) {
    var data = await read(path);
    if (data) return data;
    await write(path, fallback);
    await fetch("https://mantledb.sh/v2/visibility/" + NS + "/" + path, {
      method: "PUT",
      headers: HEADERS,
      body: JSON.stringify({ public_read: true }),
    }).catch(function () {
      /* 읽기는 키가 있으면 동작한다 */
    });
    return fallback;
  }

  async function bump(field) {
    await ensure("stats", { total: 0 });
    var res = await fetch("https://mantledb.sh/v2/increment/" + NS + "/stats", {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ key: field, by: 1 }),
    });
    if (!res.ok) throw new Error("bump-failed");
    return res.json();
  }

  async function append(path, item, cap) {
    var data = await ensure(path, { items: [] });
    var items = Array.isArray(data.items) ? data.items.slice() : [];
    items.unshift(item);
    if (items.length > cap) items = items.slice(0, cap);
    await write(path, { items: items });
    return items;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function renderStats(stats) {
    var today = Number(stats && stats[kstDate()]) || 0;
    var total = Number(stats && stats.total) || 0;
    setText("stat-today", today.toLocaleString("ko-KR"));
    setText("stat-total", total.toLocaleString("ko-KR"));
  }

  function emptyLine(text) {
    var li = document.createElement("li");
    li.className = "lab-empty";
    li.textContent = text;
    return li;
  }

  function renderVisits(items) {
    var list = document.getElementById("visit-list");
    if (!list) return;
    list.replaceChildren();
    if (!items || !items.length) {
      list.appendChild(emptyLine("아직 기록이 없습니다."));
      return;
    }
    items.forEach(function (row) {
      var li = document.createElement("li");
      var time = document.createElement("time");
      time.textContent = row.at || "";
      var page = document.createElement("span");
      page.className = "lab-page";
      page.textContent = row.page || "홈";
      var who = document.createElement("span");
      who.className = "lab-who";
      who.textContent = row.nick || "손님";
      li.append(time, page, who);
      list.appendChild(li);
    });
  }

  function renderGuestbook(items) {
    guestCache = Array.isArray(items) ? items : [];
    var list = document.getElementById("guest-list");
    if (!list) return;
    list.replaceChildren();
    if (!items || !items.length) {
      list.appendChild(emptyLine("첫 글을 남겨 보세요."));
      return;
    }
    items.forEach(function (row) {
      var li = document.createElement("li");
      var meta = document.createElement("div");
      meta.className = "lab-meta";
      var who = document.createElement("strong");
      who.textContent = row.nick || "손님";
      var time = document.createElement("time");
      time.textContent = row.at || "";
      meta.append(who, time);
      var p = document.createElement("p");
      p.textContent = row.text || "";
      li.append(meta, p);
      list.appendChild(li);
    });
  }

  async function ping() {
    var guestName = nick();
    if (alreadyCounted()) {
      var stats = await read("stats");
      renderStats(stats || { total: 0 });
      return;
    }
    await bump("total");
    await bump(kstDate());
    markCounted();
    renderStats((await read("stats")) || { total: 0 });
    var visits = await append(
      "visits",
      {
        at: kstStamp(),
        page: pageLabel(location.pathname),
        nick: guestName,
      },
      VISIT_CAP
    );
    renderVisits(visits);
  }

  async function refreshLists() {
    var visits = await read("visits");
    var guest = await read("guestbook");
    renderVisits(visits && visits.items ? visits.items : []);
    if (!posting) renderGuestbook(guest && guest.items ? guest.items : []);
  }

  function mountGuestbook() {
    setText("guest-nick", nick());
    var form = document.getElementById("guest-form");
    var field = document.getElementById("guest-text");
    var status = document.getElementById("guest-status");
    if (!form || !field) return;

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var text = String(field.value || "").replace(/\s+/g, " ").trim();
      if (!text) {
        if (status) status.textContent = "내용을 적어 주세요.";
        return;
      }
      if (text.length > MSG_MAX) text = text.slice(0, MSG_MAX);
      var now = Date.now();
      try {
        var last = Number(sessionStorage.getItem(LAST_POST_KEY) || 0);
        if (now - last < 8000) {
          if (status) status.textContent = "조금 뒤에 다시 남길 수 있습니다.";
          return;
        }
      } catch (err) {
        /* ignore */
      }

      var btn = form.querySelector("button");
      var row = { at: kstStamp(), nick: nick(), text: text };
      posting = true;
      renderGuestbook([row].concat(guestCache));
      field.value = "";
      if (btn) btn.disabled = true;
      if (status) status.textContent = "남기는 중…";

      append("guestbook", row, GUEST_CAP)
        .then(function (items) {
          try {
            sessionStorage.setItem(LAST_POST_KEY, String(now));
          } catch (err) {
            /* ignore */
          }
          renderGuestbook(items);
          if (status) status.textContent = "남겼습니다.";
        })
        .catch(function () {
          if (status) status.textContent = "저장이 늦습니다. 잠시 후 새로고침 해 보세요.";
        })
        .then(function () {
          posting = false;
          if (btn) btn.disabled = false;
        });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var hasGuestbook = Boolean(document.getElementById("guest-form"));
    var hasLists = Boolean(document.getElementById("guest-list") || document.getElementById("visit-list"));
    if (hasGuestbook) mountGuestbook();
    if (hasLists) {
      renderGuestbook([]);
      renderVisits([]);
      var list = document.getElementById("guest-list");
      if (list && !guestCache.length) {
        list.replaceChildren(emptyLine("불러오는 중…"));
      }
      refreshLists().catch(function () {
        var status = document.getElementById("guest-status");
        if (status && !status.textContent) status.textContent = "기록을 불러오지 못했습니다.";
      });
    }
    ping().catch(function () {
      setText("stat-today", "—");
      setText("stat-total", "—");
    });
  });
})();
