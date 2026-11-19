(function () {
  'use strict';

  var html = document.documentElement;

  /* ---------- 主题 ---------- */
  function applyTheme(t) {
    html.setAttribute('data-theme', t);
    try { localStorage.setItem('aurora_theme', t); } catch (e) {}
  }
  var saved = null;
  try { saved = localStorage.getItem('aurora_theme'); } catch (e) {}
  if (!saved) {
    saved = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    html.setAttribute('data-theme', saved);
  }
  var themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- 导航滚动 / 移动菜单 ---------- */
  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');
  var progress = document.getElementById('progressLine');
  var isPost = !!document.getElementById('postContent');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.classList.toggle('show', y > 400);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var menu = document.getElementById('menu');
  var menuToggle = document.getElementById('menuToggle');
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && e.target !== menuToggle) menu.classList.remove('open');
    });
  }

  /* ---------- 首页打字机（平滑逐字） ---------- */
  var typedEl = document.getElementById('typed');
  if (typedEl) {
    var subs = (window.__SUBS__ && window.__SUBS__.length) ? window.__SUBS__ : ['走好选择的路，别走选择好的路'];
    var si = 0, ci = 0, deleting = false;
    var TYPE = 75, DEL = 42, HOLD = 2200, GAP = 350;

    function tick() {
      var cur = subs[si];
      if (!deleting) {
        ci++;
        typedEl.textContent = cur.slice(0, ci);
        if (ci >= cur.length) {
          deleting = true;
          setTimeout(tick, HOLD);
          return;
        }
        setTimeout(tick, TYPE);
      } else {
        ci--;
        typedEl.textContent = cur.slice(0, ci);
        if (ci <= 0) {
          deleting = false;
          si = (si + 1) % subs.length;
          setTimeout(tick, GAP);
          return;
        }
        setTimeout(tick, DEL);
      }
    }
    setTimeout(tick, 260);
  }

  /* ---------- 目录 ---------- */
  var tocSrc = document.querySelector('.toc-html-source');
  var tocInner = document.getElementById('tocInner');
  if (tocSrc && tocInner) {
    var content = tocSrc.innerHTML.trim();
    if (content) {
      tocInner.innerHTML = content;
      var links = tocInner.querySelectorAll('a');
      links.forEach(function (a) {
        var raw = a.getAttribute('href') || '';
        var id = raw.replace(/^#/, '');
        if (!id) return;
        a.addEventListener('click', function (e) {
          var target = document.getElementById(id);
          if (!target) return;
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', '#' + id);
        });
      });
      // 高亮当前小节
      var heads = Array.prototype.slice.call(document.querySelectorAll('#postContent h2, #postContent h3'));
      if (heads.length) {
        var map = [];
        links.forEach(function (a) {
          var id = (a.getAttribute('href') || '').replace(/^#/, '');
          var el = id ? document.getElementById(id) : null;
          if (el) map.push({ link: a, el: el });
        });
        var ticking = false;
        function syncToc() {
          ticking = false;
          var cur = null;
          map.forEach(function (m) {
            if (m.el.getBoundingClientRect().top <= 120) cur = m;
          });
          links.forEach(function (a) { a.classList.remove('toc-active'); });
          if (cur) cur.link.classList.add('toc-active');
        }
        window.addEventListener('scroll', function () {
          if (!ticking) { ticking = true; window.requestAnimationFrame(syncToc); }
        }, { passive: true });
        syncToc();
      }
    } else {
      var aside = document.querySelector('.post-aside');
      if (aside) aside.style.display = 'none';
    }
  }

  /* ---------- 音乐播放器 ---------- */
  var box = document.getElementById('aplayer-box');
  var cfg = window.AURORA || {};
  if (box && typeof APlayer !== 'undefined' && Array.isArray(window.MUSIC_PLAYLIST) && window.MUSIC_PLAYLIST.length) {
    new APlayer({
      container: box,
      fixed: true,
      theme: cfg.musicTheme || '#3b82f6',
      loop: 'all',
      order: 'list',
      preload: 'metadata',
      volume: cfg.volume || 0.6,
      listFolded: true,
      listMaxHeight: '320px',
      audio: window.MUSIC_PLAYLIST
    });
  }
})();
