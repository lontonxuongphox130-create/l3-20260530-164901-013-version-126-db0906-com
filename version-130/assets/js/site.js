(() => {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('is-scrolled', window.scrollY > 18);
    }, { passive: true });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  let slideIndex = 0;

  const setSlide = (index) => {
    if (!slides.length) return;
    slideIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, current) => {
      slide.classList.toggle('is-active', current === slideIndex);
    });
    dots.forEach((dot, current) => {
      dot.classList.toggle('is-active', current === slideIndex);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => setSlide(index));
  });

  if (slides.length > 1) {
    setInterval(() => setSlide(slideIndex + 1), 5600);
  }

  const getSearchText = (card) => [
    card.dataset.title,
    card.dataset.region,
    card.dataset.type,
    card.dataset.year,
    card.dataset.genre,
    card.textContent
  ].join(' ').toLowerCase();

  const filterPanels = document.querySelectorAll('[data-filter-panel]');

  filterPanels.forEach((panel) => {
    const input = panel.querySelector('[data-filter-input]');
    const type = panel.querySelector('[data-filter-type]');
    const year = panel.querySelector('[data-filter-year]');
    const region = panel.querySelector('[data-filter-region]');
    const reset = panel.querySelector('[data-filter-reset]');
    const target = panel.dataset.filterTarget;
    const cards = Array.from(document.querySelectorAll(target || '.movie-card'));
    const count = document.querySelector(panel.dataset.countTarget || '');
    const empty = document.querySelector(panel.dataset.emptyTarget || '');

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';
    if (input && initialQuery) {
      input.value = initialQuery;
    }

    const apply = () => {
      const q = input ? input.value.trim().toLowerCase() : '';
      const selectedType = type ? type.value : '';
      const selectedYear = year ? year.value : '';
      const selectedRegion = region ? region.value : '';
      let visible = 0;

      cards.forEach((card) => {
        const matchedText = !q || getSearchText(card).includes(q);
        const matchedType = !selectedType || card.dataset.type === selectedType;
        const matchedYear = !selectedYear || card.dataset.year === selectedYear;
        const matchedRegion = !selectedRegion || card.dataset.region === selectedRegion;
        const isVisible = matchedText && matchedType && matchedYear && matchedRegion;
        card.style.display = isVisible ? '' : 'none';
        if (isVisible) visible += 1;
      });

      if (count) {
        count.textContent = `已筛选 ${visible} 部影片`;
      }
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };

    [input, type, year, region].forEach((node) => {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    if (reset) {
      reset.addEventListener('click', () => {
        if (input) input.value = '';
        if (type) type.value = '';
        if (year) year.value = '';
        if (region) region.value = '';
        apply();
      });
    }

    apply();
  });

  const players = document.querySelectorAll('.player-shell');

  players.forEach((shell) => {
    const video = shell.querySelector('video');
    const startButton = shell.querySelector('.player-start');
    const poster = shell.querySelector('.player-poster');
    let hlsInstance = null;
    let loaded = false;

    const play = () => {
      if (!video) return;
      const source = video.dataset.hls;
      shell.classList.add('is-playing');

      if (!loaded && source) {
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => {});
          }, { once: true });
        } else {
          video.src = source;
        }
      }

      video.play().catch(() => {});
    };

    if (startButton) {
      startButton.addEventListener('click', play);
    }

    if (poster) {
      poster.addEventListener('click', play);
    }

    video?.addEventListener('play', () => {
      shell.classList.add('is-playing');
    });

    video?.addEventListener('emptied', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
      loaded = false;
    });
  });
})();
