function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const panel = document.querySelector("[data-mobile-panel]");
  if (!toggle || !panel) {
    return;
  }
  toggle.addEventListener("click", () => {
    panel.classList.toggle("is-open");
  });
}

function initHero() {
  const root = document.querySelector("[data-hero-carousel]");
  if (!root) {
    return;
  }
  const slides = Array.from(root.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(root.querySelectorAll("[data-hero-dot]"));
  if (!slides.length) {
    return;
  }
  let index = 0;
  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
  };
  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => show(i));
  });
  window.setInterval(() => show(index + 1), 5200);
}

function initCardFilter() {
  const input = document.querySelector("[data-filter-input]");
  const grid = document.querySelector("[data-card-grid]");
  if (!input || !grid) {
    return;
  }
  const cards = Array.from(grid.querySelectorAll("[data-card]"));
  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.tags,
        card.dataset.year,
        card.dataset.category
      ].join(" ").toLowerCase();
      card.hidden = query && !haystack.includes(query);
    });
  });
}

function movieCard(movie) {
  const tags = (movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  return `
    <article class="movie-card" data-card>
      <a class="poster-link" href="${escapeHtml(movie.url)}" aria-label="观看${escapeHtml(movie.title)}">
        <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-glow"></span>
      </a>
      <div class="movie-card-body">
        <div class="movie-card-meta">
          <span>${escapeHtml(movie.category)}</span>
          <span>${escapeHtml(movie.year)}</span>
        </div>
        <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-list">${tags}</div>
      </div>
    </article>`;
}

function initSearchPage() {
  const form = document.querySelector("[data-search-form]");
  const input = document.querySelector("[data-search-input]");
  const select = document.querySelector("[data-search-category]");
  const results = document.querySelector("[data-search-results]");
  const summary = document.querySelector("[data-search-summary]");
  const data = window.SEARCH_MOVIES || [];
  if (!form || !input || !results || !summary || !data.length) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  input.value = params.get("q") || "";
  if (select) {
    select.value = params.get("category") || "";
  }

  const render = () => {
    const query = input.value.trim().toLowerCase();
    const category = select ? select.value : "";
    const filtered = data.filter((movie) => {
      const inCategory = !category || movie.category === category;
      const haystack = [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.category,
        movie.genre,
        (movie.tags || []).join(" "),
        movie.oneLine
      ].join(" ").toLowerCase();
      return inCategory && (!query || haystack.includes(query));
    }).slice(0, 120);

    if (!query && !category) {
      summary.textContent = "输入关键词开始搜索";
      results.innerHTML = "";
      return;
    }

    summary.textContent = filtered.length ? `找到 ${filtered.length} 条相关影片` : "没有找到相关影片";
    results.innerHTML = filtered.map(movieCard).join("");
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const next = new URLSearchParams();
    if (input.value.trim()) {
      next.set("q", input.value.trim());
    }
    if (select && select.value) {
      next.set("category", select.value);
    }
    const queryString = next.toString();
    window.history.replaceState(null, "", queryString ? `?${queryString}` : window.location.pathname);
    render();
  });

  input.addEventListener("input", render);
  if (select) {
    select.addEventListener("change", render);
  }
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initHero();
  initCardFilter();
  initSearchPage();
});
