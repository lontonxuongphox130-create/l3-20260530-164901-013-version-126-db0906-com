(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var previous = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var input = document.querySelector('[data-filter-input]');
        var year = document.querySelector('[data-filter-year]');
        var grid = document.querySelector('[data-filter-grid]');
        var empty = document.querySelector('[data-empty-state]');
        if (!grid) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';
        if (input && initial) {
            input.value = initial;
        }
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.js-movie-card'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function run() {
            var keyword = normalize(input ? input.value : '');
            var selectedYear = year ? year.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var yearOk = !selectedYear || card.getAttribute('data-year') === selectedYear;
                var keyOk = !keyword || haystack.indexOf(keyword) !== -1;
                var match = yearOk && keyOk;
                card.classList.toggle('hidden', !match);
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', run);
        }
        if (year) {
            year.addEventListener('change', run);
        }
        run();
    }

    function loadStream(video, stream, afterReady) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.src !== stream) {
                video.src = stream;
            }
            afterReady();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (!video.__hls) {
                video.__hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                video.__hls.attachMedia(video);
            }
            video.__hls.loadSource(stream);
            video.__hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                afterReady();
            });
            return;
        }
        if (video.src !== stream) {
            video.src = stream;
        }
        afterReady();
    }

    window.attachPlayer = function (videoId, layerId, stream) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        if (!video || !layer || !stream) {
            return;
        }
        var started = false;

        function begin() {
            layer.classList.add('hide');
            loadStream(video, stream, function () {
                var action = video.play();
                if (action && typeof action.catch === 'function') {
                    action.catch(function () {
                        layer.classList.remove('hide');
                    });
                }
                started = true;
            });
        }

        layer.addEventListener('click', begin);
        video.addEventListener('click', function () {
            if (!started) {
                begin();
            }
        });
        video.addEventListener('play', function () {
            layer.classList.add('hide');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                layer.classList.remove('hide');
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
}());
