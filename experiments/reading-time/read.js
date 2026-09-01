(function () {
  "use strict";

  var SPEEDS = {
    slow: { koreanCpm: 320, englishWpm: 160, label: "320자/분" },
    normal: { koreanCpm: 450, englishWpm: 220, label: "450자/분" },
    fast: { koreanCpm: 600, englishWpm: 280, label: "600자/분" },
  };

  var SAMPLE =
    "오늘 아침 커피 한 잔을 마시며 창밖을 바라봤어요.\n" +
    "구름 사이로 햇빛이 스며들고, 거리에는 사람들이 바쁘게 걸어갑니다.\n" +
    "짧은 글이라도 읽기 시간을 미리 알면 블로그나 뉴스레터 길이를 조절하기 쉬워요.\n" +
    "This tool also counts English words for mixed-language text.";

  var input = document.getElementById("text-input");
  var clearBtn = document.getElementById("clear-btn");
  var sampleBtn = document.getElementById("sample-btn");
  var resultTime = document.getElementById("result-time");
  var gaugeFill = document.getElementById("gauge-fill");
  var statChars = document.getElementById("stat-chars");
  var statWords = document.getElementById("stat-words");
  var statLines = document.getElementById("stat-lines");
  var statSpeed = document.getElementById("stat-speed");
  var statHint = document.getElementById("stat-hint");
  var speedBtns = document.querySelectorAll(".speed-btn");

  var currentSpeed = "normal";

  function formatNumber(value) {
    return value.toLocaleString("ko-KR");
  }

  function countLines(text) {
    if (!text) return 0;
    return text.split(/\r\n|\r|\n/).length;
  }

  function countKoreanChars(text) {
    var stripped = text.replace(/\s/g, "");
    var korean = stripped.match(/[\uAC00-\uD7A3\u3131-\u318E\u1100-\u11FF]/g);
    var other = stripped.replace(/[\uAC00-\uD7A3\u3131-\u318E\u1100-\u11FF]/g, "");
    return {
      korean: korean ? korean.length : 0,
      other: other.length,
    };
  }

  function countEnglishWords(text) {
    var matches = text.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g);
    return matches ? matches.length : 0;
  }

  function formatDuration(totalSeconds) {
    if (totalSeconds <= 0) return "0초";
    if (totalSeconds < 60) return Math.max(1, Math.round(totalSeconds)) + "초";

    var minutes = Math.floor(totalSeconds / 60);
    var seconds = Math.round(totalSeconds % 60);

    if (seconds === 0) return minutes + "분";
    if (seconds === 60) return minutes + 1 + "분";
    return minutes + "분 " + seconds + "초";
  }

  function gaugePercent(totalSeconds) {
    if (totalSeconds <= 0) return 0;
    if (totalSeconds <= 30) return (totalSeconds / 30) * 33;
    if (totalSeconds <= 180) return 33 + ((totalSeconds - 30) / 150) * 34;
    return Math.min(100, 67 + ((totalSeconds - 180) / 420) * 33);
  }

  function estimateReadingTime(text, speedKey) {
    var speed = SPEEDS[speedKey];
    var counts = countKoreanChars(text);
    var englishWords = countEnglishWords(text);
    var koreanSeconds = (counts.korean / speed.koreanCpm) * 60;
    var otherSeconds = (counts.other / speed.koreanCpm) * 60;
    var englishSeconds = (englishWords / speed.englishWpm) * 60;
    var totalSeconds = koreanSeconds + otherSeconds + englishSeconds;

    return {
      totalSeconds: totalSeconds,
      koreanChars: counts.korean + counts.other,
      englishWords: englishWords,
      lines: countLines(text),
      speedLabel: speed.label,
    };
  }

  function update() {
    var text = input.value;
    var result = estimateReadingTime(text, currentSpeed);

    statChars.textContent = formatNumber(result.koreanChars);
    statWords.textContent = formatNumber(result.englishWords);
    statLines.textContent = formatNumber(result.lines);
    statSpeed.textContent = result.speedLabel;
    resultTime.textContent = formatDuration(result.totalSeconds);
    gaugeFill.style.width = gaugePercent(result.totalSeconds) + "%";

    if (!text.trim()) {
      statHint.textContent = "한글은 글자 수, 영어는 단어 수로 계산합니다.";
      return;
    }

    statHint.textContent =
      "약 " +
      formatDuration(result.totalSeconds) +
      " · " +
      formatNumber(result.koreanChars) +
      "자 · 영어 " +
      formatNumber(result.englishWords) +
      "단어";
  }

  function setSpeed(speedKey) {
    currentSpeed = speedKey;
    speedBtns.forEach(function (btn) {
      var active = btn.dataset.speed === speedKey;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });
    update();
  }

  input.addEventListener("input", update);

  clearBtn.addEventListener("click", function () {
    input.value = "";
    input.focus();
    update();
  });

  sampleBtn.addEventListener("click", function () {
    input.value = SAMPLE;
    input.focus();
    update();
  });

  speedBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setSpeed(btn.dataset.speed);
    });
  });

  update();
})();
