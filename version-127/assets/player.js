import { H as Hls } from "./hls-vendor-dru42stk.js";

function setupPlayer(player) {
  const video = player.querySelector("video");
  const trigger = player.querySelector("[data-play-trigger]");
  const source = player.dataset.src;
  let hls = null;

  if (!video || !source) {
    return;
  }

  const load = () => {
    if (player.dataset.loaded === "1") {
      return;
    }
    player.dataset.loaded = "1";
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  };

  const play = () => {
    load();
    player.classList.add("is-playing");
    const result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(() => {});
    }
  };

  if (trigger) {
    trigger.addEventListener("click", play);
  }

  video.addEventListener("click", () => {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener("beforeunload", () => {
    if (hls) {
      hls.destroy();
    }
  });
}

const player = document.querySelector("[data-player]");
if (player) {
  setupPlayer(player);
}

document.querySelectorAll("[data-play-now]").forEach((button) => {
  button.addEventListener("click", () => {
    const playerBox = document.querySelector("[data-player]");
    const trigger = playerBox ? playerBox.querySelector("[data-play-trigger]") : null;
    if (trigger) {
      trigger.click();
      playerBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });
});
