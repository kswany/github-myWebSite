(() => {
  const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  const STEM_HANJA = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const BRANCH_HANJA = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const STEM_EL = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"];
  const BRANCH_EL = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"];
  const ELEMENTS = ["목", "화", "토", "금", "수"];
  const MONTH_BRANCHES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];
  const MONTH_STEM_START = [2, 4, 6, 8, 0];
  const HOUR_STEM_START = [0, 2, 4, 6, 8];
  const TEN_GODS = ["비견", "겁재", "식신", "상관", "편재", "정재", "편관", "정관", "편인", "정인"];
  const TERM_LON = [315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255, 285];
  const TERM_NAMES = ["입춘", "경칩", "청명", "입하", "망종", "소서", "입추", "백로", "한로", "입동", "대설", "소한"];

  const DAY_MASTER = {
    갑: { title: "큰 나무", text: "곧게 자라려는 힘이 큽니다. 시작과 주관을 좋아하고, 방향이 정해지면 밀어붙입니다. 주변의 물(자원)과 흙(현실 감각)이 있으면 더 오래 갑니다." },
    을: { title: "꽃과 덩굴", text: "유연하게 기대고 피어나는 힘입니다. 사람·환경에 잘 적응하고 아름다움과 조화를 중시합니다. 지나친 의존만 조심하면 됩니다." },
    병: { title: "태양", text: "드러내고 비추는 힘입니다. 표현·열정·리더십이 잘 보이며, 자리를 밝히면 주변도 함께 움직입니다. 휴식과 그늘도 필요합니다." },
    정: { title: "촛불·별빛", text: "가깝고 따뜻한 불입니다. 섬세한 감정과 취향, 한 사람을 오래 비추는 집중이 있습니다. 너무 사그라들지 않게 연료(목)를 챙기면 좋습니다." },
    무: { title: "산·언덕", text: "묵직하게 버티는 힘입니다. 신뢰와 책임, 한곳에 뿌리를 내리는 성향이 있습니다. 움직임이 필요할 때는 길을 내는 금속의 결단이 도움이 됩니다." },
    기: { title: "밭의 흙", text: "기르고 포용하는 힘입니다. 현실 감각과 보살핌이 있고, 사람과 일을 품어 키웁니다. 자기 경계를 조금 분명히 하면 더 편합니다." },
    경: { title: "바위·큰 쇠", text: "자르고 세우는 힘입니다. 원칙, 결단, 정리가 빠르고 불의를 잘 견디지 못합니다. 날카로움 뒤에 온기를 두면 관계가 오래 갑니다." },
    신: { title: "보석·바늘", text: "예리하고 정교한 힘입니다. 감각·기술·디테일에 강하고, 본질을 꿰뚫습니다. 스스로를 너무 깎지 않는 것이 과제입니다." },
    임: { title: "큰 강", text: "흘러 삼키는 힘입니다. 지혜, 포용, 이동과 기획에 능합니다. 방향만 잡히면 멀리 갑니다. 고이면 탁해지니 출구가 필요합니다." },
    계: { title: "이슬·빗물", text: "스며드는 힘입니다. 직관, 섬세함, 눈에 잘 안 보이는 배려가 있습니다. 작아 보여도 스며들면 바위도 바꿉니다." },
  };

  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  function pillarFromIndex(i) {
    const idx = mod(i, 60);
    return {
      index: idx,
      stem: idx % 10,
      branch: idx % 12,
      stemKo: STEMS[idx % 10],
      branchKo: BRANCHES[idx % 12],
      stemHanja: STEM_HANJA[idx % 10],
      branchHanja: BRANCH_HANJA[idx % 12],
      name: STEMS[idx % 10] + BRANCHES[idx % 12],
      hanja: STEM_HANJA[idx % 10] + BRANCH_HANJA[idx % 12],
    };
  }

  function jdn(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a;
    const mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }

  function gregorianToJD(y, m, d, utcHour) {
    return jdn(y, m, d) - 0.5 + utcHour / 24;
  }

  function kstToUtcParts(y, m, d, hour, minute) {
    const utcMs = Date.UTC(y, m - 1, d, hour, minute) - 9 * 3600 * 1000;
    const dt = new Date(utcMs);
    return {
      y: dt.getUTCFullYear(),
      m: dt.getUTCMonth() + 1,
      d: dt.getUTCDate(),
      hour: dt.getUTCHours() + dt.getUTCMinutes() / 60 + dt.getUTCSeconds() / 3600,
      jd: utcMs / 86400000 + 2440587.5,
    };
  }

  function sunLongitude(jd) {
    const t = (jd - 2451545.0) / 36525;
    const deg2rad = Math.PI / 180;
    let l0 = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    const m = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    const mr = ((m % 360) + 360) % 360;
    const c =
      (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(mr * deg2rad) +
      (0.019993 - 0.000101 * t) * Math.sin(2 * mr * deg2rad) +
      0.000289 * Math.sin(3 * mr * deg2rad);
    l0 = ((l0 + c) % 360 + 360) % 360;
    const omega = 125.04 - 1934.136 * t;
    const lambda = l0 - 0.00569 - 0.00478 * Math.sin(omega * deg2rad);
    return ((lambda % 360) + 360) % 360;
  }

  function lonDiff(a, b) {
    return ((a - b + 540) % 360) - 180;
  }

  function jdWhenLongitude(targetLon, aroundJd) {
    let lo = aroundJd - 20;
    let hi = aroundJd + 20;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (lonDiff(sunLongitude(mid), targetLon) < 0) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  function lichunJd(year) {
    return jdWhenLongitude(315, gregorianToJD(year, 2, 4, 3));
  }

  function monthTermIndex(jd) {
    const lon = sunLongitude(jd);
    let best = 0;
    let bestDiff = 999;
    for (let i = 0; i < 12; i++) {
      const d = (lon - TERM_LON[i] + 360) % 360;
      if (d < bestDiff) {
        bestDiff = d;
        best = i;
      }
    }
    return best;
  }

  function hourBranch(hour, minute) {
    const t = hour + minute / 60;
    if (t >= 23 || t < 1) return 0;
    return Math.floor((t + 1) / 2) % 12;
  }

  function tenGod(dayStem, targetStem) {
    const dayEl = Math.floor(dayStem / 2);
    const targetEl = Math.floor(targetStem / 2);
    const samePolarity = dayStem % 2 === targetStem % 2;
    const rel = mod(targetEl - dayEl, 5);
    const map = [0, 2, 4, 6, 8];
    const base = map[rel];
    return TEN_GODS[base + (samePolarity ? 0 : 1)];
  }

  function branchTenGod(dayStem, branch) {
    const hidden = {
      0: [9],
      1: [5, 9, 7],
      2: [0, 2, 4],
      3: [1],
      4: [1, 9, 4],
      5: [4, 6, 2],
      6: [2, 5, 3],
      7: [3, 1, 5],
      8: [6, 8, 4],
      9: [7],
      10: [7, 3, 4],
      11: [8, 0, 4],
    }[branch];
    return tenGod(dayStem, hidden[0]);
  }

  function luckDirection(yearStem, gender) {
    const yangYear = yearStem % 2 === 0;
    const male = gender === "male";
    return (yangYear && male) || (!yangYear && !male);
  }

  function nextPrevTermJd(jd, forward) {
    const idx = monthTermIndex(jd);
    const yearGuess = new Date((jd - 2440587.5) * 86400000).getUTCFullYear();
    const candidates = [];
    for (let y = yearGuess - 1; y <= yearGuess + 1; y++) {
      for (let i = 0; i < 12; i++) {
        const around = gregorianToJD(y, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1][i], 6, 3);
        candidates.push(jdWhenLongitude(TERM_LON[i], around));
      }
    }
    candidates.sort((a, b) => a - b);
    if (forward) return candidates.find((x) => x > jd + 1 / 1440) ?? candidates[candidates.length - 1];
    const prev = candidates.filter((x) => x < jd - 1 / 1440);
    return prev[prev.length - 1] ?? candidates[0];
  }

  function calculate(input) {
    const { year, month, day, hour, minute, gender, timeUnknown } = input;
    const h = timeUnknown ? 12 : hour;
    const mi = timeUnknown ? 0 : minute;
    let calY = year;
    let calM = month;
    let calD = day;
    let useHour = h;
    let useMin = mi;

    if (!timeUnknown && h >= 23) {
      const next = new Date(Date.UTC(year, month - 1, day + 1));
      calY = next.getUTCFullYear();
      calM = next.getUTCMonth() + 1;
      calD = next.getUTCDate();
      useHour = 0;
      useMin = mi;
    }

    const birth = kstToUtcParts(year, month, day, h, mi);
    const lichun = lichunJd(year);
    const yearNum = birth.jd >= lichun ? year : year - 1;
    const yearPillar = pillarFromIndex(yearNum - 4);

    const monthIdx = monthTermIndex(birth.jd);
    const monthBranch = MONTH_BRANCHES[monthIdx];
    const monthStem = (MONTH_STEM_START[yearPillar.stem % 5] + monthIdx) % 10;
    const monthPillar = {
      stem: monthStem,
      branch: monthBranch,
      stemKo: STEMS[monthStem],
      branchKo: BRANCHES[monthBranch],
      stemHanja: STEM_HANJA[monthStem],
      branchHanja: BRANCH_HANJA[monthBranch],
      name: STEMS[monthStem] + BRANCHES[monthBranch],
      hanja: STEM_HANJA[monthStem] + BRANCH_HANJA[monthBranch],
      term: TERM_NAMES[monthIdx],
    };

    const dayPillar = pillarFromIndex(jdn(calY, calM, calD) + 49);

    let hourPillar = null;
    if (!timeUnknown) {
      const hb = hourBranch(h, mi);
      const hs = (HOUR_STEM_START[dayPillar.stem % 5] + hb) % 10;
      hourPillar = {
        stem: hs,
        branch: hb,
        stemKo: STEMS[hs],
        branchKo: BRANCHES[hb],
        stemHanja: STEM_HANJA[hs],
        branchHanja: BRANCH_HANJA[hb],
        name: STEMS[hs] + BRANCHES[hb],
        hanja: STEM_HANJA[hs] + BRANCH_HANJA[hb],
      };
    }

    const pillars = timeUnknown
      ? [
          { key: "year", label: "년주", pillar: yearPillar },
          { key: "month", label: "월주", pillar: monthPillar },
          { key: "day", label: "일주", pillar: dayPillar },
        ]
      : [
          { key: "hour", label: "시주", pillar: hourPillar },
          { key: "day", label: "일주", pillar: dayPillar },
          { key: "month", label: "월주", pillar: monthPillar },
          { key: "year", label: "년주", pillar: yearPillar },
        ];

    const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
    const annotated = pillars.map((p) => {
      counts[STEM_EL[p.pillar.stem]] += 1;
      counts[BRANCH_EL[p.pillar.branch]] += 1;
      return {
        ...p,
        stemEl: STEM_EL[p.pillar.stem],
        branchEl: BRANCH_EL[p.pillar.branch],
        stemGod: p.key === "day" ? "일간" : tenGod(dayPillar.stem, p.pillar.stem),
        branchGod: branchTenGod(dayPillar.stem, p.pillar.branch),
      };
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const weak = ELEMENTS.filter((el) => counts[el] === 0);
    const strong = [...ELEMENTS].sort((a, b) => counts[b] - counts[a])[0];
    const master = DAY_MASTER[dayPillar.stemKo];

    const forward = luckDirection(yearPillar.stem, gender);
    const boundary = nextPrevTermJd(birth.jd, forward);
    const startAge = Math.max(1, Math.round(Math.abs(boundary - birth.jd) / 3));
    const luck = [];
    let ls = monthStem;
    let lb = monthBranch;
    for (let i = 0; i < 8; i++) {
      if (forward) {
        ls = (ls + 1) % 10;
        lb = (lb + 1) % 12;
      } else {
        ls = (ls + 9) % 10;
        lb = (lb + 11) % 12;
      }
      luck.push({
        age: startAge + i * 10,
        name: STEMS[ls] + BRANCHES[lb],
        hanja: STEM_HANJA[ls] + BRANCH_HANJA[lb],
      });
    }

    let reading = `${year}년 ${month}월 ${day}일`;
    reading += timeUnknown ? " (시간 미상, 세 기둥)" : ` ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    reading += gender === "male" ? ", 남성. " : ", 여성. ";
    reading += `일간은 ${dayPillar.stemKo}(${master.title})입니다. ${master.text} `;
    reading += `오행은 ${strong}이 가장 많고`;
    reading += weak.length ? `, ${weak.join("·")}이(가) 비어 있습니다.` : " 다섯 기운이 모두 들어와 있습니다.";
    reading += ` 월주는 ${monthPillar.term} 절기 구간의 ${monthPillar.name}입니다.`;

    return {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      pillars: annotated,
      counts,
      total,
      luck,
      startAge,
      forward,
      reading,
      master,
      timeUnknown,
      lichunNote: birth.jd >= lichun ? `${year}년 입춘 이후` : `${year}년 입춘 이전 → 연주는 전년도`,
    };
  }

  const api = { calculate, STEMS, BRANCHES, ELEMENTS, jdn, sunLongitude, lichunJd, pillarFromIndex };
  if (typeof window !== "undefined") window.Saju = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})();
