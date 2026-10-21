/* script.js — interactions for The Vernon Copy Center demo */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Google Sheets booking log (docs/booking-log.gs). Paste the Apps Script web app URL here;
     leave it empty and the form stays in demo mode (prepares a message, sends nothing). */
  var QUOTE_LOG = "";

  /* ---------- word-by-word headline split (aria-label keeps the full text) ---------- */
  $$(".split").forEach(function (el) {
    var i = 0;
    function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var parts = child.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            var w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
            var inner = document.createElement("span"); inner.textContent = part; inner.style.setProperty("--i", i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          child.parentNode.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== "BR") {
          walk(child);
        }
      });
    }
    walk(el);
  });

  /* ---------- reveal on scroll: only things below the first screen start hidden ---------- */
  var fold = window.innerHeight * 0.92;
  var revealables = $$(".split, .reveal, .reveal-group, .svc, .label");
  $$(".reveal-group").forEach(function (g) { Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); }); });

  function markIn(el) { el.classList.add("is-in"); }
  var hero = $(".hero__title");
  if (hero) { hero.classList.add("will-split"); requestAnimationFrame(function () { setTimeout(function () { markIn(hero); }, reduce ? 0 : 1050); }); }

  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { markIn(e.target); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(function (el) {
      if (el === hero) return;
      var top = el.getBoundingClientRect().top;
      if (top > fold) {
        if (el.classList.contains("split")) el.classList.add("will-split");
        if (el.classList.contains("reveal") || el.classList.contains("reveal-group")) el.classList.add("will-reveal");
        io.observe(el);
      } else {
        markIn(el);
      }
    });
    // safety net: never leave content hidden
    setTimeout(function () { revealables.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight) markIn(el); }); }, 2500);
  } else {
    revealables.forEach(markIn);
  }

  /* ---------- header state, scroll progress, hero drift ---------- */
  var header = $(".site-header");
  var bar = $(".progress span");
  var heroContent = $(".hero__content");
  var heroSection = $(".hero");
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.transform = "scaleX(" + (max > 0 ? y / max : 0).toFixed(4) + ")";
    if (header) header.classList.toggle("is-solid", y > (heroSection ? heroSection.offsetHeight * 0.6 : 200));
    if (heroContent && !reduce) {
      var h = heroSection.offsetHeight;
      var k = Math.min(1, Math.max(0, y / h));
      heroContent.style.transform = "translateY(" + (k * 90).toFixed(1) + "px)";
      heroContent.style.opacity = (1 - k * 1.25).toFixed(3);
    }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* current nav item */
  var navLinks = $$('.nav__list a[href^="#"]:not(.btn)');
  if ("IntersectionObserver" in window) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("is-current", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["hero", "services", "about", "visit", "contact"].forEach(function (id) { var s = document.getElementById(id); if (s) secIO.observe(s); });
  }

  /* ---------- mobile menu ---------- */
  var burger = $(".burger");
  var navList = $("#nav-list");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    header.classList.toggle("menu-open", open);
    if (open) { var first = navList.querySelector("a"); if (first) first.focus(); }
  }
  if (burger) {
    burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
    navList.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") { setMenu(false); burger.focus(); }
    });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1024) setMenu(false); });
  }

  /* ---------- cursor glow + magnetic buttons + stage tilt (fine pointers only) ---------- */
  if (finePointer && !reduce) {
    var glow = $(".cursor-glow");
    var gx = 0, gy = 0, tx = 0, ty = 0, glowOn = false;
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!glowOn) { glowOn = true; doc.classList.add("has-cursor"); gx = tx; gy = ty; loop(); }
    }, { passive: true });
    function loop() {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = "translate3d(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px,0)";
      requestAnimationFrame(loop);
    }

    $$(".magnetic").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        var dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.transform = "translate(" + (dx * 8).toFixed(1) + "px," + (dy * 6).toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });

    $$("[data-tilt]").forEach(function (stage) {
      var layers = $$(".tilt-layer", stage);
      stage.addEventListener("pointermove", function (e) {
        var r = stage.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        layers.forEach(function (l) {
          var d = parseFloat(l.getAttribute("data-depth")) || 10;
          var rot = getComputedStyle(l).getPropertyValue("--rot") || "0deg";
          l.style.transform = "translate3d(" + (x * d).toFixed(1) + "px," + (y * d).toFixed(1) + "px,0) rotate(" + rot.trim() + ") rotateX(" + (-y * 8).toFixed(2) + "deg) rotateY(" + (x * 10).toFixed(2) + "deg)";
        });
      });
      stage.addEventListener("pointerleave", function () { layers.forEach(function (l) { l.style.transform = ""; }); });
    });
  }

  /* gentle idle float for mockups */
  if (!reduce) {
    var mocks = $$(".tilt-layer");
    var t0 = performance.now();
    var stageEl = $("[data-tilt]");
    var stageVisible = false;
    if (stageEl && "IntersectionObserver" in window) new IntersectionObserver(function (e) { stageVisible = e[0].isIntersecting; }).observe(stageEl);
    (function float() {
      if (stageVisible) {
        var t = (performance.now() - t0) / 1000;
        mocks.forEach(function (m, i) {
          if (m.matches(":hover") || (stageEl && stageEl.matches(":hover"))) return;
          var rot = getComputedStyle(m).getPropertyValue("--rot").trim() || "0deg";
          m.style.transform = "translateY(" + (Math.sin(t * 0.6 + i * 1.7) * 6).toFixed(2) + "px) rotate(" + rot + ")";
        });
      }
      requestAnimationFrame(float);
    })();
  }

  /* ---------- copy buttons ---------- */
  function copyText(text, btn, label) {
    function done(ok) {
      if (!btn) return;
      btn.classList.toggle("is-done", ok);
      var span = btn.querySelector("span");
      if (span && label) { span.textContent = ok ? "Copied" : "Select and copy"; setTimeout(function () { span.textContent = label; }, 2200); }
      if (ok) setTimeout(function () { btn.classList.remove("is-done"); }, 2200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { selectFallback(); done(false); });
    } else { selectFallback(); done(false); }
    function selectFallback() {
      var target = btn && btn.closest("li") ? btn.closest("li").querySelector(".v") : $("#form-msg");
      if (!target) return;
      var range = document.createRange(); range.selectNodeContents(target);
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    }
  }
  $$(".copy-btn").forEach(function (b) { b.addEventListener("click", function () { copyText(b.getAttribute("data-copy"), b); }); });

  /* ---------- service rows preselect the form ---------- */
  var serviceSelect = $("#f-service");
  $$("[data-service]").forEach(function (a) {
    a.addEventListener("click", function () { if (serviceSelect) serviceSelect.value = a.getAttribute("data-service"); });
  });

  /* ---------- quote form: validates, logs to the booking sheet when QUOTE_LOG is set ---------- */
  var form = $("#quote-form");
  if (form) {
    if (QUOTE_LOG) {
      var notice = $(".form-card__notice"); if (notice) notice.hidden = true;
      form.querySelector(".btn--submit .btn__label").textContent = "Send my request";
      $("#form-done h3").textContent = "Thanks, your request is in";
      $("#form-done h3 + p").innerHTML = "We'll get back to you by email or phone. Here's a copy of what you sent. In a hurry? Call <strong>973-764-5655</strong>.";
    }
    var summary = $("#error-summary");
    var done = $("#form-done");
    var msgEl = $("#form-msg");
    var fields = {
      name: { el: $("#f-name"), check: function (v) { return v.trim().length >= 2 ? "" : "Enter your name."; } },
      email: { el: $("#f-email"), check: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter an email address like name@example.com."; } },
      phone: { el: $("#f-phone"), check: function (v) { var d = v.replace(/\D/g, ""); return !v.trim() || (d.length >= 10 && d.length <= 11) ? "" : "Enter a 10-digit phone number, or leave it blank."; } },
      service: { el: $("#f-service"), check: function (v) { return v ? "" : "Choose the service you need, or pick Other / Not sure yet."; } },
      details: { el: $("#f-details"), check: function (v) { return v.trim().length >= 10 ? "" : "Add a few words about the project (at least 10 characters)."; } },
      deadline: { el: $("#f-deadline"), check: function (v) {
        if (!v) return "";
        var d = new Date(v + "T23:59:59"); return d >= new Date() ? "" : "Pick a date that hasn't passed yet.";
      } }
    };
    function validate(key) {
      var f = fields[key]; var msg = f.check(f.el.value);
      var err = document.getElementById(f.el.id + "-err");
      var wrap = f.el.closest(".field");
      err.textContent = msg; wrap.classList.toggle("has-error", !!msg);
      if (msg) { f.el.setAttribute("aria-invalid", "true"); f.el.setAttribute("aria-describedby", err.id); }
      else { f.el.removeAttribute("aria-invalid"); f.el.removeAttribute("aria-describedby"); }
      return msg;
    }
    Object.keys(fields).forEach(function (k) {
      fields[k].el.addEventListener("blur", function () { if (fields[k].el.value || k === "service") validate(k); });
      fields[k].el.addEventListener("input", function () { if (fields[k].el.getAttribute("aria-invalid")) validate(k); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errors = [];
      Object.keys(fields).forEach(function (k) { var m = validate(k); if (m) errors.push({ id: fields[k].el.id, msg: m }); });
      var ul = summary.querySelector("ul");
      ul.innerHTML = "";
      if (errors.length) {
        errors.forEach(function (er) {
          var li = document.createElement("li"); var a = document.createElement("a");
          a.href = "#" + er.id; a.textContent = er.msg;
          a.addEventListener("click", function (ev) { ev.preventDefault(); document.getElementById(er.id).focus(); });
          li.appendChild(a); ul.appendChild(li);
        });
        summary.hidden = false;
        document.getElementById(errors[0].id).focus();
        return;
      }
      summary.hidden = true;
      var btn = form.querySelector(".btn--submit");
      btn.classList.add("is-loading");
      btn.querySelector(".btn__label").textContent = QUOTE_LOG ? "Sending…" : "Preparing…";
      if (QUOTE_LOG) {
        try {
          fetch(QUOTE_LOG, { method: "POST", mode: "no-cors", keepalive: true, body: new URLSearchParams({
            name: fields.name.el.value.trim(), email: fields.email.el.value.trim(), phone: fields.phone.el.value.trim(),
            service: fields.service.el.value, deadline: fields.deadline.el.value, details: fields.details.el.value.trim(),
            website: (form.elements.website && form.elements.website.value) || "", page: location.href
          }) }).catch(function () {});
        } catch (err) { /* the copy and email fallback below still works */ }
      }
      setTimeout(function () {
        var v = function (k) { return fields[k].el.value.trim(); };
        var lines = [
          "Quote request for The Vernon Copy Center",
          "",
          "Name: " + v("name"),
          "Email: " + v("email"),
          v("phone") ? "Phone: " + v("phone") : null,
          "Service: " + v("service"),
          v("deadline") ? "Needed by: " + new Date(v("deadline") + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : null,
          "",
          "Project details:",
          v("details")
        ].filter(function (l) { return l !== null; });
        var text = lines.join("\n");
        msgEl.textContent = text;
        $("#mail-msg").href = "mailto:copycenter@warwick.net?subject=" + encodeURIComponent("Quote request: " + v("service")) + "&body=" + encodeURIComponent(text);
        form.hidden = true;
        done.hidden = false;
        done.focus();
        btn.classList.remove("is-loading");
        btn.querySelector(".btn__label").textContent = QUOTE_LOG ? "Send my request" : "Prepare my request";
      }, reduce ? 0 : 700);
    });

    var copyMsg = $("#copy-msg");
    copyMsg.addEventListener("click", function () { copyText(msgEl.textContent, copyMsg, "Copy message"); });
    $("#form-reset").addEventListener("click", function () {
      form.reset(); done.hidden = true; form.hidden = false;
      Object.keys(fields).forEach(function (k) { fields[k].el.removeAttribute("aria-invalid"); var w = fields[k].el.closest(".field"); w.classList.remove("has-error"); document.getElementById(fields[k].el.id + "-err").textContent = ""; });
      fields.name.el.focus();
    });
  }

  /* ---------- hours: highlight today (America/New_York) ---------- */
  (function () {
    var HOURS = { 1: [9, 17], 2: [10, 18], 3: [9, 17], 4: [9, 17], 5: [9, 17] };
    var now;
    try {
      var parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
      var map = {}; parts.forEach(function (p) { map[p.type] = p.value; });
      var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      now = { day: days[map.weekday], h: (parseInt(map.hour, 10) % 24) + parseInt(map.minute, 10) / 60 };
    } catch (e) { var d = new Date(); now = { day: d.getDay(), h: d.getHours() + d.getMinutes() / 60 }; }
    var row = document.querySelector('.hours__table tr[data-day="' + now.day + '"]');
    if (row) row.classList.add("is-today");
    var badge = $("#hours-today");
    if (!badge) return;
    var hrs = HOURS[now.day];
    if (hrs && now.h >= hrs[0] && now.h < hrs[1]) { badge.textContent = "Open now"; badge.classList.add("is-open"); }
    else badge.textContent = "Closed now";
  })();

  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();
})();
