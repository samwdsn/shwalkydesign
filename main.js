/* ==========================================================================
Setup GSAP & Lenis
========================================================================== */

gsap.registerPlugin(ScrollTrigger, SplitText);

const lenis = new Lenis();

// Re-arm the footer reveal when filtering changes the portfolio's height.
let resetFooterReveal = null;

lenis.on("scroll", ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

ScrollTrigger.config({
  ignoreMobileResize: true,
});

gsap.set(".VideoContainer", {
  visibility: "visible",
});

const mm = gsap.matchMedia();

/* ==========================================================================
Burger navigation
========================================================================== */

const burgerButton = document.querySelector(".BurgerButton");
const burgerMenu = document.querySelector(".BurgerMenu");

if (burgerButton && burgerMenu) {
  const burgerButtonHome = document.createComment("Burger button position");
  burgerButton.before(burgerButtonHome);
  let burgerIsClosing = false;

  burgerMenu.querySelectorAll(".BurgerLink").forEach((link) => {
    const label = document.createElement("span");
    label.className = "BurgerLinkText";
    while (link.firstChild) label.appendChild(link.firstChild);
    link.appendChild(label);
  });

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
    lenis.stop();
    burgerButton.focus({ preventScroll: true });
  });

  burgerMenu.addEventListener("close", () => {
    burgerIsClosing = false;
    burgerButtonHome.after(burgerButton);
    burgerButton.classList.remove("is-open");
    burgerButton.setAttribute("aria-expanded", "false");
    burgerButton.setAttribute("aria-label", "Open menu");
    document.documentElement.style.overflow = "";
    lenis.start();
    burgerButton.focus({ preventScroll: true });
  });

  burgerMenu.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeBurgerMenu();
  });

  burgerMenu.addEventListener("click", (event) => {
    if (!event.target.closest("a, .BurgerButton")) {
      closeBurgerMenu();
    }
  });

  burgerMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeBurgerMenu);
  });
}

/* ==========================================================================
Input mode detection
========================================================================== */

const inputCapabilityQuery = window.matchMedia(
  "(hover: none), (pointer: coarse)",
);

document.body.classList.toggle("is-touch", inputCapabilityQuery.matches);

window.addEventListener("keydown", (event) => {
  if (event.key === "Tab") document.body.classList.add("keyboard-navigation");
});

window.addEventListener(
  "pointerdown",
  (event) => {
    document.body.classList.remove("keyboard-navigation");
    document.body.classList.toggle("is-touch", event.pointerType !== "mouse");
  },
  { passive: true, capture: true },
);

window.addEventListener(
  "pointermove",
  (event) => {
    if (event.pointerType === "mouse") {
      document.body.classList.remove("is-touch");
    }
  },
  { passive: true },
);

/* ==========================================================================
_-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-_
PAGE_HOME
_-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-_
========================================================================== */
/* ==========================================================================
Splash image parallax
========================================================================== */

// Duplicate the end slides before setting up parallax, so copies animate too.
const splashLoopTrack = document.querySelector(".SplashCarouselTrack");

if (splashLoopTrack) {
  const slides = splashLoopTrack.querySelectorAll(".SplashCarouselSlide");
  if (slides.length > 1) {
    const firstCopy = slides[0].cloneNode(true);
    const lastCopy = slides[slides.length - 1].cloneNode(true);

    [firstCopy, lastCopy].forEach((copy) => {
      copy.dataset.carouselClone = "true";
      copy.setAttribute("aria-hidden", "true");
      const image = copy.querySelector("img");
      image.loading = "eager";
      image.removeAttribute("fetchpriority");
    });

    splashLoopTrack.prepend(lastCopy);
    splashLoopTrack.append(firstCopy);
  }
}

const splashImages = gsap.utils.toArray(".SplashImg");

// Images are 120% tall: centre the extra 20% before adding parallax.
const parallaxCenterOffset = -(10 / 120) * 100;

splashImages.forEach((splashImage) => {
  mm.add("(width > 768px)", () => {
    gsap.fromTo(
      splashImage,
      {
        yPercent: parallaxCenterOffset - 10,
        scale: 1.1,
      },
      {
        yPercent: parallaxCenterOffset + 10,
        scale: 1.1,
        ease: "none",

        scrollTrigger: {
          trigger: splashImage.closest(".SplashImageContainer"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  mm.add("(width <= 768px)", () => {
    gsap.fromTo(
      splashImage,
      {
        yPercent: parallaxCenterOffset - 15,
        scale: 1.2,
      },
      {
        yPercent: parallaxCenterOffset + 15,
        scale: 1.2,
        ease: "none",

        scrollTrigger: {
          trigger: splashImage.closest(".SplashImageContainer"),
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
  });
});

/* ==========================================================================
Splash carousel
========================================================================== */

let resetSplashCarouselToFirst = null;

const carousel = document.querySelector(".SplashImageContainer");

const carouselTrack = document.querySelector(".SplashCarouselTrack");

const carouselSlides = gsap.utils.toArray(
  ".SplashCarouselSlide:not([data-carousel-clone])",
);

const carouselDots = document.querySelector(".SplashCarouselDots");

if (carousel && carouselTrack && carouselSlides.length && carouselDots) {
  // HTML uses human-friendly slide numbers; internal indexes start at zero.
  const requestedStartSlide = Number.parseInt(carousel.dataset.startSlide, 10) || 1;
  const startSlide = Math.max(0, Math.min(carouselSlides.length - 1, requestedStartSlide - 1));
  let currentSlide = startSlide;
  let autoplayTimer;
  let scrollEndTimer;
  let carouselReady = false;
  let carouselInteracted = false;
  const slideOffset = carouselSlides.length > 1 ? 1 : 0;

  const autoplayDelay = 4000;

  const dots = carouselSlides.map((slide, index) => {
    const dot = document.createElement("button");

    dot.className = "SplashCarouselDot";
    dot.type = "button";

    dot.setAttribute("aria-label", `Show image ${index + 1}`);

    dot.addEventListener("click", () => {
      carouselInteracted = true;
      goToSlide(index);
      restartAutoplay();
    });

    carouselDots.appendChild(dot);

    return dot;
  });

  function goToSlide(index) {
    const nextSlide = (index + carouselSlides.length) % carouselSlides.length;
    let position = nextSlide + slideOffset;

    // Cross the boundary using the adjacent copy, not the whole track.
    if (slideOffset && currentSlide === carouselSlides.length - 1 && nextSlide === 0) {
      position = carouselSlides.length + 1;
    } else if (slideOffset && currentSlide === 0 && nextSlide === carouselSlides.length - 1) {
      position = 0;
    }

    // Prepare the destination and following image before they are needed.
    prepareSlide(nextSlide);
    prepareSlide(nextSlide + 1);

    carouselTrack.scrollTo({
      left: carouselTrack.clientWidth * position,
      behavior: "smooth",
    });

  }

  function prepareSlide(index) {
    const slide = carouselSlides[index % carouselSlides.length];
    const image = slide.querySelector("img");
    if (image) image.loading = "eager";
  }

  function updateActiveDot() {
    if (!carouselReady || !carouselTrack.clientWidth) return;
    const position = Math.round(
      carouselTrack.scrollLeft / carouselTrack.clientWidth,
    );
    currentSlide = (position - slideOffset + carouselSlides.length) % carouselSlides.length;

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === currentSlide);
    });
  }

  function jumpToCarouselPosition(position) {
    // Safari may re-snap after layout: disable snapping during instant resets.
    carouselTrack.style.scrollBehavior = "auto";
    carouselTrack.style.scrollSnapType = "none";
    carouselTrack.scrollLeft = carouselTrack.clientWidth * position;
    carouselTrack.getBoundingClientRect();
    requestAnimationFrame(() => {
      carouselTrack.style.removeProperty("scroll-behavior");
      carouselTrack.style.removeProperty("scroll-snap-type");
    });
  }

  function settleCarouselLoop() {
    if (!carouselReady || !slideOffset || !carouselTrack.clientWidth) return;
    const width = carouselTrack.clientWidth;
    const position = Math.round(carouselTrack.scrollLeft / width);
    if (Math.abs(carouselTrack.scrollLeft - position * width) > 1) return;

    // The real slide is identical, so this instant reset is invisible.
    if (position === 0 || position === carouselSlides.length + 1) {
      jumpToCarouselPosition(position === 0 ? carouselSlides.length : 1);
    }
    updateActiveDot();
  }

  function startAutoplay() {
    stopAutoplay();
    if (carouselSlides.length <= 1) return;

    autoplayTimer = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, autoplayDelay);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  dots[startSlide].classList.add("is-active");
  prepareSlide(startSlide);
  prepareSlide(startSlide + 1);

  resetSplashCarouselToFirst = () => {
    stopAutoplay();
    clearTimeout(scrollEndTimer);
    carouselReady = false;
    currentSlide = startSlide;
    jumpToCarouselPosition(startSlide + slideOffset);
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        jumpToCarouselPosition(startSlide + slideOffset);
        carouselReady = true;
        updateActiveDot();
        startAutoplay();
        resolve();
      });
    });
  };

  resetSplashCarouselToFirst();
  carouselTrack.addEventListener("pointerdown", () => {
    carouselInteracted = true;
  }, { passive: true });

  window.addEventListener("load", () => {
    if (!carouselInteracted) resetSplashCarouselToFirst();
  }, { once: true });

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted && !carouselInteracted) resetSplashCarouselToFirst();
  });

  window.addEventListener("resize", () => {
    jumpToCarouselPosition(currentSlide + slideOffset);
  });

  carouselTrack.addEventListener("scrollend", settleCarouselLoop);

  carouselTrack.addEventListener("scroll", () => {
    updateActiveDot();
    // Fallback for browsers without the scrollend event.
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(settleCarouselLoop, 150);
  }, {
    passive: true,
  });

  carousel.addEventListener("mouseenter", stopAutoplay);

  carousel.addEventListener("mouseleave", startAutoplay);

  carousel.addEventListener("focusin", stopAutoplay);

  carousel.addEventListener("focusout", startAutoplay);

}

document.addEventListener("DOMContentLoaded", async () => {
  // Wait for fonts, but don't hold the splash indefinitely on a slow connection.
  await Promise.race([
    document.fonts.ready,
    new Promise((resolve) => setTimeout(resolve, 4000)),
  ]);
  // Font/layout changes must not leave the leading last-slide copy visible.
  if (resetSplashCarouselToFirst) await resetSplashCarouselToFirst();

  /* ==========================================================================
Color flow background opacity
========================================================================== */

  const colorFlowBackground = document.querySelector(".ColorFlowBackground");
  const pageSplash = document.querySelector(
    ".SplashSection",
  );

  if (colorFlowBackground && pageSplash) {
    const colorFlowScroll = gsap.fromTo(
      colorFlowBackground,
      {
        "--scroll-opacity": 0.7,
      },
      {
        "--scroll-opacity": 0.25,
        ease: "none",
        immediateRender: false,

        scrollTrigger: {
          trigger: pageSplash,
          start: "50% top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
          // markers: true,
        },
      },
    );

    if (window.scrollY <= 1) {
      gsap.to(colorFlowBackground, {
        "--load-opacity": 1,
        duration: 2,
        ease: "power2.out",
      });
    } else {
      gsap.set(colorFlowBackground, {
        "--load-opacity": 1,
      });

      colorFlowScroll.scrollTrigger.update();
    }

    ScrollTrigger.refresh();
  }

  /* ==========================================================================
  Splash animation
  ========================================================================== */

  const heading = document.querySelector(".SplashContentContainer h1");
  const image = document.querySelector(".SplashImageContainer");
  const revealItems = gsap.utils.toArray(
    ".SplashSection .NavItemReveal",
  );
  const contactForm = document.querySelector(".Contact_SplashForm");
  const reversedWorkSplash = document.querySelector(".WorkSplashReversed");
  const workSplashCopy = document.querySelector(".WorkSplashCopy");
  const contactParagraph = contactForm
    ? contactForm.parentElement.querySelector("p")
    : null;

  if (heading && image) {
    const split = SplitText.create(heading, {
      type: "words",
      wordsClass: "SplitWord",
    });

    gsap.set([heading, image, ...revealItems], {
      visibility: "visible",
    });

    const timeline = gsap.timeline({
      paused: true,
      defaults: {
        ease: "power3.out",
      },
    });

    timeline
      .from(
        image,
        {
          clipPath: reversedWorkSplash
            ? "inset(0 0 0 100%)"
            : "inset(0 100% 0 0)",
          duration: 1.5,
          ease: "power3.inOut",
        },
        0,
      )

      .from(
        split.words,
        {
          autoAlpha: 0,
          y: 50,
          duration: 1.2,
          stagger: 0.08,
        },
        0.2,
      );

    if (revealItems.length) {
      timeline.from(
        revealItems,
        {
          autoAlpha: 0,
          y: 30,
          duration: 0.8,
          stagger: 0.15,
        },
        0.8,
      );
    }

    // Splash paragraph reveal -----------------------------------

    if (contactParagraph) {
      timeline.from(
        contactParagraph,
        {
          autoAlpha: 0,
          y: 25,
          duration: 1,
        },
        0.5,
      );
    }

    if (workSplashCopy) {
      timeline.from(
        workSplashCopy,
        {
          autoAlpha: 0,
          y: 25,
          duration: 1,
        },
        0.5,
      );
    }

    // Contact form reveal ---------------------------------------

    if (contactForm) {
      timeline.from(
        contactForm,
        {
          autoAlpha: 0,
          duration: 1.2,
        },
        0.8,
      );
    }

    // Initial animation states are now set: reveal the container and play.
    clearTimeout(window.splashFontFallback);
    document.documentElement.classList.remove("splash-fonts-loading");
    timeline.play();
  }

  // Safety for pages without the expected splash markup.
  clearTimeout(window.splashFontFallback);
  document.documentElement.classList.remove("splash-fonts-loading");

  /* ==========================================================================
  Section tab animations
  ========================================================================== */

  const sectionTabs = gsap.utils.toArray(".SectionTab");

  const rootStyles = getComputedStyle(document.documentElement);

  const neutralColour = rootStyles.getPropertyValue("--neutral").trim();

  const whiteColour = rootStyles.getPropertyValue("--white").trim();

  sectionTabs.forEach((sectionTab) => {
    const sectionHeading = sectionTab.querySelector("h2");

    const containingSection = sectionTab.closest("section") || sectionTab;

    if (!sectionHeading) return;

    gsap.set(sectionHeading, {
      color: neutralColour,
    });

    const headingSplit = SplitText.create(sectionHeading, {
      type: "chars",
      charsClass: "SplitChar",
    });

    gsap.set(headingSplit.chars, {
      color: neutralColour,
    });

    // Section marker reveal -------------------------------------

    gsap.from(sectionTab, {
      autoAlpha: 0,
      duration: 0.8,
      ease: "power3.out",

      scrollTrigger: {
        trigger: sectionTab,
        start: "top 80%",
        once: true,
      },
    });

    // Character colour animation --------------------------------

    const characterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: containingSection,
        start: "top 65%",
        end: "bottom 40%",
        scrub: 3,
      },
    });

    characterTimeline
      .to(headingSplit.chars, {
        color: whiteColour,
        duration: 0.5,
        stagger: 0.1,
        ease: "none",
      })

      .to(
        sectionHeading,
        {
          color: whiteColour,
          duration: 0.5,
          ease: "none",
        },
        ">",
      );
  });

  /* ==========================================================================
Video container grow
========================================================================== */

  mm.add("(width > 1024px)", () => {
    gsap.fromTo(
      ".VideoContainer",
      {
        width: "50vw",
      },
      {
        width: "60vw",
        ease: "none",

        scrollTrigger: {
          trigger: ".VideoContainer",
          start: "top 55%",
          end: "top 20%",
          scrub: 3,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  mm.add("(width > 768px) and (width <= 1024px)", () => {
    gsap.fromTo(
      ".VideoContainer",
      {
        width: "60vw",
      },
      {
        width: "70vw",
        ease: "none",

        scrollTrigger: {
          trigger: ".VideoContainer",
          start: "top 80%",
          end: "top 20%",
          scrub: 3,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  mm.add("(width <= 768px)", () => {
    gsap.fromTo(
      ".VideoContainer",
      {
        width: "80%",
      },
      {
        width: "98%",
        ease: "none",

        scrollTrigger: {
          trigger: ".VideoContainer",
          start: "top 75%",
          end: "bottom 50%",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      },
    );
  });

  /* ==========================================================================
  Text-column reveals
  ========================================================================== */

  const belowContent = document.querySelector(".BelowTheFoldContent");

  const textColumns = gsap.utils.toArray(".BelowTheFoldSection .TextColumn");

  if (belowContent && textColumns.length) {
    gsap.from(textColumns, {
      autoAlpha: 0,
      y: 40,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out",

      scrollTrigger: {
        trigger: belowContent,
        start: "top 85%",
        once: true,
      },
    });
  }

  /* ==========================================================================
Footer text animation
========================================================================== */

  const footerHeading = document.querySelector(
    ".FooterGiT h2",
  );

  if (footerHeading) {
    const footerSplit = SplitText.create(footerHeading, {
      type: "words",
      wordsClass: "SplitWord",
    });

    const footerArrow = footerHeading.querySelector(".FooterArrow");

    // Observe real visibility rather than consuming a one-time ScrollTrigger
    // during the temporary layout changes caused by portfolio filtering.
    const footerTimeline = gsap.timeline({ paused: true });

    footerTimeline.from(footerSplit.words, {
        autoAlpha: 0,
        y: 50,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });

    if (footerArrow) {
      footerTimeline.from(
        footerArrow,
        {
          autoAlpha: 0,
          y: 50,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.8",
      );
    }

    const footerObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      footerTimeline.play();
      footerObserver.disconnect();
    }, { rootMargin: "0px 0px -25% 0px" });

    resetFooterReveal = () => {
      footerObserver.disconnect();
      footerTimeline.pause(0);
      footerObserver.observe(footerHeading);
    };

    resetFooterReveal();
  }

  ScrollTrigger.refresh();
});

/* ==========================================================================
Portfolio Preview
========================================================================== */

const portfolioSection = document.querySelector(".PortfolioSection");
const projects = gsap.utils.toArray(".Pfol_ProjectHeader");
const preview = document.querySelector(".PreviewImage");

let activeHover = null;
let activeScroll = null;
let isPortfolioInView = false;
let isScrollSpyLocked = false;
let isPreviewDisabled = false;

function updatePreview() {
  if (!preview) return;

  if (isPreviewDisabled) {
    preview.classList.remove("visible");
    return;
  }

  const targetProject = activeHover || activeScroll;
  const shouldShow =
    Boolean(activeHover) || (isPortfolioInView && Boolean(activeScroll));

  if (targetProject?.dataset.image) {
    preview.style.backgroundImage = `url("${targetProject.dataset.image}")`;
  }

  preview.classList.toggle("visible", shouldShow);
}

if (portfolioSection && projects.length && preview) {
  /* ==========================================================================----
  Hover preview
  ==========================================================================---- */

  const mediaQuery = gsap.matchMedia();

  mediaQuery.add(
    "(hover: hover) and (pointer: fine) and (width > 1024px)",
    () => {
      projects.forEach((project) => {
        project.addEventListener("mouseenter", () => {
          activeHover = project;
          updatePreview();
        });

        project.addEventListener("mouseleave", () => {
          activeHover = null;
          updatePreview();
        });
      });

      /* ==========================================================================
      Mouse follower
      ========================================================================== */

      gsap.set(preview, {
        xPercent: -50,
        yPercent: -50,
      });

      const moveX = gsap.quickTo(preview, "x", {
        duration: 0.6,
        ease: "power3.out",
      });

      const moveY = gsap.quickTo(preview, "y", {
        duration: 0.6,
        ease: "power3.out",
      });

      function handlePointerMove(event) {
        const attractionStrength = 0.3;

        moveX((event.clientX - window.innerWidth / 2) * attractionStrength);

        moveY((event.clientY - window.innerHeight / 2) * attractionStrength);
      }

      window.addEventListener("pointermove", handlePointerMove);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        activeHover = null;

        gsap.set(preview, {
          x: 0,
          y: 0,
          xPercent: -50,
          yPercent: -50,
        });

        updatePreview();
      };
    },
  );

  /* ==========================================================================----
  Scroll preview
  ==========================================================================---- */

  ScrollTrigger.create({
    trigger: portfolioSection,
    start: "top 45%",
    end: "bottom 65%",
    // markers: true,

    onToggle(self) {
      isPortfolioInView = self.isActive;
      updatePreview();
    },
  });

  projects.forEach((project) => {
    ScrollTrigger.create({
      trigger: project,
      start: "top 45%",
      end: "bottom 50%",

      onToggle(self) {
        if (self.isActive && !isScrollSpyLocked) {
          activeScroll = project;
          updatePreview();
        }
      },
    });
  });

  /* ==========================================================================----
  Image preloading
  ==========================================================================---- */

  projects.forEach((project) => {
    const imageUrl = project.dataset.image;

    if (imageUrl && !imageUrl.toLowerCase().endsWith(".mp4")) {
      const image = new Image();
      image.src = imageUrl;
    }
  });
}

/* ==========================================================================
Portfolio Accordion
========================================================================== */

let activeProject = null;

const accordionHeaders = document.querySelectorAll(
  ".Pfol_ProjectHeader[data-accordion]",
);

function loadProjectImages(projectContent) {
  const unloadedImages = projectContent.querySelectorAll("img[data-src]");

  unloadedImages.forEach((image) => {
    image.classList.add("is-loading");

    const revealImage = async () => {
      if (image.naturalWidth && image.decode) {
        try { await image.decode(); } catch (_) { /* Show a loaded image anyway. */ }
      }
      image.classList.remove("is-loading");
    };

    image.addEventListener("load", revealImage, { once: true });
    image.addEventListener("error", revealImage, { once: true });
    // Opening the accordion is the point at which these images are needed.
    image.loading = "eager";
    image.src = image.dataset.src;
    image.removeAttribute("data-src");
    if (image.complete && image.naturalWidth) revealImage();
  });
}

function setProjectButtonState(header, isOpen) {
  header.setAttribute("aria-expanded", String(isOpen));
  header.querySelector(".ViewProjectAction").textContent = isOpen
    ? "Close"
    : "View";
}

accordionHeaders.forEach((header) => {
  header.addEventListener("click", (e) => {
    const currentHeader = e.currentTarget;
    const currentProject = currentHeader.closest(".Pfol_Project");

    const currentContent = currentProject.querySelector(".Pfol_ProjectContent");

    // Keep the clicked header stationary while content above it changes height.
    const headerTop = currentHeader.getBoundingClientRect().top;
    let preserveHeaderPosition = true;
    const allowUserScroll = () => { preserveHeaderPosition = false; };
    window.addEventListener("wheel", allowUserScroll, { passive: true });
    window.addEventListener("touchmove", allowUserScroll, { passive: true });

    const keepHeaderInPlace = () => {
      if (!preserveHeaderPosition) return;
      const difference = currentHeader.getBoundingClientRect().top - headerTop;
      if (Math.abs(difference) > 1) {
        lenis.scrollTo(window.scrollY + difference, { immediate: true, force: true });
      }
    };

    const releaseAccordionAnchor = () => {
      preserveHeaderPosition = false;
      window.removeEventListener("wheel", allowUserScroll);
      window.removeEventListener("touchmove", allowUserScroll);
    };

    const finishAccordionLayout = () => {
      lenis.resize();
      ScrollTrigger.refresh();
      lenis.resize();
      keepHeaderInPlace();
      releaseAccordionAnchor();
    };

    // SCENARIO 1: Close current project
    if (currentProject === activeProject) {
      currentProject.classList.remove("is-open");
      activeProject = null;
      setProjectButtonState(currentHeader, false);

      isScrollSpyLocked = true;

      activeScroll = currentHeader;
      isPreviewDisabled = false;
      preview.classList.remove("force-hidden");
      updatePreview();

      gsap.killTweensOf(currentContent);

      gsap.to(currentContent, {
        height: 0,
        duration: 0.4,
        ease: "power2.out",
        onUpdate: keepHeaderInPlace,
        onInterrupt: releaseAccordionAnchor,

        onComplete: () => {
          if (!currentProject.classList.contains("is-open")) {
            currentContent.hidden = true;
          }

          finishAccordionLayout();

          const unlockScrollSpy = () => {
            isScrollSpyLocked = false;

            window.removeEventListener("touchstart", unlockScrollSpy);

            window.removeEventListener("wheel", unlockScrollSpy);
          };

          window.addEventListener("touchstart", unlockScrollSpy, {
            passive: true,
          });

          window.addEventListener("wheel", unlockScrollSpy, { passive: true });
        },
      });

      return;
    }

    // SCENARIO 2: Open a new project
    if (activeProject) {
      const previousProject = activeProject;
      const activeHeader = previousProject.querySelector(
        ".Pfol_ProjectHeader[data-accordion]",
      );
      const activeContent = activeProject.querySelector(".Pfol_ProjectContent");

      previousProject.classList.remove("is-open");
      setProjectButtonState(activeHeader, false);
      gsap.killTweensOf(activeContent);

      gsap.to(activeContent, {
        height: 0,
        duration: 0.4,
        ease: "power2.out",
        onUpdate: keepHeaderInPlace,
        onComplete: () => {
          if (!previousProject.classList.contains("is-open")) {
            activeContent.hidden = true;
          }

          lenis.resize();
          keepHeaderInPlace();
        },
      });
    }

    loadProjectImages(currentContent);
    currentContent.hidden = false;
    setProjectButtonState(currentHeader, true);
    gsap.killTweensOf(currentContent);

    activeProject = currentProject;
    currentProject.classList.add("is-open");

    isPreviewDisabled = true;
    preview.classList.remove("visible");
    preview.classList.add("force-hidden");

    gsap.to(currentContent, {
      height: "80svh",
      duration: 0.4,
      ease: "power2.out",
      onUpdate: keepHeaderInPlace,
      onInterrupt: releaseAccordionAnchor,
      onComplete: finishAccordionLayout,
    });
  });
});

/* ==========================================================================
_-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-_
PAGE_WORK
_-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-_
========================================================================== */

/* ==========================================================================
Work category navigation and filtering
========================================================================== */

const newWorkLayout = document.querySelector(".NewWorkLayout");

if (newWorkLayout) {
  const newWorkSidebar = newWorkLayout.querySelector(".NewWorkSidebar");

  mm.add("(width <= 768px)", () => {
    const updateSidebarBackground = () => {
      const bounds = newWorkLayout.getBoundingClientRect();
      newWorkSidebar.classList.toggle(
        "is-stuck",
        bounds.top < 24 && bounds.bottom > newWorkSidebar.offsetHeight + 24,
      );
    };

    ScrollTrigger.create({
      trigger: newWorkLayout,
      start: "top 24px",
      end: () => "bottom " + (newWorkSidebar.offsetHeight + 24) + "px",
      onUpdate: updateSidebarBackground,
      onRefresh: updateSidebarBackground,
    });

    updateSidebarBackground();
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener("load", updateSidebarBackground, { once: true });

    return () => {
      window.removeEventListener("load", updateSidebarBackground);
      newWorkSidebar.classList.remove("is-stuck");
    };
  });

  const categoryButtons = newWorkLayout.querySelectorAll(".NewWorkCategory");
  const categoryProjects = newWorkLayout.querySelectorAll("[data-categories]");
  const emptyMessage = newWorkLayout.querySelector(".NewWorkEmpty");
  const categoryStatus = newWorkLayout.querySelector(".NewWorkStatus");
  const moreWorkPrompt = newWorkLayout.querySelector(".NewWorkMorePrompt");
  const showAllButton = newWorkLayout.querySelector(".NewWorkShowAll");
  const allProjectsButton = newWorkLayout.querySelector('[data-category="all"]:not(.NewWorkReset)');
  let activeCategory = null;

  function categoryFromHash() {
    const category = window.location.hash.slice(1).toLowerCase();
    return ["branding", "web", "other"].includes(category) ? category : "all";
  }

  function selectWorkCategory(button, scrollToProjects = true, updateUrl = true) {
      const category = button.dataset.category;
      activeCategory = category;
      let visibleCount = 0;
      let lastVisibleProject = null;

      categoryButtons.forEach((item) => {
        const selected = item.dataset.category === category;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });

      categoryProjects.forEach((project) => {
        const categories = project.dataset.categories.split(" ");
        const visible = category === "all" ||
          (category === "other"
            ? !categories.includes("branding") && !categories.includes("web")
            : categories.includes(category));
        project.hidden = !visible;
        project.classList.remove("is-last-visible");
        if (visible) {
          // Alternate layouts within the visible category, not the full list.
          project.classList.toggle("WorkPfol_LayoutA", visibleCount % 2 === 0);
          project.classList.toggle("WorkPfol_LayoutB", visibleCount % 2 !== 0);
          visibleCount++;
          lastVisibleProject = project;
        }
      });

      lastVisibleProject?.classList.add("is-last-visible");

      emptyMessage.hidden = visibleCount !== 0;
      if (moreWorkPrompt) moreWorkPrompt.hidden = category === "all";
      categoryStatus.textContent = visibleCount + " projects shown.";

      // Updating history avoids the browser's native anchor jump.
      if (updateUrl) {
        const hash = category === "all" ? "" : "#" + category;
        if (window.location.hash !== hash) {
          window.history.pushState(null, "", window.location.pathname + window.location.search + hash);
        }
      }
      ScrollTrigger.refresh();
      // Filtering changes page height; update the scroll limit before scrolling.
      lenis.resize();

      resetFooterReveal?.();
      if (!scrollToProjects) return;

      const sidebarHeight = window.innerWidth <= 768
        ? newWorkLayout.querySelector(".NewWorkSidebar").offsetHeight + 24
        : 0;
      lenis.scrollTo(newWorkLayout, {
        offset: -sidebarHeight - 20,
        duration: 0.8,
        force: true,
        onComplete: () => {
          // Re-arm at the final position, not a transient position while the
          // shorter filtered page is scrolling back to the project navigation.
          resetFooterReveal?.();
        },
      });
  }

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => selectWorkCategory(button));
  });

  showAllButton?.addEventListener("click", () => {
    selectWorkCategory(allProjectsButton);
    const visibleAllButton = window.innerWidth <= 768
      ? newWorkLayout.querySelector(".NewWorkReset")
      : allProjectsButton;
    visibleAllButton.focus({ preventScroll: true });
  });

  function syncCategoryFromUrl(scrollToProjects = true) {
    const category = categoryFromHash();
    if (category === activeCategory) return;
    const button = category === "all" ? allProjectsButton
      : newWorkLayout.querySelector('[data-category="' + category + '"]');
    selectWorkCategory(button, scrollToProjects, false);
  }

  // Shared links select the category without skipping the splash on arrival.
  syncCategoryFromUrl(false);
  window.addEventListener("popstate", () => syncCategoryFromUrl());
  window.addEventListener("hashchange", () => syncCategoryFromUrl());
}

/* ==========================================================================
Portfolio image parallax
========================================================================== */

const portfolioParallaxImages = gsap.utils.toArray(
  ".WorkPfol_Image01 img",
);

portfolioParallaxImages.forEach((image) => {
  gsap.fromTo(
    image,
    {
      yPercent: parallaxCenterOffset - 4,
    },
    {
      yPercent: parallaxCenterOffset + 4,
      ease: "none",

      scrollTrigger: {
        trigger: image.closest(".WorkPfol_Image01"),
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );
});

document.addEventListener("DOMContentLoaded", async () => {
  await document.fonts.ready;

  /* ==========================================================================
  Portfolio title and tag animations
  ========================================================================== */

  const portfolioTitles = gsap.utils.toArray(
    ".WorkPfol_TitleTagsContainer h2",
  );

  portfolioTitles.forEach((title) => {
    const tagContainer = title.closest(".WorkPfol_TitleTagsContainer")
      .querySelector(".WorkTagsContainer");

    SplitText.create(title, {
      type: "lines",
      linesClass: "SplitLine",
      autoSplit: true,

      onSplit(self) {
        // One trigger keeps the tags tied to the title, even above it on mobile.
        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: title,
            start: "top 80%",
            once: true,
          },
        });

        if (tagContainer) {
          // Tags lead; the title follows shortly afterwards.
          reveal.from(tagContainer, {
            autoAlpha: 0,
            duration: 0.3,
            immediateRender: true,
          }, 0);

          reveal.from(tagContainer.querySelectorAll("span"), {
            opacity: 0,
            duration: 0.7,
            stagger: 0.15,
            ease: "power3.out",
            immediateRender: true,
          }, 0);
        }

        reveal.from(self.lines, {
          autoAlpha: 0,
          y: 50,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out",
          immediateRender: true,
        }, tagContainer ? 0.15 : 0);

        // SplitText can preserve this timeline's progress when lines reflow.
        return reveal;
      },
    });
  });

  /* ==========================================================================
  Portfolio image reveals
  ========================================================================== */

  const portfolioProjectSections = gsap.utils.toArray(
    ".WorkPfol_ProjectSection",
  );

  mm.add("(width > 1024px)", () => {
    portfolioProjectSections.forEach((section) => {
      const images = gsap.utils.toArray(
        ".WorkPfol_Image02, .WorkPfol_Image03, .WorkPfol_Image04",
        section,
      );

      gsap.from(images, {
        autoAlpha: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",

        scrollTrigger: {
          trigger: section.querySelector(".WorkPfol_Content02"),
          start: "top 85%",
          once: true,
        },
      });
    });
  });

  mm.add("(width <= 1024px)", () => {
    portfolioProjectSections.forEach((section) => {
      const pairedImages = gsap.utils.toArray(
        ".WorkPfol_Image03, .WorkPfol_Image04",
        section,
      );

      const finalImage = section.querySelector(".WorkPfol_Image02");

      gsap.from(pairedImages, {
        autoAlpha: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power2.out",

        scrollTrigger: {
          trigger: section.querySelector(".WorkPfol_ImagesContainerB"),
          start: "top 85%",
          once: true,
        },
      });

      gsap.from(finalImage, {
        autoAlpha: 0,
        duration: 1,
        ease: "power2.out",

        scrollTrigger: {
          trigger: finalImage,
          start: "top 85%",
          once: true,
        },
      });
    });
  });

  ScrollTrigger.refresh();
});

/* ==========================================================================
_-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-_
PAGE_CONTACT
_-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-__-_
========================================================================== */

/* ==========================================================================
Contact intro: keep the sentence break only when sentence one fits on one line
========================================================================== */

const contactSplashCopy = document.querySelector(".ContactSplashCopy");
const contactFirstSentence = document.querySelector(".ContactSplashFirstSentence");

if (contactSplashCopy && contactFirstSentence) {
  function updateContactCopyBreak() {
    // Measure independently of the current break to avoid toggling back and forth.
    const measure = contactFirstSentence.cloneNode(true);
    measure.setAttribute("aria-hidden", "true");
    Object.assign(measure.style, {
      position: "fixed",
      visibility: "hidden",
      display: "inline-block",
      whiteSpace: "nowrap",
      width: "max-content",
      maxWidth: "none",
      padding: "0",
    });
    contactSplashCopy.appendChild(measure);
    const sentenceWidth = measure.getBoundingClientRect().width;
    measure.remove();

    contactSplashCopy.classList.toggle(
      "is-first-sentence-wrapped",
      sentenceWidth > contactSplashCopy.getBoundingClientRect().width + 0.5,
    );
  }

  updateContactCopyBreak();
  document.fonts.ready.then(updateContactCopyBreak);
  document.fonts.addEventListener("loadingdone", updateContactCopyBreak);

  let previousWidth = -1;
  const contactCopyObserver = new ResizeObserver(([entry]) => {
    if (Math.abs(entry.contentRect.width - previousWidth) < 0.5) return;
    previousWidth = entry.contentRect.width;
    updateContactCopyBreak();
  });
  contactCopyObserver.observe(contactSplashCopy);
}

