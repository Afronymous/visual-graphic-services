(() => {
  const config = window.KASTUDIO_CONFIG || {};
  const whatsappNumber = String(config.whatsappNumber || "601125145629").replace(/\D/g, "");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.body.classList.add("loading");
  const loader = document.querySelector(".page-loader");
  const finishLoader = () => {
    loader?.classList.add("done");
    document.body.classList.remove("loading");
  };
  window.addEventListener("load", () => window.setTimeout(finishLoader, 520), { once: true });
  window.setTimeout(finishLoader, 2600);

  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  const navLinks = document.querySelectorAll(".primary-nav a");
  const setHeader = () => header?.classList.toggle("scrolled", window.scrollY > 14);
  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open");
    menuToggle.classList.toggle("active", Boolean(open));
    menuToggle.setAttribute("aria-expanded", String(Boolean(open)));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  navLinks.forEach((link) => link.addEventListener("click", () => {
    nav?.classList.remove("open");
    menuToggle?.classList.remove("active");
    menuToggle?.setAttribute("aria-expanded", "false");
  }));

  const revealElements = document.querySelectorAll(".reveal");
  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -35px" });
    revealElements.forEach((element, index) => {
      element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => element.classList.add("visible"));
  }

  const counter = document.querySelector("[data-counter]");
  if (counter) {
    const target = Number(counter.dataset.counter || 100);
    const animateCounter = () => {
      if (prefersReducedMotion) { counter.textContent = String(target); return; }
      const start = performance.now();
      const duration = 1400;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        counter.textContent = String(Math.floor(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const counterObserver = new IntersectionObserver((entries, obs) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        animateCounter();
        obs.disconnect();
      }
    });
    counterObserver.observe(counter);
  }

  const cursorGlow = document.querySelector(".cursor-glow");
  if (cursorGlow && window.matchMedia("(pointer:fine)").matches && !prefersReducedMotion) {
    window.addEventListener("pointermove", (event) => {
      cursorGlow.style.left = `${event.clientX}px`;
      cursorGlow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  const parallax = document.querySelector("[data-parallax]");
  if (parallax && !prefersReducedMotion && window.matchMedia("(min-width: 900px)").matches) {
    window.addEventListener("scroll", () => {
      const speed = Number(parallax.dataset.parallax || 0.08);
      const rect = parallax.getBoundingClientRect();
      const offset = (window.innerHeight / 2 - rect.top) * speed;
      parallax.style.transform = `translate3d(0, ${Math.max(-26, Math.min(26, offset))}px, 0)`;
    }, { passive: true });
  }

  const filterButtons = document.querySelectorAll(".filter-button");
  const projects = document.querySelectorAll(".project");
  filterButtons.forEach((button) => button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const filter = button.dataset.filter;
    projects.forEach((project) => project.classList.toggle("hidden", filter !== "all" && project.dataset.category !== filter));
  }));

  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxTitle = document.getElementById("lightbox-title");
  const lightboxClose = document.querySelector(".lightbox-close");
  const openProject = (project) => {
    if (!lightbox || !lightboxImage || !lightboxTitle) return;
    lightboxImage.src = project.dataset.lightbox || project.querySelector("img")?.src || "";
    lightboxImage.alt = project.dataset.title || "Portfolio item";
    lightboxTitle.textContent = project.dataset.title || "Portfolio item";
    if (typeof lightbox.showModal === "function") lightbox.showModal();
  };
  projects.forEach((project) => {
    const media = project.querySelector(".project-media");
    const button = project.querySelector("button");
    media?.addEventListener("click", () => openProject(project));
    button?.addEventListener("click", () => openProject(project));
  });
  const closeLightbox = () => lightbox?.close();
  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) closeLightbox(); });
  window.addEventListener("keydown", (event) => { if (event.key === "Escape" && lightbox?.open) closeLightbox(); });

  document.querySelectorAll(".whatsapp-link").forEach((link) => {
    const message = "Hi KASTUDIOPRODUCTION, I would like to discuss a project.";
    link.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  });

  const form = document.getElementById("project-form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = [
      "Hi KASTUDIOPRODUCTION, I would like to request a quotation.",
      "",
      `Name / company: ${data.get("name")}`,
      `Service: ${data.get("service")}`,
      `Deadline: ${data.get("deadline") || "Not specified"}`,
      `Budget: ${data.get("budget") || "Not specified"}`,
      "",
      "Project details:",
      String(data.get("details") || "")
    ].join("\n");
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  });

  const driveLink = document.querySelector(".drive-link");
  const drivePlaceholder = document.querySelector(".drive-placeholder");
  if (config.googleDrivePortfolioUrl && driveLink) {
    driveLink.href = config.googleDrivePortfolioUrl;
    driveLink.hidden = false;
    driveLink.target = "_blank";
    driveLink.rel = "noopener";
    if (drivePlaceholder) drivePlaceholder.hidden = true;
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
