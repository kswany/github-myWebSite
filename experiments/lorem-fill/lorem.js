(function () {
  var SENTENCES = [
    "오늘은 날씨가 맑고 산책하기 좋은 날입니다.",
    "아침에 따뜻한 커피 한 잔으로 하루를 시작합니다.",
    "창문을 열어두면 시원한 바람이 방 안으로 들어옵니다.",
    "작은 식물에 물을 주면 잎이 반짝이며 기운을 냅니다.",
    "책상 위 노트에 오늘 할 일을 적어 두었습니다.",
    "점심 메뉴를 고르다가 결국 평소 좋아하는 음식을 골랐습니다.",
    "버스를 기다리며 하늘에 떠 있는 구름을 바라보았습니다.",
    "저녁에는 가벼운 스트레칭으로 몸을 풀어 주었습니다.",
    "친구와 짧은 메시지를 주고받으며 하루를 마무리합니다.",
    "새로운 음악을 들으며 집중해서 일을 마쳤습니다.",
    "주말에는 근처 공원에서 천천히 걸으며 쉬었습니다.",
    "따뜻한 차 한 잔이 마음을 편하게 만들어 줍니다.",
    "오래된 사진을 꺼내 보며 좋았던 기억을 떠올렸습니다.",
    "간단한 요리를 해 먹으며 주방에 향긋한 냄새가 납니다.",
    "비가 내리는 날에는 창밖 빗소리를 들으며 책을 읽습니다.",
    "작은 목표를 하나씩 이루어 가며 뿌듯함을 느낍니다.",
    "햇살이 잘 드는 자리에 앉아 메모를 정리했습니다.",
    "가벼운 운동 후 물을 마시니 몸이 한결 가벼워집니다.",
    "새로 산 머그컵에 따뜻한 음료를 담아 마셨습니다.",
    "저녁 노을이 하늘을 붉게 물들이며 하루가 저물어 갑니다.",
    "짧은 낮잠 후 다시 일에 집중할 힘이 생겼습니다.",
    "깔끔하게 정리한 방이 보기만 해도 기분이 좋아집니다.",
    "좋아하는 향의 캔들을 켜 두고 편안한 시간을 보냈습니다.",
    "오늘 만난 사람과 나눈 대화가 기억에 남습니다.",
    "작은 실수도 웃으며 넘기고 다시 시도해 보기로 했습니다.",
    "따뜻한 수프 한 그릇이 몸과 마음을 채워 줍니다.",
    "창가에 앉아 도시의 저녁 풍경을 바라보았습니다.",
    "새로운 취미를 시작하며 설레는 마음이 들었습니다.",
    "일정을 미리 적어 두니 하루가 한결 여유로워졌습니다.",
    "가족과 함께한 식사 시간이 소중하게 느껴졌습니다.",
    "밤하늘에 별이 반짝이는 것을 발견하고 잠시 멈춰 섰습니다.",
    "좋은 글 한 편을 읽으며 생각을 정리했습니다.",
    "오늘도 무난하게 하루를 보낼 수 있어 감사합니다.",
    "작은 선물을 준비하며 상대를 떠올렸습니다.",
    "창의적인 아이디어가 떠올라 메모장에 적어 두었습니다.",
    "따뜻한 담요를 덮고 영화 한 편을 보았습니다.",
    "새로운 길로 걸어 가며 낯선 풍경을 즐겼습니다.",
    "오늘의 기분을 한 줄로 적어 일기장에 남겼습니다.",
    "가벼운 산책 후 상쾌한 공기를 마시며 돌아왔습니다.",
    "작은 성취에도 스스로에게 칭찬 한마디를 건넸습니다.",
  ];

  var countInput = document.getElementById("count-input");
  var countChips = document.querySelectorAll("[data-count]");
  var styleChips = document.querySelectorAll("[data-style]");
  var generateBtn = document.getElementById("generate-btn");
  var copyBtn = document.getElementById("copy-btn");
  var resultOutput = document.getElementById("result-output");
  var resultCount = document.getElementById("result-count");
  var statusOk = document.getElementById("status-ok");

  var currentStyle = "flow";

  function formatNumber(value) {
    return value.toLocaleString("ko-KR");
  }

  function pickSentence() {
    return SENTENCES[Math.floor(Math.random() * SENTENCES.length)];
  }

  function generateFlow(target) {
    var text = "";
    while (text.length < target) {
      if (text.length > 0) text += " ";
      text += pickSentence();
    }
    return text.slice(0, target);
  }

  function generateParagraph(target) {
    var text = "";
    while (text.length < target) {
      if (text.length > 0) text += "\n\n";
      text += pickSentence();
      if (Math.random() > 0.55 && text.length < target - 20) {
        text += " ";
        text += pickSentence();
      }
    }
    return text.slice(0, target);
  }

  function generate() {
    var target = parseInt(countInput.value, 10);
    if (!target || target < 10) target = 10;
    if (target > 5000) target = 5000;
    countInput.value = target;

    var text =
      currentStyle === "paragraph" ? generateParagraph(target) : generateFlow(target);

    resultOutput.value = text;
    resultCount.textContent = formatNumber(text.length) + "자";
    copyBtn.disabled = !text;
    statusOk.hidden = true;
  }

  function syncCountChips(value) {
    countChips.forEach(function (chip) {
      chip.classList.toggle("active", parseInt(chip.getAttribute("data-count"), 10) === value);
    });
  }

  countChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var count = parseInt(chip.getAttribute("data-count"), 10);
      countInput.value = count;
      syncCountChips(count);
    });
  });

  countInput.addEventListener("input", function () {
    var value = parseInt(countInput.value, 10);
    if (!value) return;
    syncCountChips(value);
  });

  styleChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      styleChips.forEach(function (c) {
        c.classList.remove("active");
      });
      chip.classList.add("active");
      currentStyle = chip.getAttribute("data-style");
    });
  });

  generateBtn.addEventListener("click", generate);

  copyBtn.addEventListener("click", function () {
    if (!resultOutput.value) return;
    navigator.clipboard.writeText(resultOutput.value).then(
      function () {
        statusOk.hidden = false;
        setTimeout(function () {
          statusOk.hidden = true;
        }, 2000);
      },
      function () {
        resultOutput.select();
        document.execCommand("copy");
        statusOk.hidden = false;
      }
    );
  });

  generate();
})();
