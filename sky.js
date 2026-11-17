// The sky at the top of the page, and the light and dark theme that goes with it.
//
// The sky follows the visitor's own clock, with the same colours the app uses
// on its Home screen. It uses no location and no weather. The toggle in the nav
// plays the sky through to night, or back to day.
//
// This file loads in the <head> so the right sky is in place before first paint.
(function () {
  var root = document.documentElement;
  root.classList.add('js');

  var NIGHT_E = -0.45;   // the sky the dark theme rests on
  var DAY_E = 0.5;       // the sky the light theme rests on
  var DARK_BELOW = -0.04; // below this the sun is down and the page goes dark
  var DURATION = 2600;

  // Page colours for each theme, as red, green, blue.
  var LIGHT = { bg: [244, 243, 239], ink: [11, 11, 15], card: [255, 255, 255], 'on-ink': [255, 255, 255], accent: [85, 67, 255], error: [179, 38, 30] };
  var DARK = { bg: [10, 12, 20], ink: [244, 243, 239], card: [22, 25, 35], 'on-ink': [10, 12, 20], accent: [154, 143, 255], error: [255, 154, 143] };

  // Sky colours at night, twilight, golden hour and full day. From the app.
  var TOP = [[9, 14, 36], [23, 31, 74], [56, 92, 158], [51, 120, 214]];
  var BOTTOM = [[28, 41, 74], [110, 92, 140], [245, 158, 107], [153, 201, 242]];
  var CLOUD = [[92, 102, 148], [184, 153, 194], [255, 204, 168], [255, 255, 255]];

  function smoothstep(a, b, x) {
    var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function mix(a, b, t) {
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }

  function rgb(c) {
    return 'rgb(' + Math.round(c[0]) + ' ' + Math.round(c[1]) + ' ' + Math.round(c[2]) + ')';
  }

  // Blend the four stages for a sun height `e`: about -0.5 at midnight, 0 at
  // the horizon, 0.5 at noon.
  function stage(colours, e) {
    var c = mix(colours[0], colours[1], smoothstep(-0.35, -0.10, e));
    c = mix(c, colours[2], smoothstep(-0.10, 0.03, e));
    return mix(c, colours[3], smoothstep(0.03, 0.30, e));
  }

  // A plain day: sunrise near six, sunset near eighteen, by the visitor's clock.
  function sunNow() {
    var now = new Date();
    var hours = now.getHours() + now.getMinutes() / 60;
    return 0.5 * Math.sin(Math.PI * (hours - 6) / 12);
  }

  var state = { e: sunNow(), d: 0 };
  state.d = state.e < DARK_BELOW ? 1 : 0;
  var frame = 0;

  function paint() {
    var style = root.style;
    var top = stage(TOP, state.e);
    style.setProperty('--sky-top', rgb(top));
    style.setProperty('--sky-bottom', rgb(stage(BOTTOM, state.e)));
    style.setProperty('--cloud', rgb(stage(CLOUD, state.e)));
    style.setProperty('--stars', (1 - smoothstep(-0.30, -0.06, state.e)).toFixed(3));
    for (var name in LIGHT) {
      style.setProperty('--' + name, rgb(mix(LIGHT[name], DARK[name], state.d)));
    }
    return top;
  }

  // Time lapse: while the sky changes, the clouds race across it, then ease
  // back to their slow drift. `rush` runs from 0 (normal) up to 1 (fastest).
  var CLOUD_RUSH = 200;
  function rushClouds(rush) {
    var clouds = document.querySelectorAll('.clouds');
    for (var i = 0; i < clouds.length; i++) {
      if (!clouds[i].getAnimations) return;
      var drifts = clouds[i].getAnimations();
      for (var j = 0; j < drifts.length; j++) {
        drifts[j].playbackRate = 1 + (CLOUD_RUSH - 1) * rush;
      }
    }
  }

  // Things that only need to change once the sky has come to rest.
  function settle(top) {
    var dark = state.d > 0.5;
    root.dataset.theme = dark ? 'dark' : 'light';
    root.style.colorScheme = dark ? 'dark' : 'light';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', rgb(top));
  }

  function moveTo(e, d) {
    cancelAnimationFrame(frame);
    root.dataset.theme = d > 0.5 ? 'dark' : 'light';

    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      state.e = e;
      state.d = d;
      settle(paint());
      return;
    }

    var fromE = state.e;
    var fromD = state.d;
    var start = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - start) / DURATION);
      state.e = fromE + (e - fromE) * smoothstep(0, 1, p);
      // The page changes colour in the middle, as the sun crosses the horizon.
      state.d = fromD + (d - fromD) * smoothstep(0.3, 0.8, p);
      var top = paint();
      var swell = Math.sin(Math.PI * p);
      rushClouds(swell * swell);
      if (p < 1) frame = requestAnimationFrame(step);
      else settle(top);
    })(start);
  }

  settle(paint());

  window.waqtySky = {
    isDark: function () { return root.dataset.theme === 'dark'; },
    // Switch theme. Each theme rests on the real sky when the real sky fits it,
    // so toggling twice brings you back to your own time of day.
    toggle: function () {
      var now = sunNow();
      var nowDark = now < DARK_BELOW;
      if (this.isDark()) moveTo(nowDark ? DAY_E : now, 0);
      else moveTo(nowDark ? now : NIGHT_E, 1);
      return this.isDark();
    },
    // For checking a sky by hand in the console: waqtySky.show(-0.45, 1).
    show: function (e, d) {
      cancelAnimationFrame(frame);
      state.e = e;
      state.d = d;
      settle(paint());
    },
  };
})();
