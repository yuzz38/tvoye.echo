/* ЭХО — это хочется одеть | © 2026 Полунин Лев */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* header state + sticky CTA */
  var hdr = $('.hdr'), sticky = $('.sticky-cta'), final = $('.final');
  var onScroll = function () {
    var y = window.pageYOffset || doc.scrollTop;
    hdr.classList.toggle('is-scrolled', y > 20);
    if (sticky) {
      var nearEnd = final && final.getBoundingClientRect().top < window.innerHeight;
      sticky.classList.toggle('is-show', y > window.innerHeight * 0.8 && !nearEnd && !document.body.classList.contains('menu-open'));
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* burger menu */
  var burger = $('#burger'), nav = $('#nav');
  var setMenu = function (open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
    onScroll();
  };
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 960) setMenu(false); });

  /* reveal on scroll */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 70 + 'ms'; io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* lookbook hotspots */
  var dots = $$('.dot'), items = $$('.item');
  var activate = function (n) {
    dots.forEach(function (d) { d.classList.toggle('is-active', d.dataset.item === n); });
    items.forEach(function (it) { it.classList.toggle('is-active', it.dataset.item === n); });
  };
  dots.forEach(function (d) { d.addEventListener('click', function () { activate(d.dataset.item); }); });
  items.forEach(function (it) { it.addEventListener('click', function () { activate(it.dataset.item); }); });
  activate('0');

  /* trousers colour switch */
  $$('[data-swap]').forEach(function (box) {
    var btns = $$('button', box), imgs = $$('.swap__img', box);
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
        imgs.forEach(function (im) {
          var on = im.dataset.tone === b.dataset.to;
          if (on) { var i = $('img', im); if (i && i.loading === 'lazy') i.loading = 'eager'; }
          im.classList.toggle('is-on', on);
        });
      });
    });
  });

  /* autoplay muted videos only while visible */
  var vids = $$('.autovid');
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && !reduce) {
          if (v.preload === 'none') { v.preload = 'auto'; }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { v.muted = true; v.setAttribute('muted', ''); vio.observe(v); });
  }

  /* gift video with sound */
  var gv = $('#giftVideo'), gp = $('#giftPlay');
  if (gv && gp) {
    gp.addEventListener('click', function () {
      gv.controls = true;
      var p = gv.play(); if (p && p.catch) p.catch(function () {});
      gp.classList.add('is-hidden');
    });
    gv.addEventListener('ended', function () { gp.classList.remove('is-hidden'); gv.controls = false; });
  }

  /* reviews slider: native scroll-snap + arrows + dots + autoplay */
  var slider = $('#revSlider'), track = $('#revTrack'), dotsBox = $('#revDots');
  if (slider && track) {
    var slides = $$('.rev', track), prev = $('#revPrev'), next = $('#revNext'), cur = 0, timer;
    slides.forEach(function (s, i) {
      s.setAttribute('role', 'group');
      s.setAttribute('aria-roledescription', 'слайд');
      s.setAttribute('aria-label', (i + 1) + ' из ' + slides.length);
      var b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-label', 'Отзыв ' + (i + 1));
      b.addEventListener('click', function () { go(i); restart(); });
      dotsBox.appendChild(b);
    });
    var dotBtns = $$('button', dotsBox);
    var maxIndex = function () {
      var max = slider.scrollWidth - slider.clientWidth;
      for (var i = 0; i < slides.length; i++) { if (slides[i].offsetLeft - slides[0].offsetLeft >= max - 4) return i; }
      return slides.length - 1;
    };
    var go = function (i) {
      var m = maxIndex();
      if (i > m) i = 0; if (i < 0) i = m;
      slider.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
    };
    var sync = function () {
      var x = slider.scrollLeft, best = 0, d = Infinity;
      slides.forEach(function (s, i) { var dd = Math.abs(s.offsetLeft - slides[0].offsetLeft - x); if (dd < d) { d = dd; best = i; } });
      if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 4) best = Math.max(best, maxIndex());
      cur = best;
      dotBtns.forEach(function (b, i) { b.setAttribute('aria-selected', i === cur ? 'true' : 'false'); b.hidden = i > maxIndex(); });
    };
    var raf; slider.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener('resize', sync);
    prev.addEventListener('click', function () { go(cur - 1); restart(); });
    next.addEventListener('click', function () { go(cur + 1); restart(); });
    var restart = function () { clearInterval(timer); if (!reduce) timer = setInterval(function () { go(cur + 1); }, 6000); };
    slider.addEventListener('pointerdown', function () { clearInterval(timer); });
    slider.addEventListener('mouseenter', function () { clearInterval(timer); });
    slider.addEventListener('mouseleave', restart);
    slider.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); }
    });
    slider.tabIndex = 0;
    sync(); restart();
  }

  /* echo ripple on tap/click */
  if (!reduce) {
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      for (var k = 0; k < 2; k++) {
        var r = document.createElement('span');
        r.className = 'ripple'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px';
        if (k) r.style.animationDelay = '.14s';
        document.body.appendChild(r);
        setTimeout(function (el) { return function () { el.remove(); }; }(r), 1200);
      }
    }, { passive: true });
  }
})();
