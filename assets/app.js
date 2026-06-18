(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function compact(value, length) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    if (text.length <= length) {
      return text;
    }
    return text.slice(0, length - 1).trim() + "…";
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function initForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var keyword = input ? input.value.trim() : "";
        if (!keyword) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(keyword);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle("is-active", current === index);
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener("click", function () {
        show(current);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      });
    });

    timer = window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function initPageFilters() {
    var filterInput = document.querySelector("[data-page-filter]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var empty = document.querySelector("[data-empty-state]");
    if (!cards.length || (!filterInput && !typeSelect && !yearSelect)) {
      return;
    }

    function apply() {
      var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
      var type = typeSelect ? typeSelect.value : "";
      var year = yearSelect ? yearSelect.value : "";
      var visible = 0;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (type && card.getAttribute("data-type") !== type) {
          ok = false;
        }
        if (year && card.getAttribute("data-year") !== year) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    [filterInput, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  function renderCard(movie, rank) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span class=\"tag\">" + escapeHtml(tag) + "</span>";
    }).join("");
    var ribbon = rank ? "<span class=\"rank-ribbon\">" + rank + "</span>" : "";
    return "<article class=\"movie-card\">" +
      ribbon +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<span class=\"poster-frame\"><img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\"></span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p class=\"movie-line\">" + escapeHtml(compact(movie.oneLine, 92)) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var container = document.querySelector("[data-search-results]");
    if (!container || !window.siteSearchIndex) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-page-input]");
    var title = document.querySelector("[data-search-title]");
    var intro = document.querySelector("[data-search-intro]");
    if (input) {
      input.value = keyword;
    }
    var source = window.siteSearchIndex;
    var results;
    if (keyword) {
      var lower = keyword.toLowerCase();
      results = source.filter(function (movie) {
        return [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(" "), movie.oneLine]
          .join(" ")
          .toLowerCase()
          .indexOf(lower) !== -1;
      }).slice(0, 96);
      if (title) {
        title.textContent = "影片搜索";
      }
      if (intro) {
        intro.textContent = results.length ? "以下内容与“" + keyword + "”相关。" : "没有找到匹配内容，可换一个关键词继续探索。";
      }
    } else {
      results = source.slice(0, 36);
      if (title) {
        title.textContent = "影片搜索";
      }
      if (intro) {
        intro.textContent = "输入片名、地区、年份、类型或标签，快速进入对应影片详情。";
      }
    }
    container.innerHTML = results.length ? results.map(function (movie, index) {
      return renderCard(movie, index < 12 ? index + 1 : null);
    }).join("") : "<div class=\"empty-state is-visible\">没有找到匹配影片</div>";
  }

  ready(function () {
    initNavigation();
    initForms();
    initHero();
    initPageFilters();
    initSearchPage();
  });
})();
