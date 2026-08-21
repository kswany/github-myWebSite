(function () {
  "use strict";

  /** 새 실험 추가 시 여기에 slug·label만 넣으면 전 페이지 메뉴에 반영됩니다. */
  var EXPERIMENTS = [
    { slug: "food-worldcup", label: "음식 월드컵" },
    { slug: "reaction-test", label: "반응속도" },
    { slug: "balance-game", label: "밸런스" },
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

  function mountSubNav() {
    var mainNav = document.querySelector("header .nav");
    if (!mainNav || document.querySelector(".nav-sub")) return;

    var active = currentSlug();
    var sub = document.createElement("nav");
    sub.className = "nav-sub";
    sub.setAttribute("aria-label", "실험 바로가기");

    EXPERIMENTS.forEach(function (item) {
      var a = document.createElement("a");
      a.href = experimentHref(item.slug);
      a.textContent = item.label;
      if (item.slug === active) a.setAttribute("aria-current", "page");
      sub.appendChild(a);
    });

    mainNav.insertAdjacentElement("afterend", sub);
  }

  function mountStyles() {
    if (document.getElementById("nav-sub-styles")) return;
    var style = document.createElement("style");
    style.id = "nav-sub-styles";
    style.textContent =
      ".nav-sub{display:flex;flex-wrap:wrap;gap:6px 10px;margin-top:8px;padding-top:8px;border-top:1px solid #e2e8f0;color:var(--ink-soft,#475569);font-size:0.78rem}" +
      ".hero .nav-sub{justify-content:center;margin-top:10px}" +
      ".topbar .nav-sub{justify-content:flex-end;width:100%}" +
      ".nav-sub a{padding:4px 10px;border-radius:999px;background:#f1f5f9;font-weight:600;transition:background 200ms ease,color 200ms ease}" +
      ".nav-sub a:hover,.nav-sub a[aria-current=page]{color:var(--cinnabar,#ea580c);background:#ffedd5}" +
      "@media(max-width:720px){.topbar .nav-sub{justify-content:flex-start}}";
    document.head.appendChild(style);
  }

  document.addEventListener("DOMContentLoaded", function () {
    mountStyles();
    mountSubNav();
  });
})();
