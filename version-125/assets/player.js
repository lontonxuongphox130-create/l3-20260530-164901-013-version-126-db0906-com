import { H as Hls } from './hls-vendor-dru42stk.js';

function select(selector, parent) {
  return (parent || document).querySelector(selector);
}

function setupPlayer(box) {
  var video = select('video', box);
  var button = select('[data-play]', box);
  var status = select('[data-status]', box);
  var stream = video ? video.getAttribute('data-stream') : '';
  var hls = null;

  if (!video || !stream) {
    if (status) {
      status.textContent = '播放源加载中，请稍候。';
    }
    return;
  }

  function setStatus(message) {
    if (status) {
      status.textContent = message || '';
    }
  }

  function prepare() {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', function () {
        setStatus('');
      }, { once: true });
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('');
      });
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放加载中断，请刷新后重试。');
        }
      });
      return;
    }

    setStatus('浏览器无法播放当前视频格式。');
  }

  function play() {
    if (button) {
      button.classList.add('is-hidden');
    }

    video.setAttribute('controls', 'controls');
    video.play().catch(function () {
      setStatus('请再次点击播放按钮。');
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
  }

  prepare();

  if (button) {
    button.addEventListener('click', play);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
