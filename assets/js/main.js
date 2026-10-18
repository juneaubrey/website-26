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
