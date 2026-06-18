(function () {
  const toggle = document.querySelector(".nav-toggle");
  const panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      const open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    const prev = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    start();
  }

  const inputs = Array.from(document.querySelectorAll("[data-search-input]"));
  const chips = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const resultState = document.querySelector("[data-result-state]");
  let activeFilter = "all";

  function applyFilters() {
    const query = inputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(" ");
    let shown = 0;

    cards.forEach(function (card) {
      const text = (card.getAttribute("data-search") || "").toLowerCase();
      const type = card.getAttribute("data-type") || "";
      const matchesQuery = !query || text.indexOf(query) !== -1;
      const matchesFilter = activeFilter === "all" || type.indexOf(activeFilter) !== -1 || text.indexOf(activeFilter.toLowerCase()) !== -1;
      const visible = matchesQuery && matchesFilter;
      card.classList.toggle("is-filtered-out", !visible);
      if (visible) {
        shown += 1;
      }
    });

    if (resultState) {
      resultState.textContent = shown ? "筛选到 " + shown + " 部影片" : "没有匹配影片";
    }
  }

  inputs.forEach(function (input) {
    input.addEventListener("input", applyFilters);
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (item) {
        item.classList.remove("active");
      });
      chip.classList.add("active");
      activeFilter = chip.getAttribute("data-filter") || "all";
      applyFilters();
    });
  });
})();
