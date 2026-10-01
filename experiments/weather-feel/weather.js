(function () {
  "use strict";

  var CITY_PROFILE = {
    서울: { region: "inland", coast: false, label: "수도권 내륙" },
    인천: { region: "coast", coast: true, label: "서해안" },
    수원: { region: "inland", coast: false, label: "경기 남부" },
    춘천: { region: "north", coast: false, label: "강원 내륙" },
    강릉: { region: "coast", coast: true, label: "동해안" },
    대전: { region: "inland", coast: false, label: "충청 내륙" },
    청주: { region: "inland", coast: false, label: "충북" },
    대구: { region: "inland", coast: false, label: "대구·경북" },
    광주: { region: "inland", coast: false, label: "전라" },
    전주: { region: "inland", coast: false, label: "전북" },
    부산: { region: "coast", coast: true, label: "남동해안" },
    울산: { region: "coast", coast: true, label: "동남해안" },
    창원: { region: "coast", coast: true, label: "경남 남부" },
    제주: { region: "island", coast: true, label: "제주" },
  };

  var SEASON_BASE = {
    winter: { name: "겨울", base: 2, rain: 0.18 },
    spring: { name: "봄", base: 14, rain: 0.22 },
    summer: { name: "여름", base: 27, rain: 0.35 },
    autumn: { name: "가을", base: 16, rain: 0.2 },
  };

  var TIME_SLOTS = [
    { id: "dawn", label: "새벽", hours: [5, 6, 7], delta: -3 },
    { id: "morning", label: "아침", hours: [8, 9, 10], delta: -1 },
    { id: "midday", label: "낮", hours: [11, 12, 13, 14], delta: 2 },
    { id: "afternoon", label: "오후", hours: [15, 16, 17], delta: 1 },
    { id: "evening", label: "저녁", hours: [18, 19, 20], delta: -2 },
    { id: "night", label: "밤", hours: [21, 22, 23, 0, 1, 2, 3, 4], delta: -4 },
  ];

  var input = document.getElementById("city-input");
  var contextStrip = document.getElementById("context-strip");
  var kicker = document.getElementById("result-kicker");
  var main = document.getElementById("result-main");
  var sub = document.getElementById("result-sub");
  var hero = document.getElementById("result-hero");
  var hintList = document.getElementById("hint-list");

  function normalizeCity(raw) {
    return String(raw || "")
      .trim()
      .replace(/\s+/g, "");
  }

  function seasonFromMonth(month) {
    if (month === 12 || month <= 2) return "winter";
    if (month >= 3 && month <= 5) return "spring";
    if (month >= 6 && month <= 8) return "summer";
    return "autumn";
  }

  function timeSlotFromHour(hour) {
    for (var i = 0; i < TIME_SLOTS.length; i++) {
      var slot = TIME_SLOTS[i];
      if (slot.hours.indexOf(hour) !== -1) return slot;
    }
    return TIME_SLOTS[3];
  }

  function regionDelta(profile) {
    if (profile.region === "north") return -2;
    if (profile.region === "island") return 3;
    if (profile.region === "coast") return 0;
    return 0;
  }

  function pseudoRainChance(cityKey, seasonKey, dayOfMonth) {
    var s = SEASON_BASE[seasonKey];
    var seed = 0;
    for (var i = 0; i < cityKey.length; i++) seed += cityKey.charCodeAt(i);
    seed = (seed * 17 + dayOfMonth * 31 + seasonKey.length * 7) % 100;
    var chance = s.rain + (seed / 100) * 0.25;
    if (CITY_PROFILE[cityKey] && CITY_PROFILE[cityKey].coast) chance += 0.08;
    if (seasonKey === "summer" && seed % 3 === 0) chance += 0.12;
    return Math.min(0.72, Math.max(0.08, chance));
  }

  function feelBand(temp) {
    if (temp <= 3) return { id: "cold", label: "매우 쌀쌀", range: "영하~3°C 체감" };
    if (temp <= 10) return { id: "cool", label: "쌀쌀", range: "4~10°C 체감" };
    if (temp <= 20) return { id: "mild", label: "선선·포근", range: "11~20°C 체감" };
    if (temp <= 28) return { id: "warm", label: "따뜻·무덥", range: "21~28°C 체감" };
    return { id: "hot", label: "더움", range: "29°C 이상 체감" };
  }

  function clothingHints(bandId, seasonKey, rainHigh) {
    var items = [];
    if (bandId === "cold") {
      items.push("패딩·두꺼운 코트, 목도리·장갑");
      items.push("안쪽은 기모·히트텍, 발은 두꺼운 양말");
    } else if (bandId === "cool") {
      items.push("코트·두꺼운 자켓, 가벼운 니트");
      items.push("바람 막는 겉옷, 목 주변 한 겹 더");
    } else if (bandId === "mild") {
      items.push("가디건·얇은 자켓, 긴팔 티");
      items.push("아침·저녁엔 겉옷 챙기기");
    } else if (bandId === "warm") {
      items.push("반팔·얇은 셔츠, 통풍 잘 되는 하의");
      items.push("햇볕 강하면 모자·선크림");
    } else {
      items.push("통풍 잘 되는 반팔·민소매, 물 자주");
      items.push("모자·선글라스, 땀 잘 마르는 소재");
    }
    if (seasonKey === "spring" && bandId !== "hot") {
      items.push("황사·미세먼지 대비 마스크(봄철)");
    }
    if (rainHigh) items.push("젖은 길 미끄러움, 신발 밑창 확인");
    return items;
  }

  function umbrellaHint(chance, seasonKey) {
    if (chance >= 0.55) {
      return { level: "high", title: "우산 챙기기 좋음", text: "오늘은 비·소나기 가능성이 꽤 있어 보여요. 접이 우산이나 우비를 가방에 넣어 두세요." };
    }
    if (chance >= 0.35) {
      return { level: "mid", title: "우산은 선택", text: "갑자기 비가 올 수도 있어요. 장시간 밖에 있으면 작은 우산 하나면 마음이 편합니다." };
    }
    if (seasonKey === "summer" && chance >= 0.25) {
      return { level: "mid", title: "소나기만 대비", text: "맑다가도 여름엔 짧은 소나기가 올 수 있어요. 실내에 들어갈 때 우산을 맡길 곳만 생각해 두면 됩니다." };
    }
    return { level: "low", title: "우산 없이 OK", text: "비 가능성은 낮은 편으로 보입니다. 다만 저녁까지 밖에 있으면 얇은 겉옷 정도만 챙기세요." };
  }

  function windHint(profile, seasonKey, slot) {
    if (profile.coast && (slot.id === "morning" || slot.id === "midday")) {
      return "해안·섬 지역은 바람이 체감을 더 차갑거나 시원하게 만듭니다.";
    }
    if (seasonKey === "winter" && profile.region === "inland") {
      return "내륙 겨울엔 바람 없어도 공기가 차갑게 느껴질 수 있어요.";
    }
    if (seasonKey === "spring") return "봄바람이 불면 체감이 한두 단계 내려갈 수 있어요.";
    return "바람이 강한 날은 체감 온도가 실제보다 1~2도 낮게 느껴질 수 있어요.";
  }

  function resolveProfile(cityKey) {
    if (CITY_PROFILE[cityKey]) return { key: cityKey, profile: CITY_PROFILE[cityKey], known: true };
    var guess = { region: "inland", coast: false, label: "입력한 지역(일반)" };
    if (/제주|서귀|우도/.test(cityKey)) guess = { region: "island", coast: true, label: "남쪽 섬" };
    else if (/부산|울산|포항|속초|강릉|여수|목포|인천|해운대/.test(cityKey)) {
      guess = { region: "coast", coast: true, label: "해안 도시" };
    } else if (/춘천|강원|평창|원주/.test(cityKey)) {
      guess = { region: "north", coast: false, label: "북쪽·고지" };
    }
    return { key: cityKey, profile: guess, known: false };
  }

  function iconSvg(name) {
    if (name === "coat") {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l2 4v14H4V7l2-4z"/><path d="M12 3v18"/></svg>';
    }
    if (name === "umbrella") {
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v1"/><path d="M12 3a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z"/><path d="M12 10v10"/></svg>';
    }
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/></svg>';
  }

  function renderHints(clothes, umbrella, windText) {
    hintList.innerHTML = "";
    var blocks = [
      { icon: "coat", title: "옷차림", text: clothes.join(" · ") },
      { icon: "umbrella", title: umbrella.title, text: umbrella.text },
      { icon: "wind", title: "바람·체감", text: windText },
    ];
    blocks.forEach(function (b) {
      var li = document.createElement("li");
      li.innerHTML =
        '<div class="hint-icon" aria-hidden="true">' +
        iconSvg(b.icon) +
        '</div><div class="hint-body"><strong>' +
        b.title +
        "</strong><span>" +
        b.text +
        "</span></div>";
      hintList.appendChild(li);
    });
  }

  function update(cityRaw) {
    var cityKey = normalizeCity(cityRaw);
    if (!cityKey) {
      contextStrip.innerHTML = "";
      kicker.textContent = "도시를 고르거나 입력하세요";
      main.textContent = "—";
      sub.textContent = "위 버튼을 누르거나 도시 이름을 적으면 체감 안내가 나옵니다.";
      hero.removeAttribute("data-tone");
      hintList.innerHTML = "";
      return;
    }

    var now = new Date();
    var month = now.getMonth() + 1;
    var hour = now.getHours();
    var day = now.getDate();
    var seasonKey = seasonFromMonth(month);
    var season = SEASON_BASE[seasonKey];
    var slot = timeSlotFromHour(hour);
    var resolved = resolveProfile(cityKey);
    var profile = resolved.profile;

    var est =
      season.base + slot.delta + regionDelta(profile) + (profile.coast && slot.id === "night" ? -1 : 0);
    est = Math.round(est);

    var band = feelBand(est);
    var rain = pseudoRainChance(resolved.key, seasonKey, day);
    var rainHigh = rain >= 0.45;
    var clothes = clothingHints(band.id, seasonKey, rainHigh);
    var umbrella = umbrellaHint(rain, seasonKey);
    var windText = windHint(profile, seasonKey, slot);

    var dateLabel =
      now.getFullYear() +
      "년 " +
      month +
      "월 " +
      day +
      "일 · " +
      slot.label +
      " " +
      String(hour).padStart(2, "0") +
      "시";

    contextStrip.innerHTML =
      '<span class="context-chip">' +
      dateLabel +
      "</span>" +
      '<span class="context-chip">' +
      season.name +
      "</span>" +
      '<span class="context-chip">' +
      profile.label +
      "</span>" +
      (resolved.known ? "" : '<span class="context-chip">목록에 없는 도시(추정)</span>');

    kicker.textContent = resolved.key + " · 대략 체감";
    main.textContent = band.label + " (" + est + "°C 전후)";
    sub.textContent =
      band.range +
      "으로 보입니다. " +
      (rainHigh ? "비 가능성도 함께 고려해 보세요." : "맑거나 흐린 날씨 위주로 가정한 값입니다.");

    hero.setAttribute("data-tone", band.id);
    renderHints(clothes, umbrella, windText);
  }

  input.addEventListener("input", function () {
    update(input.value);
  });

  document.querySelectorAll(".preset[data-city]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var city = btn.getAttribute("data-city");
      input.value = city;
      update(city);
    });
  });

  update("서울");
  input.value = "서울";
})();
