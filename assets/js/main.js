(function () {
  "use strict";

  var doc = document.documentElement;
  doc.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Header state ---------- */
  var header = document.querySelector("[data-header]");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector("[data-nav-toggle]");
  var list = document.querySelector("[data-nav-list]");
  function setNav(open) {
    if (!toggle || !list) return;
    toggle.setAttribute("aria-expanded", String(open));
    list.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (toggle && list) {
    toggle.addEventListener("click", function () {
      setNav(toggle.getAttribute("aria-expanded") !== "true");
    });
    list.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setNav(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setNav(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Hero pattern field ----------
     A sparse field of points. Lines appear only between points that are
     close — and more clearly near the cursor: the pattern becomes visible
     where attention rests. */
  var canvas = document.querySelector("[data-pattern-field]");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var points = [];
    var w = 0, h = 0, dpr = 1;
    var pointer = { x: -9999, y: -9999, active: false };
    var linkDist = 150;

    function seed() {
      var rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round((w * h) / 16000);
      count = Math.max(28, Math.min(count, 110));
      linkDist = Math.max(110, Math.min(170, w / 9));
      points = [];
      for (var i = 0; i < count; i++) {
        points.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.12,
          vy: (Math.random() - 0.5) * 0.12,
          r: Math.random() < 0.12 ? 1.8 : 1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        for (var j = i + 1; j < points.length; j++) {
          var q = points[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            var base = (1 - d / linkDist) * 0.08;
            if (pointer.active) {
              var mx = (p.x + q.x) / 2 - pointer.x;
              var my = (p.y + q.y) / 2 - pointer.y;
              var md = Math.sqrt(mx * mx + my * my);
              if (md < 220) base += (1 - md / 220) * 0.35 * (1 - d / linkDist);
            }
            ctx.strokeStyle = "rgba(138,106,69," + base.toFixed(3) + ")";
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
      }
      for (var k = 0; k < points.length; k++) {
        var pt = points[k];
        ctx.fillStyle = pt.r > 1 ? "rgba(138,106,69,0.55)" : "rgba(29,27,25,0.22)";
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function step() {
      for (var i = 0; i < points.length; i++) {
        var p = points[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
      }
      draw();
      if (running) raf = requestAnimationFrame(step);
    }

    var running = false, raf = 0;
    function start() { if (!running && !reduceMotion) { running = true; raf = requestAnimationFrame(step); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    seed(); draw();
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { seed(); draw(); }, 150);
    });
    var hero = canvas.parentElement;
    hero.addEventListener("pointermove", function (e) {
      var rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left; pointer.y = e.clientY - rect.top; pointer.active = true;
      if (reduceMotion) draw();
    });
    hero.addEventListener("pointerleave", function () { pointer.active = false; if (reduceMotion) draw(); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
      }).observe(hero);
    } else {
      start();
    }
  }

  /* ---------- Band constellation ----------
     A fixed set of points, a few of which are joined into one quiet figure. */
  var svg = document.querySelector("[data-pattern-svg]");
  if (svg) {
    var NS = "http://www.w3.org/2000/svg";
    var seedVal = 7;
    function rand() { seedVal = (seedVal * 9301 + 49297) % 233280; return seedVal / 233280; }
    var g = document.createElementNS(NS, "g");
    for (var i = 0; i < 90; i++) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", (rand() * 1200).toFixed(1));
      c.setAttribute("cy", (rand() * 600).toFixed(1));
      c.setAttribute("r", "1");
      c.setAttribute("fill", "rgba(236,230,218,0.18)");
      g.appendChild(c);
    }
    var figure = [[150, 400], [250, 372], [370, 420], [420, 510], [330, 570], [210, 552], [150, 480], [262, 470]];
    var path = document.createElementNS(NS, "polyline");
    var pts = figure.concat([figure[0]]).map(function (p) { return p.join(","); }).join(" ");
    path.setAttribute("points", pts);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "rgba(184,150,108,0.5)");
    path.setAttribute("stroke-width", "0.8");
    path.setAttribute("class", "constellation-line");
    g.appendChild(path);
    figure.forEach(function (p) {
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", p[0]); c.setAttribute("cy", p[1]); c.setAttribute("r", "2.4");
      c.setAttribute("fill", "rgba(184,150,108,0.85)");
      g.appendChild(c);
    });
    svg.appendChild(g);

    var len = 0;
    for (var n = 1; n < figure.length + 1; n++) {
      var a = figure[n - 1], b = figure[n % figure.length];
      len += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    if (!reduceMotion && "IntersectionObserver" in window) {
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.transition = "stroke-dashoffset 3.2s cubic-bezier(0.2,0.7,0.1,1)";
      var bandObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) {
          path.style.strokeDashoffset = "0";
          bandObs.disconnect();
        }
      }, { threshold: 0.3 });
      bandObs.observe(svg.parentElement);
    }
  }

  /* ---------- Contact form ----------
     Without a backend, the form composes an email in the visitor's mail
     client. Replace with a form service endpoint when available. */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector("[data-form-status]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      ["name", "email", "message"].forEach(function (name) {
        var field = form.elements[name];
        var ok = field.value.trim() !== "" && (name !== "email" || /\S+@\S+\.\S+/.test(field.value));
        field.closest(".field").classList.toggle("has-error", !ok);
        field.setAttribute("aria-invalid", String(!ok));
        if (!ok) valid = false;
      });
      if (!valid) {
        status.textContent = "Please complete the highlighted fields.";
        return;
      }
      var subject = "Enquiry — " + form.elements.name.value.trim();
      var body = form.elements.message.value.trim() +
        "\n\n—\n" + form.elements.name.value.trim() +
        "\n" + form.elements.email.value.trim() +
        "\nWriting as: " + form.elements.context.value;
      window.location.href = "mailto:hello@juneaubrey.com?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      status.textContent = "Thank you. Your email programme should now open with your message.";
    });
  }
})();
