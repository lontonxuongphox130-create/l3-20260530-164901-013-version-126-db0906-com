(function () {
  var root = document.documentElement.getAttribute('data-root') || '';

  function selectAll(selector, parent) {
    return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var active = 0;

    function showSlide(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }
  }

  selectAll('[data-card-filter]').forEach(function (input) {
    var list = document.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    var cards = selectAll('.movie-card', list);

    input.addEventListener('input', function () {
      var term = input.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();

        card.style.display = !term || haystack.indexOf(term) !== -1 ? '' : 'none';
      });
    });
  });

  selectAll('[data-card-sort]').forEach(function (select) {
    var list = document.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    select.addEventListener('change', function () {
      var cards = selectAll('.movie-card', list);
      var value = select.value;

      cards.sort(function (a, b) {
        if (value === 'year-desc') {
          return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        }

        if (value === 'hot-desc') {
          return Number(b.getAttribute('data-hot')) - Number(a.getAttribute('data-hot'));
        }

        return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
      });

      cards.forEach(function (card) {
        list.appendChild(card);
      });
    });
  });

  function getSearchItems() {
    return window.MovieSearchIndex || [];
  }

  function searchItems(term) {
    var words = term.trim().toLowerCase().split(/\s+/).filter(Boolean);

    if (!words.length) {
      return [];
    }

    return getSearchItems().filter(function (item) {
      var haystack = [item.title, item.year, item.region, item.type, item.category, item.terms].join(' ').toLowerCase();
      return words.every(function (word) {
        return haystack.indexOf(word) !== -1;
      });
    }).slice(0, 80);
  }

  function renderSearchPage() {
    var input = document.querySelector('[data-search-page-input]');
    var results = document.querySelector('[data-search-results]');
    var summary = document.querySelector('[data-search-summary]');

    if (!results || !summary) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input) {
      input.value = query;
    }

    if (!query.trim()) {
      summary.textContent = '请输入关键词开始搜索。';
      results.innerHTML = '';
      return;
    }

    var found = searchItems(query);
    summary.textContent = '搜索“' + query + '”找到 ' + found.length + ' 条结果。';

    results.innerHTML = found.map(function (item) {
      return [
        '<article class="search-result-item">',
        '<h2><a href="' + root + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
        '<p>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type + ' · ' + item.category) + '</p>',
        '<p>' + escapeHtml(item.oneLine || '') + '</p>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  renderSearchPage();
})();
