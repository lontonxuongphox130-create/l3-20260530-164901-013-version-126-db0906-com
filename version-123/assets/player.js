(function () {
  const video = document.getElementById("moviePlayer");
  const overlay = document.getElementById("playerOverlay");
  const button = document.getElementById("playerStart");
  let attached = false;
  let hls = null;

  if (!video || typeof mediaSourceUrl === "undefined") {
    return;
  }

  function attachMedia() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mediaSourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hls.loadSource(mediaSourceUrl);
      hls.attachMedia(video);
    } else {
      video.src = mediaSourceUrl;
    }
  }

  function begin() {
    attachMedia();
    video.controls = true;
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      begin();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", begin);
    overlay.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        begin();
      }
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      begin();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
