/* ============================================
   CONCEPTSIX — Cinematic Agency Script
   GSAP + ScrollTrigger + Lenis
   ============================================ */

(function () {
    'use strict';

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // ---- PRELOADER ----
    const preloader = document.getElementById('preloader');
    const preloaderProgress = document.getElementById('preloaderProgress');
    const preloaderCount = document.getElementById('preloaderCount');
    const preloaderPaths = document.querySelectorAll('.preloader-path');
    let loadProgress = 0;
    let loadComplete = false;

    // Phase 1: Intro animation (logo draw + text reveal)
    const introTl = gsap.timeline({ delay: 0.1 });

    // Animate stroke draw on logo paths
    preloaderPaths.forEach(path => {
        const length = path.getTotalLength ? path.getTotalLength() : 2000;
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
    });

    introTl
        .to(preloaderPaths, {
            strokeDashoffset: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: 'power2.inOut',
        })
        .to(preloaderPaths, {
            fill: '#FFD100',
            stroke: 'transparent',
            duration: 0.3,
            ease: 'power1.in',
        }, '-=0.2')
        .to('.preloader-word', {
            opacity: 1,
            y: 0,
            duration: 0.3,
            stagger: 0.04,
            ease: 'power3.out',
        }, '-=0.2')
        .to('.preloader-tagline', {
            opacity: 1,
            duration: 0.2,
        }, '-=0.1')
        .add(() => { startCounting(); });

    // Phase 2: Counter fills up
    function startCounting() {
        const countObj = { val: 0 };
        gsap.to(countObj, {
            val: 100,
            duration: 0.6,
            ease: 'power2.inOut',
            onUpdate: () => {
                const v = Math.round(countObj.val);
                preloaderCount.textContent = v;
                preloaderProgress.style.width = v + '%';
            },
            onComplete: () => {
                dismissPreloader();
            }
        });
    }

    // Phase 3: Exit
    function dismissPreloader() {
        const exitTl = gsap.timeline({
            onComplete: () => {
                preloader.style.display = 'none';
                initHeroAnimation();
                startVideoPlayback();
            }
        });

        exitTl
            .to('.preloader-center', {
                scale: 1.1,
                opacity: 0,
                duration: 0.35,
                ease: 'power3.in',
            })
            .to('.preloader-curtain-left', {
                xPercent: -100,
                duration: 0.5,
                ease: 'power4.inOut',
            }, '-=0.1')
            .to('.preloader-curtain-right', {
                xPercent: 100,
                duration: 0.5,
                ease: 'power4.inOut',
            }, '<');
    }

    // ---- LENIS SMOOTH SCROLL ----
    const lenis = new Lenis({
        lerp: 0.07,
        smoothWheel: true,
        wheelMultiplier: 0.8,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis with ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ---- CUSTOM CURSOR ----
    const cursor = document.getElementById('cursor');
    if (cursor && window.matchMedia('(pointer: fine)').matches) {
        const cursorDot = cursor.querySelector('.cursor-dot');
        const cursorRing = cursor.querySelector('.cursor-ring');
        let mouseX = 0, mouseY = 0;
        let ringX = 0, ringY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            gsap.set(cursorDot, { x: mouseX, y: mouseY });
        });

        gsap.ticker.add(() => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            gsap.set(cursorRing, { x: ringX, y: ringY });
        });

        // Hover states
        const hoverTargets = document.querySelectorAll('a, button, [data-magnetic]');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });

        // Hide default cursor
        document.documentElement.style.cursor = 'none';
        hoverTargets.forEach(el => el.style.cursor = 'none');
    }

    // ---- MAGNETIC BUTTONS ----
    const magneticEls = document.querySelectorAll('[data-magnetic]');
    magneticEls.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(el, {
                x: x * 0.3,
                y: y * 0.3,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        el.addEventListener('mouseleave', () => {
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });

    // ---- NAVIGATION ----
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    let menuOpen = false;

    // Scroll detection for nav background
    ScrollTrigger.create({
        start: 'top -80',
        onUpdate: (self) => {
            if (self.scroll() > 80) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        }
    });

    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        menuOpen = !menuOpen;
        navToggle.classList.toggle('active', menuOpen);
        mobileMenu.classList.toggle('open', menuOpen);
        if (menuOpen) {
            lenis.stop();
        } else {
            lenis.start();
        }
    });

    // Close mobile menu on link click
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            menuOpen = false;
            navToggle.classList.remove('active');
            mobileMenu.classList.remove('open');
            lenis.start();
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, { offset: -80, duration: 1.5 });
            }
        });
    });

    // ---- HERO ANIMATION ----
    function initHeroAnimation() {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Badge pill fade in
        tl.to('.hero-badge-pill', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        })
        // Title lines reveal
        .to('.hero-line-inner', {
            y: 0,
            duration: 1.2,
            stagger: 0.12,
            ease: 'power4.out',
        }, '-=0.3')
        // Subtitle
        .to('.hero-sub', {
            opacity: 1,
            y: 0,
            duration: 0.8,
        }, '-=0.5')
        // Showcase carousel
        .to('.hero-showcase', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
        }, '-=0.4')
        // Nav
        .to(nav, {
            opacity: 1,
            y: 0,
            duration: 0.6,
        }, '-=0.8');
    }

    // Initial states for hero
    gsap.set(nav, { opacity: 0, y: -20 });
    gsap.set('.hero-badge-pill', { opacity: 0, y: 15 });
    gsap.set('.hero-sub', { opacity: 0, y: 15 });
    gsap.set('.hero-showcase', { opacity: 0, y: 30 });

    // ---- VIDEO PLAYBACK ON SCROLL ----
    function startVideoPlayback() {
        // Lazy-play videos when they enter viewport
        const allVideos = document.querySelectorAll('video');
        allVideos.forEach(video => {
            if (video.closest('.hero') || video.closest('.showreel-fullscreen')) return;

            ScrollTrigger.create({
                trigger: video,
                start: 'top bottom',
                end: 'bottom top',
                onEnter: () => video.play().catch(() => {}),
                onLeave: () => video.pause(),
                onEnterBack: () => video.play().catch(() => {}),
                onLeaveBack: () => video.pause(),
            });
        });
    }

    // ---- SECTION REVEAL ANIMATIONS ----
    // Generic reveal
    gsap.utils.toArray('[data-reveal]').forEach(el => {
        gsap.set(el, { opacity: 0, y: 40 });

        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(el, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                });
            }
        });
    });

    // Line-by-line text reveal
    gsap.utils.toArray('[data-reveal-lines]').forEach(el => {
        const text = el.innerHTML;
        const lines = text.split('<br>');
        el.innerHTML = lines.map(line =>
            `<span class="reveal-line-wrap" style="display:block;overflow:hidden;padding-bottom:0.1em"><span class="reveal-line" style="display:block">${line.trim()}</span></span>`
        ).join('');

        const revealLines = el.querySelectorAll('.reveal-line');
        gsap.set(revealLines, { y: '110%' });

        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to(revealLines, {
                    y: 0,
                    duration: 1,
                    stagger: 0.1,
                    ease: 'power3.out',
                });
            }
        });
    });

    // ---- COUNTER ANIMATION ----
    gsap.utils.toArray('[data-count]').forEach(el => {
        const target = parseInt(el.getAttribute('data-count'));

        ScrollTrigger.create({
            trigger: el,
            start: 'top 85%',
            once: true,
            onEnter: () => {
                gsap.to({ val: 0 }, {
                    val: target,
                    duration: 2,
                    ease: 'power2.out',
                    onUpdate: function () {
                        el.textContent = Math.round(this.targets()[0].val);
                    }
                });
            }
        });
    });

    // ---- SOLUTIONS TABS ----
    const solutionTabs = document.querySelectorAll('.solutions-tab');
    const solutionPanels = document.querySelectorAll('.solutions-panel');

    solutionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            solutionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            solutionPanels.forEach(panel => {
                panel.classList.remove('active');
                if (panel.id === 'panel-' + target) {
                    panel.classList.add('active');
                    // Animate cards in
                    gsap.fromTo(panel.querySelectorAll('.solution-card'),
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
                    );
                }
            });
        });
    });

    // ---- HORIZONTAL SCROLL SERVICES ----
    const servicesTrack = document.getElementById('servicesTrack');
    if (servicesTrack) {
        const cards = servicesTrack.querySelectorAll('.service-card');
        const trackWrapper = document.querySelector('.services-track-wrapper');

        const getScrollAmount = () => {
            return servicesTrack.scrollWidth - trackWrapper.offsetWidth;
        };

        gsap.to(servicesTrack, {
            x: () => -getScrollAmount(),
            ease: 'none',
            scrollTrigger: {
                trigger: trackWrapper,
                start: 'top 15%',
                end: () => '+=' + (getScrollAmount() * 1.2),
                scrub: 0.6,
                pin: trackWrapper,
                pinSpacing: true,
                invalidateOnRefresh: true,
            }
        });

        // Play videos on hover
        cards.forEach(card => {
            const video = card.querySelector('video');
            card.addEventListener('mouseenter', () => {
                if (video) video.play().catch(() => {});
            });
            card.addEventListener('mouseleave', () => {
                if (video) video.pause();
            });
        });
    }

    // ---- SHOWREEL ----
    const showreelPlay = document.getElementById('showreelPlay');
    const showreelClose = document.getElementById('showreelClose');
    const showreelFullscreen = document.getElementById('showreelFullscreen');
    const showreelFullVideo = document.getElementById('showreelFullVideo');
    const showreelVideo = document.getElementById('showreelVideo');

    // Parallax on showreel
    gsap.to('.showreel-video', {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
            trigger: '.showreel',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
        }
    });

    // Auto-play showreel background when visible
    ScrollTrigger.create({
        trigger: '.showreel',
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => showreelVideo && showreelVideo.play().catch(() => {}),
        onLeave: () => showreelVideo && showreelVideo.pause(),
        onEnterBack: () => showreelVideo && showreelVideo.play().catch(() => {}),
        onLeaveBack: () => showreelVideo && showreelVideo.pause(),
    });

    if (showreelPlay) {
        showreelPlay.addEventListener('click', () => {
            showreelFullscreen.classList.add('active');
            showreelFullVideo.play();
            lenis.stop();
        });
    }

    if (showreelClose) {
        showreelClose.addEventListener('click', () => {
            showreelFullscreen.classList.remove('active');
            showreelFullVideo.pause();
            showreelFullVideo.currentTime = 0;
            lenis.start();
        });
    }

    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && showreelFullscreen.classList.contains('active')) {
            showreelClose.click();
        }
    });

    // ---- PORTFOLIO PARALLAX ----
    gsap.utils.toArray('.work-item').forEach((item, i) => {
        const direction = i % 2 === 0 ? 40 : -40;

        // Set initial state explicitly
        gsap.set(item, { opacity: 0, y: direction });

        ScrollTrigger.create({
            trigger: item,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(item, {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                });
            }
        });

        // Parallax on the media
        const media = item.querySelector('.work-item-media');
        if (media) {
            gsap.to(media, {
                yPercent: -8,
                ease: 'none',
                scrollTrigger: {
                    trigger: item,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                }
            });
        }
    });

    // Video play on hover for work items
    document.querySelectorAll('.work-item-inner').forEach(item => {
        const video = item.querySelector('video');
        if (!video) return;
        item.addEventListener('mouseenter', () => video.play().catch(() => {}));
        item.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    });

    // ---- PROCESS STAGGER ----
    gsap.utils.toArray('.process-step').forEach((step, i) => {
        gsap.set(step, { opacity: 0, y: 50 });

        ScrollTrigger.create({
            trigger: step,
            start: 'top 88%',
            once: true,
            onEnter: () => {
                gsap.to(step, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: i * 0.1,
                    ease: 'power3.out',
                });
            }
        });
    });

    // ---- TESTIMONIALS CAROUSEL ----
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.testimonial-dot');
    const prevBtn = document.getElementById('testimonialPrev');
    const nextBtn = document.getElementById('testimonialNext');
    let currentSlide = 0;
    let autoplayInterval;

    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dots[currentSlide].classList.remove('active');
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
    }

    function startAutoplay() {
        autoplayInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    }

    function resetAutoplay() {
        clearInterval(autoplayInterval);
        startAutoplay();
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); resetAutoplay(); });
        nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); resetAutoplay(); });
    }

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); });
    });

    startAutoplay();

    // ---- CONTACT FORM ----
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"] span');
            const originalText = btn.textContent;
            btn.textContent = 'Message Sent!';
            gsap.fromTo(contactForm.querySelector('button[type="submit"]'),
                { scale: 0.95 },
                { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' }
            );
            setTimeout(() => {
                btn.textContent = originalText;
                contactForm.reset();
            }, 3000);
        });
    }

    // ---- FOOTER REVEAL ----
    const footerCols = gsap.utils.toArray('.footer-top > *');
    gsap.set(footerCols, { opacity: 0, y: 30 });

    ScrollTrigger.create({
        trigger: '.footer',
        start: 'top 85%',
        once: true,
        onEnter: () => {
            gsap.to(footerCols, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
            });
        }
    });

    // ---- CHATBOT WIDGET ----
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotWidget = document.getElementById('chatbotWidget');

    if (chatbotToggle && chatbotWidget) {
        chatbotToggle.addEventListener('click', () => {
            chatbotWidget.classList.toggle('open');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (chatbotWidget.classList.contains('open') && !chatbotWidget.contains(e.target)) {
                chatbotWidget.classList.remove('open');
            }
        });
    }

    // ---- REFRESH SCROLLTRIGGER ON RESIZE ----
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            ScrollTrigger.refresh();
        }, 250);
    });

    // ---- THEME TOGGLE ----
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('c6-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('c6-theme', next);
    });

})();
