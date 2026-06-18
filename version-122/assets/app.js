(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupNavigation() {
    var button = document.querySelector('[data-nav-button]');
    var nav = document.querySelector('[data-site-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === active);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === active);
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });
    window.setInterval(function () {
      show(active + 1);
    }, 5200);
  }

  function setupFilters() {
    var panel = document.querySelector('[data-filter-panel]');
    var list = document.querySelector('[data-filter-list]');
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector('[data-filter-input]');
    var year = panel.querySelector('[data-filter-year]');
    var type = panel.querySelector('[data-filter-type]');
    var items = selectAll('[data-title]', list);
    function match(item, query, selectedYear, selectedType) {
      var haystack = [
        item.getAttribute('data-title') || '',
        item.getAttribute('data-year') || '',
        item.getAttribute('data-region') || '',
        item.getAttribute('data-genre') || '',
        item.getAttribute('data-type') || '',
        item.textContent || ''
      ].join(' ').toLowerCase();
      var yearOk = !selectedYear || (item.getAttribute('data-year') || '').indexOf(selectedYear) !== -1;
      var typeOk = !selectedType || (item.getAttribute('data-type') || '') === selectedType;
      return haystack.indexOf(query) !== -1 && yearOk && typeOk;
    }
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      var selectedType = type ? type.value : '';
      items.forEach(function (item) {
        item.hidden = !match(item, query, selectedYear, selectedType);
      });
    }
    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  }

  function setupPlayers() {
    selectAll('[data-player]').forEach(function (box) {
      var source = box.getAttribute('data-stream');
      var video = box.querySelector('[data-movie-player]');
      var overlay = box.querySelector('[data-play-trigger]');
      var loaded = false;
      if (!source || !video) {
        return;
      }
      function attach() {
        if (loaded) {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls();
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
      function play() {
        attach();
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }
      if (overlay) {
        overlay.addEventListener('click', play);
      }
      video.addEventListener('click', play);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
