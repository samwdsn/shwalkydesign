/* ==========================================================================
   Prerequisites — shared setup, navigation and resizing
   ========================================================================== */

document.querySelectorAll(".currentYear").forEach((year) => {
  year.textContent = new Date().getFullYear();
});

/* Best-effort device details; browser privacy settings can limit accuracy. */
function getFormDeviceDetails() {
  const ua = navigator.userAgent || "";
  const isIPad = /iPad/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isIOS = isIPad || /iPhone|iPod/i.test(ua);
  const device = isIPad ? "Tablet (iPad)"
    : /iPhone/i.test(ua) ? "Mobile (iPhone)"
    : /Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua)) ? "Tablet"
    : /Mobile|iPod/i.test(ua) ? "Mobile"
    : "Desktop";
  const os = isIOS ? "iOS / iPadOS"
    : /Android/i.test(ua) ? "Android"
    : /Windows/i.test(ua) ? "Windows"
    : /CrOS/i.test(ua) ? "ChromeOS"
    : /Macintosh|Mac OS X/i.test(ua) ? "macOS"
    : /Linux/i.test(ua) ? "Linux"
    : "Unknown OS";
  const browser = /Edg(?:e|A|iOS)?\//i.test(ua) ? "Edge"
    : /OPR\/|OPiOS\/|Opera/i.test(ua) ? "Opera"
    : /SamsungBrowser\//i.test(ua) ? "Samsung Internet"
    : /Firefox\/|FxiOS\//i.test(ua) ? "Firefox"
    : /Chrome\/|CriOS\//i.test(ua) ? "Chrome"
    : /Safari\//i.test(ua) ? "Safari"
    : "Unknown browser";
  return `${device} / ${os} / ${browser}`;
}

/* Include the submitting page, without query strings or URL fragments. */
document.querySelectorAll('form[action^="https://formsubmit.co/"]').forEach((form) => {
  let sourceUrl = form.querySelector('input[name="_url"]');
  if (!sourceUrl) {
    sourceUrl = document.createElement("input");
    sourceUrl.type = "hidden";
    sourceUrl.name = "_url";
    form.append(sourceUrl);
  }

  let pageUrl = form.querySelector('input[name="page_url"]');
  if (!pageUrl) {
    pageUrl = document.createElement("input");
    pageUrl.type = "hidden";
    pageUrl.name = "page_url";
    form.append(pageUrl);
  }

  let device = form.querySelector('input[name="device"]');
  if (!device) {
    device = document.createElement("input");
    device.type = "hidden";
    device.name = "device";
    form.append(device);
  }

  const updateSourceUrl = () => {
    const url = window.location.origin + window.location.pathname;
    sourceUrl.value = url;
    pageUrl.value = url;
    device.value = getFormDeviceDetails();
  };
  updateSourceUrl();
  form.addEventListener("submit", updateSourceUrl);
});

if (typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);
if (typeof SplitText !== "undefined") gsap.registerPlugin(SplitText);

if (typeof ScrollTrigger !== "undefined") {
  ScrollTrigger.config({ ignoreMobileResize: true });
}

const lenis = typeof Lenis !== "undefined" ? new Lenis() : null;

if (lenis) {
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

}

let resizeTimer;
function refreshPageLayout() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    lenis?.resize();
    if (typeof ScrollTrigger !== "undefined") ScrollTrigger.refresh();
  }, 150);
}

window.addEventListener("resize", refreshPageLayout);
document.fonts.addEventListener("loadingdone", refreshPageLayout);

/* Move images inside their clipped frames, without moving captions or layout. */
function initImageParallax(selector, reverseSelector, amount) {
  document.querySelectorAll(selector).forEach((image) => {
    const frame = image.parentElement;
    const direction = reverseSelector && image.closest(reverseSelector) ? -1 : 1;
    const scale = Math.max(1.24, 1 + (amount * 2 + 4) / 100);
    gsap.fromTo(image,
      { yPercent: -amount * direction, scale },
      {
        yPercent: amount * direction,
        scale,
        ease: "none",
        scrollTrigger: {
          trigger: frame,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });
}

/* Burger navigation — shared by every page. */
const burgerButton = document.querySelector(".BurgerButton");
const burgerMenu = document.querySelector(".BurgerMenu");

if (burgerButton && burgerMenu) {
  const burgerButtonHome = document.createComment("Burger button position");
  burgerButton.before(burgerButtonHome);
  let burgerIsClosing = false;

  function closeBurgerMenu() {
    if (burgerIsClosing || !burgerMenu.open) return;
    burgerIsClosing = true;
    burgerButton.classList.remove("is-open");
    gsap.to(burgerMenu, {
      clipPath: "inset(0 0 0 100%)",
      duration: 0.5,
      ease: "power3.inOut",
      overwrite: true,
      onComplete: () => burgerMenu.close(),
    });
  }

  burgerButton.addEventListener("click", () => {
    if (burgerMenu.open) {
      closeBurgerMenu();
      return;
    }

    burgerMenu.prepend(burgerButton);
    gsap.set(burgerMenu, { clipPath: "inset(0 0 0 100%)" });
    burgerMenu.showModal();
    gsap.to(burgerMenu, {
      clipPath: "inset(0 0 0 0%)",
      duration: 0.7,
      ease: "power3.inOut",
      overwrite: true,
    });
    burgerButton.classList.add("is-open");
    burgerButton.setAttribute("aria-expanded", "true");
    burgerButton.setAttribute("aria-label", "Close menu");
    document.documentElement.style.overflow = "hidden";
    lenis?.stop();
    burgerButton.focus({ preventScroll: true });
  });

  burgerMenu.addEventListener("close", () => {
    burgerIsClosing = false;
    burgerButtonHome.after(burgerButton);
    burgerButton.classList.remove("is-open");
    burgerButton.setAttribute("aria-expanded", "false");
    burgerButton.setAttribute("aria-label", "Open menu");
    document.documentElement.style.overflow = "";
    lenis?.start();
    burgerButton.focus({ preventScroll: true });
  });

  burgerMenu.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeBurgerMenu();
  });

  burgerMenu.addEventListener("click", (event) => {
    if (!event.target.closest("a, .BurgerButton")) closeBurgerMenu();
  });

  burgerMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeBurgerMenu);
  });
}

/* ==========================================================================
   Home — splash and below-the-fold scroll animation
   ========================================================================== */

function initHomeSplash() {
  const svgFrames = gsap.utils.toArray(".svgFrame");
  const svgFrameSequence = [0, 1, 0, 2, 0, 3, 0];
  const layoutDuration = 3 / 24;

  function showSvgFrame(frameIndex) {
    gsap.set(svgFrames, { visibility: "hidden" });
    gsap.set(svgFrames[frameIndex], { visibility: "visible" });
  }

  if (svgFrames.length) {
    const svgAnimation = gsap.timeline({ delay: 0.5 });

    svgFrameSequence.forEach((frameIndex, index) => {
      svgAnimation.call(
        () => showSvgFrame(frameIndex),
        null,
        index * layoutDuration,
      );
    });
  }

  /* Below-the-fold scroll animation */
  let frameReset;

  function updateScrollFrames(self) {
    const sequenceIndex = Math.min(
      svgFrameSequence.length - 1,
      Math.floor(self.progress * svgFrameSequence.length),
    );

    showSvgFrame(svgFrameSequence[sequenceIndex]);
    frameReset?.kill();
    frameReset = gsap.delayedCall(0.1, () => showSvgFrame(0));
  }

  // Keep the scroll position when switching between mobile and desktop.
  const splashMobileQuery = window.matchMedia("(width <= 640px)");
  let splashWasMobile = splashMobileQuery.matches;
  let breakpointScroll = null;

  gsap.addEventListener("matchMediaInit", () => {
    if (splashMobileQuery.matches === splashWasMobile) return;
    breakpointScroll ??= window.scrollY;
    splashWasMobile = splashMobileQuery.matches;
  });

  gsap.addEventListener("matchMedia", () => {
    if (breakpointScroll === null) return;
    lenis.resize();
    lenis.scrollTo(breakpointScroll, { immediate: true, force: true });
    breakpointScroll = null;
    ScrollTrigger.update();
  });

  const btfBreakpoints = gsap.matchMedia();

  btfBreakpoints.add(
    {
      mobile: "(width <= 640px)",
      desktop: "(width > 640px)",
    },
    (context) => {
      const settings = context.conditions.mobile
        ? {
            // Mobile settings
            width: "100%",
            start: "top bottom",
            end: "top top-=1400",
            scrub: true,
            svgParallaxY: -0.6,
            copyParallaxY: -0.3,
            parallaxStart: "top top",
            parallaxEnd: "bottom bottom",
            parallaxScrub: true,
          }
        : {
            // Desktop settings
            width: "100%",
            start: "top bottom",
            end: "top top-=400",
            scrub: true,
            svgParallaxY: -0.3,
            copyParallaxY: -0.3,
            parallaxStart: "top top",
            parallaxEnd: "bottom bottom",
            parallaxScrub: true,
          };

      gsap
        .timeline({
          defaults: { duration: 1, ease: "none" },
          scrollTrigger: {
            trigger: ".splashParallax",
            start: settings.parallaxStart,
            end: settings.parallaxEnd,
            scrub: settings.parallaxScrub,
            invalidateOnRefresh: true,
          },
        })
        .to(
          ".splashSVGContainer",
          {
            y: () => window.innerHeight * settings.svgParallaxY,
          },
          0,
        )
        .to(
          ".splashNav, .splashCopyContainer",
          {
            y: () => window.innerHeight * settings.copyParallaxY,
          },
          0,
        );

      gsap.to(".mainContentBTF", {
        width: settings.width,
        ease: "none",
        scrollTrigger: {
          trigger: ".belowTheFoldSection",
          start: settings.start,
          end: settings.end,
          scrub: settings.scrub,
          invalidateOnRefresh: true,
          onUpdate: updateScrollFrames,
        },
      });

      return () => {
        frameReset?.kill();
        showSvgFrame(0);
      };
    },
  );

  // Run the intro only after the other scroll animations are ready.
  return function revealHomeSplash() {
    /* Page-nav logo */
    gsap.from(".pageNavLogoMark, .pageNavLogoType", {
      opacity: 0,
      delay: 0.25,
      duration: 2,
      stagger: 0.2,
      ease: "power3.inout",
    });

    /* Splash-nav items */
    gsap.from(".splashNav > *", {
      opacity: 0,
      y: 20,
      stagger: 0.5,
      delay: 1.75,
      duration: 1,
      ease: "power3.inout",
    });

    /* Main SVG followed by the supporting copy */
    const splashReveal = gsap.timeline({
      delay: 0.5,
      defaults: {
        ease: "power2.inout",
      },
    });

    splashReveal
      .from(".splashSVGContainer", {
        opacity: 0,
        duration: 0.5,
      })
      .from(
        ".revealWord",
        {
          opacity: 0,
          y: 20,
          duration: 1.2,
          stagger: 0.2,
        },
        "-=.5",
      )
      .from(
        ".btfVideo",
        {
          opacity: 0,
          duration: 1,
          ease: "power3.inout",
        },
        "-=.8",
      );
  };
}

/* ==========================================================================
   Home — other animations
   ========================================================================== */

function initHomeAnimations() {
  /* Below-the-fold text reveals */
  const btfTextReveal = gsap.timeline({
    defaults: {
      opacity: 0,
      y: 20,
      ease: "power3.inout",
    },
    scrollTrigger: {
      trigger: ".headingBTFContainer",
      start: "top 85%",
      once: true,
    },
  });

  btfTextReveal
    .from(".headingBTFWord", {
      duration: 0.8,
      stagger: 0.2,
    })
    .from(
      ".paragraphBTF",
      {
        duration: 1.5,
      },
      "-=0.8",
    );
}

/* ==========================================================================
   Home — portfolio previews
   ========================================================================== */

function initHomePortfolio() {
  /* Fade each category tag over the last 100px of its sticky range. */
  gsap.utils.toArray(".Pfol_SectionTab").forEach((tag) => {
    const unpinPosition = () =>
      parseFloat(getComputedStyle(tag).top) + tag.offsetHeight;

    gsap.to(tag, {
      opacity: 0,
      ease: "none",
      scrollTrigger: {
        trigger: tag.closest(".PfolMAIN"),
        start: () => `bottom ${unpinPosition() + 100}px`,
        end: () => `bottom ${unpinPosition()}px`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });

  /* Portfolio preview */
  const portfolioSection = document.querySelector(".PortfolioSection");
  const projects = gsap.utils.toArray(".Pfol_ProjectHeader");
  const portfolioPreview = document.querySelector(".PreviewImage");

  if (portfolioSection && portfolioPreview && projects.length) {
    let activeHover = null;
    let activeScroll = null;
    let portfolioInView = false;

    function updatePortfolioPreview() {
      const project = activeHover || activeScroll;

      if (project) {
        portfolioPreview.style.backgroundImage = `url("${project.dataset.image}")`;
      }

      portfolioPreview.classList.toggle(
        "visible",
        Boolean(activeHover || (portfolioInView && activeScroll)),
      );
    }

    const previewBreakpoints = gsap.matchMedia();

    previewBreakpoints.add(
      "(hover: hover) and (pointer: fine) and (width > 1024px)",
      () => {
        const hoverHandlers = projects.map((project) => {
          const enter = () => {
            activeHover = project;
            updatePortfolioPreview();
          };
          const leave = () => {
            activeHover = null;
            updatePortfolioPreview();
          };

          project.addEventListener("mouseenter", enter);
          project.addEventListener("mouseleave", leave);
          return { project, enter, leave };
        });

        gsap.set(portfolioPreview, {
          x: 0,
          y: 0,
          xPercent: -50,
          yPercent: -50,
        });
        const moveX = gsap.quickTo(portfolioPreview, "x", {
          duration: 0.6,
          ease: "power3.out",
        });
        const moveY = gsap.quickTo(portfolioPreview, "y", {
          duration: 0.6,
          ease: "power3.out",
        });

        function movePreview(event) {
          moveX((event.clientX - window.innerWidth / 2) * 0.3);
          moveY((event.clientY - window.innerHeight / 2) * 0.3);
        }

        window.addEventListener("pointermove", movePreview);

        return () => {
          window.removeEventListener("pointermove", movePreview);
          hoverHandlers.forEach(({ project, enter, leave }) => {
            project.removeEventListener("mouseenter", enter);
            project.removeEventListener("mouseleave", leave);
          });
          activeHover = null;
          updatePortfolioPreview();
        };
      },
    );

    ScrollTrigger.create({
      trigger: portfolioSection,
      start: "top 45%",
      end: "bottom 57.5%",
      onToggle: (self) => {
        portfolioInView = self.isActive;
        updatePortfolioPreview();
      },
    });

    projects.forEach((project) => {
      ScrollTrigger.create({
        trigger: project,
        start: "top 45%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (!self.isActive) return;
          activeScroll = project;
          updatePortfolioPreview();
        },
      });

      const image = new Image();
      image.src = project.dataset.image;
    });
  }
}

/* ==========================================================================
   Home — footer reveal (also reused on the portfolio page)
   ========================================================================== */

function initFooterReveal() {
  /* Footer word reveal*/
  const footerHeading = document.querySelector(".FooterGiT h2");

  if (footerHeading) {
    const footerReveal = gsap.timeline({ paused: true });

    footerReveal
      .from(".FooterWord", {
        autoAlpha: 0,
        y: 20,
        duration: 1,
        stagger: 0.2,
        ease: "power3.inout",
      })
      .from(
        ".FooterArrow",
        {
          autoAlpha: 0,
          y: 20,
          duration: 0.8,
          ease: "power3.inout",
        },
        "-=0.8",
      );

    const footerObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        footerReveal.play();
        footerObserver.disconnect();
      },
      { rootMargin: "0px 0px -25% 0px" },
    );

    footerObserver.observe(footerHeading);
  }
}

/* ==========================================================================
   Portfolio page — splash, content reveals and project previews
   ========================================================================== */

function initPortfolioPage() {
  /* Both words switch together: 1 → 2 → 1 → 3 → 1. */
  const portfolioFrames = gsap.utils.toArray(".portfolioSplashFrame");
  const portfolioFrameSequence = [0, 1, 0, 2, 0];
  const portfolioFrameDuration = 3 / 24;
  let portfolioFrameReset;
  let portfolioScrollStarted = false;
  let portfolioLastScroll = window.scrollY;

  function showPortfolioFrame(frameIndex) {
    portfolioFrames.forEach((frame) => {
      frame.classList.toggle(
        "is-active",
        Number(frame.dataset.frame) === frameIndex,
      );
    });
  }

  const portfolioFrameAnimation = gsap.timeline({ paused: true });
  portfolioFrameSequence.forEach((frameIndex, index) => {
    portfolioFrameAnimation.call(
      () => showPortfolioFrame(frameIndex),
      null,
      index * portfolioFrameDuration,
    );
  });

  const portfolioPreview = document.querySelector(".PreviewImage");
  const projects = gsap.utils.toArray(
    ".portfolioProjectList .Pfol_ProjectHeader",
  );
  let activeHover = null;
  let activeScroll = null;
  let activeList = null;

  function updatePortfolioPreview() {
    const project =
      activeHover || (activeList?.contains(activeScroll) ? activeScroll : null);
    if (project)
      portfolioPreview.style.backgroundImage = `url("${project.dataset.image}")`;
    portfolioPreview.classList.toggle("visible", Boolean(project));
  }

  /* Each list controls the preview separately, so it hides between categories. */
  document.querySelectorAll(".portfolioProjectList").forEach((list) => {
    ScrollTrigger.create({
      trigger: list,
      start: "top 45%",
      end: "bottom 57.5%",
      onToggle: (self) => {
        if (self.isActive) {
          activeList = list;
          const rows = list.querySelectorAll(".Pfol_ProjectHeader");
          activeScroll = self.direction < 0 ? rows[rows.length - 1] : rows[0];
        } else if (activeList === list) {
          activeList = null;
        }
        updatePortfolioPreview();
      },
    });
  });

  projects.forEach((project) => {
    ScrollTrigger.create({
      trigger: project,
      start: "top 45%",
      end: "bottom 50%",
      onToggle: (self) => {
        if (!self.isActive) return;
        activeScroll = project;
        updatePortfolioPreview();
      },
    });
    const image = new Image();
    image.src = project.dataset.image;
  });

  const portfolioBreakpoints = gsap.matchMedia();

  portfolioBreakpoints.add(
    "(hover: hover) and (pointer: fine) and (width > 768px)",
    () => {
      const splashImage = document.querySelector(".portfolioSplashImage");
      if (!splashImage) return;
      const moveX = gsap.quickTo(splashImage, "x", {
        duration: 0.5,
        ease: "power3.out",
      });
      const moveY = gsap.quickTo(splashImage, "y", {
        duration: 0.6,
        ease: "power3.out",
      });
      const moveSplash = (event) => {
        moveX((event.clientX - innerWidth / 2) * 0.15);
        moveY((event.clientY - innerHeight / 2) * 0.15);
      };
      window.addEventListener("pointermove", moveSplash);
      return () => window.removeEventListener("pointermove", moveSplash);
    },
  );

  portfolioBreakpoints.add(
    "(hover: hover) and (pointer: fine) and (width > 1024px)",
    () => {
      gsap.set(portfolioPreview, { x: 0, y: 0, xPercent: -50, yPercent: -50 });
      const moveX = gsap.quickTo(portfolioPreview, "x", {
        duration: 0.6,
        ease: "power3.out",
      });
      const moveY = gsap.quickTo(portfolioPreview, "y", {
        duration: 0.6,
        ease: "power3.out",
      });
      const movePreview = (event) => {
        moveX((event.clientX - innerWidth / 2) * 0.3);
        moveY((event.clientY - innerHeight / 2) * 0.3);
      };
      const handlers = projects.map((project) => {
        const enter = () => {
          activeHover = project;
          updatePortfolioPreview();
        };
        const leave = () => {
          activeHover = null;
          updatePortfolioPreview();
        };
        project.addEventListener("mouseenter", enter);
        project.addEventListener("mouseleave", leave);
        return { project, enter, leave };
      });
      window.addEventListener("pointermove", movePreview);
      return () => {
        window.removeEventListener("pointermove", movePreview);
        handlers.forEach(({ project, enter, leave }) => {
          project.removeEventListener("mouseenter", enter);
          project.removeEventListener("mouseleave", leave);
        });
        activeHover = null;
        updatePortfolioPreview();
      };
    },
  );

  /* Sticky splash — content scrolls over it, like the homepage. */
  gsap.to(".portfolioSplash", {
    y: () => -innerHeight * 0.25,
    ease: "none",
    scrollTrigger: {
      trigger: ".portfolioPage main",
      start: "top top",
      end: () => `+=${innerHeight}`,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  /* Same extended scroll range and idle reset as the homepage. */
  ScrollTrigger.create({
    trigger: ".portfolioCategory",
    start: "top bottom",
    end: () => `top top-=${innerWidth <= 768 ? 1400 : 400}`,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const scroll = self.scroll();
      if (scroll === portfolioLastScroll) return;
      portfolioLastScroll = scroll;
      if (!self.isActive && self.progress === 0) return;
      portfolioScrollStarted = true;
      portfolioFrameAnimation.pause();
      const sequenceIndex = Math.min(
        portfolioFrameSequence.length - 1,
        Math.floor(self.progress * portfolioFrameSequence.length),
      );
      showPortfolioFrame(portfolioFrameSequence[sequenceIndex]);
      portfolioFrameReset?.kill();
      portfolioFrameReset = gsap.delayedCall(0.1, () => showPortfolioFrame(0));
    },
  });

  return window.pageFontsReady.then(() => {
    /* Web27-style content reveals — never target the project rows. */
    portfolioBreakpoints.add(
      { mobile: "(width <= 768px)", desktop: "(width > 768px)" },
      (context) => {
        initImageParallax(
          ".portfolioFeatureMedia img",
          ".portfolioFeatureWide",
          context.conditions.mobile ? 10 : 6,
        );
      },
    );
    document.querySelectorAll(".portfolioFeature").forEach((section, index) => {
      const copy = section.querySelector(".portfolioFeatureCopy");

      SplitText.create(copy.querySelector("h2"), {
        type: "lines",
        linesClass: "portfolioRevealLine",
        autoSplit: true,
        onSplit(self) {
          const reveal = gsap.timeline({
            scrollTrigger: {
              trigger: copy,
              start: "top 80%",
              once: true,
            },
          });

          reveal
            .from(
              copy.querySelector(".portfolioFeatureTag"),
              {
                autoAlpha: 0,
                duration: 0.3,
              },
              0,
            )
            .from(
              self.lines,
              {
                autoAlpha: 0,
                y: 50,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
              },
              0.15,
            )
            .from(
              copy.querySelector("p:last-child"),
              {
                autoAlpha: 0,
                y: 25,
                duration: 1,
                ease: "power3.out",
              },
              0.4,
            );

          return reveal;
        },
      });

      gsap.from(section.querySelectorAll("figure"), {
        autoAlpha: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",
        scrollTrigger: index === 0 ? undefined : {
          trigger: section,
          start: "top 85%",
          once: true,
        },
      });
    });

    ScrollTrigger.refresh();

    /* Create the intro last so scroll setup doesn't reset its starting states. */
    const portfolioSplashReveal = gsap.timeline({ delay: 0.25 });
    portfolioSplashReveal
      .from(".portfolioSplashTitle > span:first-child", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.inout",
      })

      .from(
        ".portfolioSplashTitle > span:last-child",
        {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: "power2.inout",
        },
        "-=0.6",
      );

    if (document.querySelector(".portfolioSplashImage")) {
      portfolioSplashReveal.from(
        ".portfolioSplashImage",
        {
          opacity: 0,
          duration: 0.6,
        },
        "-=0.6",
      );
    }

    // Match the homepage's delay, but measure it from the visible reveal.
    portfolioSplashReveal.call(
      () => {
        if (!portfolioScrollStarted) portfolioFrameAnimation.play(0);
      },
      null,
      0.2,
    );
  });
}

/* ==========================================================================
   Case-study pages
   ========================================================================== */

function initCaseStudyPage() {
  return window.pageFontsReady.then(() => {
    initImageParallax(".caseStudyImage01 img", null, 12);
    document.querySelectorAll(".caseStudyCopy").forEach((copy) => {
      gsap.from(copy.children, {
        autoAlpha: 0,
        y: 25,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: copy,
          start: "top 85%",
          once: true,
        },
      });
    });

    document.querySelectorAll(".caseStudyGallery figure").forEach((image, index) => {
      gsap.from(image, {
        autoAlpha: 0,
        duration: 1,
        delay: index * 0.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: image,
          start: "top 85%",
          once: true,
        },
      });
    });

    ScrollTrigger.refresh();

    // Real wrapped lines receive the CSS indents, including after resizing.
    SplitText.create(".caseStudyTitle", {
      type: "lines",
      linesClass: "caseStudyTitleLine",
      autoSplit: true,
      onSplit(self) {
        const reveal = gsap.timeline({ delay: 0.25 });
        reveal
          .from(".caseStudyTags", { autoAlpha: 0, duration: 0.3 })
          .from(self.lines, {
            autoAlpha: 0,
            y: 30,
            duration: 1,
            stagger: 0.15,
            ease: "power3.out",
          }, "-=0.15");
        return reveal;
      },
    });

    gsap.from(".caseStudyImage01", {
      autoAlpha: 0,
      duration: 1,
      delay: 0.25,
      ease: "power2.out",
    });
  });
}

/* ==========================================================================
   Contact page
   ========================================================================== */

function initContactPage() {
  gsap
    .timeline({
      delay: 0.25,
      defaults: { duration: 1, ease: "power3.out" },
    })
    .from(".contactWord", {
      opacity: 0,
      y: 30,
      stagger: 0.2,
    })
    .from(".contactRight form", { opacity: 0 }, 0.3)
    .from(
      ".contactLeft .SocialWrapper > *",
      { opacity: 0, stagger: 0.15 },
      0.6,
    );
}

/* ==========================================================================
   Start only the animations belonging to the current page
   ========================================================================== */

window.pageFontsReady.then(async () => {
  try {
    if (document.querySelector(".splashSection")) {
      const revealHomeSplash = initHomeSplash();
      initHomeAnimations();
      initHomePortfolio();
      initFooterReveal();
      revealHomeSplash();
    } else if (document.body.classList.contains("portfolioPage")) {
      await initPortfolioPage();
      initFooterReveal();
    } else if (document.body.classList.contains("caseStudyPage")) {
      await initCaseStudyPage();
      initFooterReveal();
    } else if (document.body.classList.contains("contactPage")) {
      initContactPage();
    }
  } finally {
    clearTimeout(window.splashFontFallback);
    document.documentElement.classList.remove("splash-fonts-loading");
  }
});
