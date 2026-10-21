/* bg.js — live pink swooshes on the white page, plus WebGL "ink in water" panels (no libraries).
   One fixed full-screen canvas plus optional palette variants for feature panels.
   Half resolution, DPR capped at 1.5, pauses when hidden/off screen, single still frame for reduced motion. */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var VERT = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";

  var FRAG = [
    "precision mediump float;",
    "uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uScroll; uniform float uDim;",
    "uniform vec3 uBase; uniform vec3 uMid; uniform vec3 uAcc; uniform vec3 uAcc2; uniform float uFlare;",
    "float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }",
    "float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);",
    "  float a = hash(i), b = hash(i + vec2(1.0, 0.0)), c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));",
    "  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y); }",
    "float fbm(vec2 p){ float v = 0.0, a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);",
    "  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; } return v; }",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / uRes;",
    "  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;",
    "  p += uMouse * 0.05;",
    "  float t = uTime * 0.03;",
    "  vec2 q = vec2(fbm(p * 1.5 + vec2(0.0, t)), fbm(p * 1.5 + vec2(5.2, 1.3) - t));",
    "  vec2 r = vec2(fbm(p * 1.3 + 3.0 * q + vec2(1.7, 9.2) + t * 1.3), fbm(p * 1.3 + 3.0 * q + vec2(8.3, 2.8) - t * 1.1));",
    "  float f = fbm(p * 1.2 + 3.4 * r);",
    "  float s = sin(clamp(uScroll, 0.0, 1.0) * 3.14159);",
    "  vec3 acc = mix(uAcc, uAcc2, s * 0.85);",
    "  vec3 col = mix(uBase, uMid, smoothstep(0.25, 0.85, f));",
    "  col = mix(col, acc, smoothstep(0.55, 1.05, f * f * 1.7 + r.x * 0.22) * 0.6);",
    "  col += acc * pow(smoothstep(0.55, 0.95, r.y), 3.0) * 0.18;",
    /* diagonal light streak */
    "  float d = dot(p, normalize(vec2(1.0, -0.62))) + sin(uTime * 0.045) * 0.9;",
    "  col += acc * 0.16 * exp(-pow(d * 2.6, 2.0)) + vec3(0.85, 0.93, 1.0) * 0.035 * exp(-pow(d * 9.0, 2.0));",
    /* drifting lens flare */
    "  vec2 fp = vec2(0.55 * sin(uTime * 0.027), 0.22 + 0.14 * cos(uTime * 0.035)) - uMouse * 0.08;",
    "  float fl = 0.012 / (length(p - fp) + 0.03);",
    "  col += (acc * fl * 0.45 + vec3(1.0) * fl * fl * 0.04) * uFlare;",
    /* vignette, dim, soft ceiling so text contrast holds at the brightest point */
    "  col *= 1.0 - 0.6 * pow(length(uv - 0.5) * 1.3, 2.0);",
    "  col *= uDim;",
    "  col = min(col, vec3(1.0));",
    /* animated film grain */
    "  col += (hash(gl_FragCoord.xy + fract(uTime * 0.37) * 311.0) - 0.5) * 0.03;",
    "  gl_FragColor = vec4(max(col, 0.0), 1.0);",
    "}"
  ].join("\n");

  function hex(h) { var n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }

  var PALETTES = {
    stage: { base: "#0b47b0", mid: "#2f72ea", acc: "#f0168c", acc2: "#f0168c", flare: 0.7 },
    cta:   { base: "#0b47b0", mid: "#2f72ea", acc: "#ff3fa4", acc2: "#f0168c", flare: 0.9 }
  };

  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  var scroll = 0;
  var start = performance.now();

  function Shader(canvas, paletteName, opts) {
    this.canvas = canvas;
    this.opts = opts || {};
    this.pal = PALETTES[paletteName];
    this.visible = true;
    this.ok = this.init();
  }

  Shader.prototype.init = function () {
    var gl;
    try { gl = this.canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
    if (!gl) return false;
    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return false;
    var prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false;
    gl.useProgram(prog);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var u = {};
    ["uRes", "uTime", "uMouse", "uScroll", "uDim", "uBase", "uMid", "uAcc", "uAcc2", "uFlare"].forEach(function (n) { u[n] = gl.getUniformLocation(prog, n); });
    gl.uniform3fv(u.uBase, hex(this.pal.base)); gl.uniform3fv(u.uMid, hex(this.pal.mid));
    gl.uniform3fv(u.uAcc, hex(this.pal.acc)); gl.uniform3fv(u.uAcc2, hex(this.pal.acc2));
    gl.uniform1f(u.uFlare, this.pal.flare);
    this.gl = gl; this.u = u;
    this.resize();
    return true;
  };

  Shader.prototype.resize = function () {
    if (!this.gl) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var rect = this.canvas.getBoundingClientRect();
    var w = Math.max(2, Math.round(rect.width * dpr * 0.5));
    var h = Math.max(2, Math.round(rect.height * dpr * 0.5));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w; this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
    this.gl.uniform2f(this.u.uRes, w, h);
  };

  Shader.prototype.draw = function (time) {
    var gl = this.gl, u = this.u;
    gl.uniform1f(u.uTime, time + (this.opts.offset || 0));
    gl.uniform2f(u.uMouse, mouse.x, mouse.y);
    gl.uniform1f(u.uScroll, this.opts.fixedScroll != null ? this.opts.fixedScroll : scroll);
    var dim = this.opts.dim != null ? this.opts.dim : dimFor(scroll);
    gl.uniform1f(u.uDim, dim);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!this.shown) { this.shown = true; this.canvas.classList.add("is-ready"); }
  };

  function dimFor() { return 1.0; }

  /* two pink swooshes across the white page, like the curves on the business card.
     Each is a cubic bezier whose control points breathe slowly and drift with scroll. */
  function swoosh() {
    var svg = document.getElementById("swoosh");
    if (!svg) return;
    var a = svg.querySelector(".swoosh__a"), b = svg.querySelector(".swoosh__b");
    var W = 0, H = 0;
    function size() { W = window.innerWidth; H = window.innerHeight; svg.setAttribute("viewBox", "0 0 " + W + " " + H); }
    function curve(t, y0, y1, c1, c2, amp, ph, sh) {
      var wob = function (f, p) { return Math.sin(t * f + ph + p) * amp; };
      return "M" + (-0.06 * W) + " " + (H * y0 + sh) +
        " C" + (W * 0.3) + " " + (H * c1 + wob(0.33, 0) + sh) + " " + (W * 0.66) + " " + (H * c2 + wob(0.27, 2.1) + sh) +
        " " + (W * 1.06) + " " + (H * y1 + wob(0.21, 4.2) * 0.5 + sh);
    }
    var t0 = performance.now();
    function render() {
      var t = reduce ? 3 : (performance.now() - t0) / 1000;
      var y = window.scrollY || 0, sh = -Math.min(y, H) * 0.12;
      /* full strength over the hero, quieter behind reading content */
      svg.style.opacity = (1 - 0.55 * Math.min(1, y / (H * 0.8))).toFixed(3);
      var amp = Math.min(H, W) * 0.035;
      var mobile = W < 768;
      /* A: thick, rises from lower left of the header area to the top right */
      a.setAttribute("d", curve(t, mobile ? 0.30 : 0.38, 0.0, mobile ? 0.36 : 0.30, 0.02, amp * (mobile ? 1 : 0.6), 0, sh));
      /* B: thin, sweeps low across the bottom of the screen, opposite curvature */
      b.setAttribute("d", curve(t * 0.85, 0.80, mobile ? 0.97 : 0.90, 1.02, 0.70, amp * 1.2, 1.3, sh * 0.6));
    }
    size(); render();
    window.addEventListener("resize", function () { size(); render(); });
    if (reduce) { window.addEventListener("scroll", render, { passive: true }); return; }
    (function loop() { if (!document.hidden) render(); requestAnimationFrame(loop); })();
  }

  var shaders = [];
  var running = false;

  function frame() {
    if (!running) return;
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    var t = (performance.now() - start) / 1000;
    for (var i = 0; i < shaders.length; i++) if (shaders[i].visible) shaders[i].draw(t);
    requestAnimationFrame(frame);
  }

  function setRunning(on) {
    if (reduce) return;
    if (on && !running) { running = true; requestAnimationFrame(frame); }
    else if (!on) running = false;
  }

  function boot() {
    swoosh();
    var panels = document.querySelectorAll("canvas[data-shader]");
    Array.prototype.forEach.call(panels, function (c, i) {
      var name = c.getAttribute("data-shader");
      var s = new Shader(c, name, { dim: 1.0, fixedScroll: 0.0, offset: 40 + i * 25 });
      if (!s.ok) return;
      s.visible = false;
      shaders.push(s);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { s.visible = e.isIntersecting; if (reduce && e.isIntersecting) s.draw(12); });
        }, { rootMargin: "120px" }).observe(c);
      } else { s.visible = true; }
    });

    if (!shaders.length) return; // panels keep their CSS gradient

    window.addEventListener("resize", function () {
      shaders.forEach(function (s) { s.resize(); });
      if (reduce) shaders.forEach(function (s) { s.draw(12); });
    });
    window.addEventListener("scroll", function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      scroll = max > 0 ? (window.scrollY || 0) / max : 0;
    }, { passive: true });
    if (window.matchMedia("(pointer: fine)").matches) {
      window.addEventListener("pointermove", function (e) {
        mouse.tx = (e.clientX / window.innerWidth - 0.5);
        mouse.ty = -(e.clientY / window.innerHeight - 0.5);
      }, { passive: true });
    }
    document.addEventListener("visibilitychange", function () { setRunning(!document.hidden); });

    if (reduce) { shaders.forEach(function (s) { s.draw(12); }); }
    else setRunning(true);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
