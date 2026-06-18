(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length > 1) {
        var active = 0;
        var show = function (index) {
            active = index;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === active);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
            });
        });
        window.setInterval(function () {
            show((active + 1) % slides.length);
        }, 5200);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]')).forEach(function (input) {
        var selector = input.getAttribute('data-filter-target') || '.movie-card';
        var empty = document.querySelector(input.getAttribute('data-empty-target') || '.empty-result');
        var cards = Array.prototype.slice.call(document.querySelectorAll(selector));
        var apply = function () {
            var q = input.value.trim().toLowerCase();
            var shown = 0;
            cards.forEach(function (card) {
                var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '') + ' ' + card.textContent).toLowerCase();
                var ok = !q || text.indexOf(q) > -1;
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.style.display = shown ? 'none' : 'block';
            }
        };
        input.addEventListener('input', apply);
        apply();
    });
})();
