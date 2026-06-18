(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function textValue(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var input = panel.querySelector(".search-input");
      var year = panel.querySelector(".year-filter");
      var type = panel.querySelector(".type-filter");
      var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      function apply() {
        var q = textValue(input && input.value);
        var y = textValue(year && year.value);
        var t = textValue(type && type.value);
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.textContent
          ].join(" ").toLowerCase();
          var matchQuery = !q || haystack.indexOf(q) !== -1;
          var matchYear = !y || textValue(card.getAttribute("data-year")) === y;
          var matchType = !t || textValue(card.getAttribute("data-type")) === t;
          card.classList.toggle("is-hidden", !(matchQuery && matchYear && matchType));
        });
      }
      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  window.initMoviePlayer = function (videoId, coverId, buttonId, playlistUrl) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    var attached = false;
    var hlsInstance = null;
    if (!video || !cover || !playlistUrl) {
      return;
    }
    function attach() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = playlistUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(playlistUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = playlistUrl;
      }
    }
    function play() {
      attach();
      cover.classList.add("hidden");
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          cover.classList.remove("hidden");
        });
      }
    }
    cover.addEventListener("click", play);
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        play();
      });
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      cover.classList.add("hidden");
    });
    video.addEventListener("ended", function () {
      if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
        hlsInstance.stopLoad();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
