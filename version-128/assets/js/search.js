(function () {
    var params = new URLSearchParams(window.location.search);
    var q = (params.get('q') || '').trim();
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var empty = document.getElementById('searchEmpty');
    if (input) {
        input.value = q;
    }
    var render = function (keyword) {
        var words = keyword.trim().toLowerCase().split(/\s+/).filter(Boolean);
        var list = (window.SEARCH_MOVIES || []).filter(function (item) {
            if (!words.length) {
                return false;
            }
            var text = [item.title, item.year, item.region, item.type, item.genre, (item.tags || []).join(' '), item.line].join(' ').toLowerCase();
            return words.every(function (word) {
                return text.indexOf(word) !== -1;
            });
        }).slice(0, 120);
        if (!results) {
            return;
        }
        results.innerHTML = list.map(function (item) {
            return '<article class="rank-card">' +
                '<a class="rank-thumb" href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></a>' +
                '<div class="rank-body"><a class="rank-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
                '<p>' + escapeHtml(item.line) + '</p>' +
                '<div class="movie-meta"><span>' + item.year + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div></div>' +
                '</article>';
        }).join('');
        if (empty) {
            empty.style.display = list.length ? 'none' : 'block';
        }
    };
    var escapeHtml = function (value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[char];
        });
    };
    if (input) {
        input.addEventListener('input', function () {
            render(input.value);
        });
    }
    render(q);
})();
