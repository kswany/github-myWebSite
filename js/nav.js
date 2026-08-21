(function () {
  "use strict";

  /** 새 실험 추가 시 여기에 slug·label만 넣으면 전 페이지 메뉴에 반영됩니다. */
  var EXPERIMENTS = [
    { slug: "food-worldcup", label: "음식 월드컵" },
    { slug: "reaction-test", label: "반응속도" },
    { slug: "balance-game", label: "밸런스" },
    { slug: "mini-quiz", label: "하루 타입" },
  ];

  function experimentHref(slug) {
    var path = location.pathname;
    if (/\/experiments\/[^/]+\/?/.test(path)) return "../" + slug + "/";
    if (/\/experiments\/?/.test(path)) return slug + "/";
    if (/\/(saju|games|guestbook)\/?/.test(path)) return "../experiments/" + slug + "/";
    return "experiments/" + slug + "/";
  }

  function currentSlug() {
    var m = location.pathname.match(/\/experiments\/([^/]+)/);
    return m ? m[1] : "";
  }

  function mount() {
    var nav = document.querySelector("header .nav");
    if (!nav || nav.querySelector("[data-exp-nav]")) return;

    var active = currentSlug();
    EXPERIMENTS.forEach(function (item) {
      var a = document.createElement("a");
      a.href = experimentHref(item.slug);
      a.textContent = item.label;
      a.setAttribute("data-exp-nav", item.slug);
      if (item.slug === active) a.setAttribute("aria-current", "page");
      nav.appendChild(a);
    });
  }

  document.addEventListener("DOMContentLoaded", mount);
})();
