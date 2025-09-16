// Music Academy Website JavaScript
'use strict';

// Constants for configuration (no behavior change)
const NAV_SCROLL_THRESHOLD = 100;
const OBSERVER_OPTIONS = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
const CARD_ANIMATION_OFFSET_Y = 30;
const CARD_ANIMATION_DURATION_S = 0.6;
const CARD_ANIMATION_STAGGER_S = 0.1;
const FORM_TIMING_SUBMIT_DELAY_MS = 1500;
const FORM_TIMING_SUCCESS_DURATION_MS = 2000;
const FORM_BG_LOADING = 'rgba(255, 255, 255, 0.3)';
const FORM_BG_SUCCESS = 'rgba(76, 175, 80, 0.3)';
const FORM_BG_DEFAULT = 'rgba(255, 255, 255, 0.2)';
const PARALLAX_RATE = -0.5;
const TYPE_SPEED_DEFAULT = 100;
const TESTIMONIAL_ROTATE_MS = 5000;

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling();
    initFormHandler();
    initNavbarEffects();
    initAnimations();
    initTestimonialsSlider();
});

/**
 * Initialize smooth scrolling for navigation links
 */
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize contact form submission handler
 */
function initFormHandler() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmission(this);
        sendFormViaEmail(this);
    });
}

/**
 * Handle form submission with animation feedback
 * @param {HTMLFormElement} form - The form element
 */
function handleFormSubmission(form) {
    const btn = form.querySelector('.submit-btn');
    if (!btn) return;

    const originalText = btn.textContent;
    const originalBackground = btn.style.background;

    // Show loading state
    btn.textContent = 'Sending...';
    btn.style.background = FORM_BG_LOADING;
    btn.disabled = true;

    // Simulate form submission delay
    setTimeout(() => {
        // Show success state
        btn.textContent = 'Message Sent!';
        btn.style.background = FORM_BG_SUCCESS; // Green tint for success
        
        setTimeout(() => {
            // Reset to original state
            btn.textContent = originalText;
            btn.style.background = originalBackground || FORM_BG_DEFAULT;
            btn.disabled = false;
            form.reset();
        }, FORM_TIMING_SUCCESS_DURATION_MS);
    }, FORM_TIMING_SUBMIT_DELAY_MS);
}

// Build and open a mailto link with form contents
function sendFormViaEmail(form) {
    const firstName = (form.querySelector('#firstName')?.value || '').trim();
    const lastName = (form.querySelector('#lastName')?.value || '').trim();
    const email = (form.querySelector('#email')?.value || '').trim();
    const phone = (form.querySelector('#phone')?.value || '').trim();
    const message = (form.querySelector('#message')?.value || '').trim();

    const to = 'dianeboxill.pianolessons@gmail.com';
    const subject = encodeURIComponent(`Website inquiry from ${firstName} ${lastName}`.trim());
    const bodyLines = [
        `Name: ${firstName} ${lastName}`.trim(),
        email ? `Email: ${email}` : '',
        phone ? `Phone: ${phone}` : '',
        '',
        'Message:',
        message
    ].filter(Boolean);
    const body = encodeURIComponent(bodyLines.join('\n'));

    const mailto = `mailto:${to}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
}

/**
 * Initialize navbar scroll effects
 */
function initNavbarEffects() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        
        if (scrollY > NAV_SCROLL_THRESHOLD) {
            nav.style.background = 'rgba(255, 255, 255, 0.98)';
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            nav.style.background = 'rgba(255, 255, 255, 0.95)';
            nav.style.boxShadow = 'none';
        }
    });
}

/**
 * Initialize intersection observer animations
 */
function initAnimations() {
    const observerOptions = OBSERVER_OPTIONS;

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Animate program cards with staggered timing
    animateProgramCards(observer);
    
    // Add other animations as needed
    animateStatsCounters();
}

// Animate statistics counters when they enter the viewport
function animateStatsCounters() {
    const counters = Array.from(document.querySelectorAll('.stat-number, [data-counter]'));
    if (!counters.length) return;

    const seen = new WeakSet();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            if (seen.has(el)) return;
            seen.add(el);

            const { prefix, numericValue, suffix } = parseNumberParts(el.textContent);
            const targetAttr = el.getAttribute('data-target');
            const target = toNumber(targetAttr) ?? numericValue ?? 0;
            const durationAttr = el.getAttribute('data-duration');
            const duration = toNumber(durationAttr) ?? 1500;

            animateValue(0, target, duration, (val) => {
                el.textContent = `${prefix}${formatNumberWithCommas(Math.floor(val))}${suffix}`;
            });

            observer.unobserve(el);
        });
    }, { threshold: 0.3, rootMargin: '0px 0px -10% 0px' });

    counters.forEach(el => observer.observe(el));
}

// Helpers for counters
function toNumber(value) {
    if (value == null) return null;
    const n = Number(String(value).replace(/,/g, '').trim());
    return Number.isFinite(n) ? n : null;
}

function parseNumberParts(text) {
    const str = String(text || '').trim();
    const match = str.match(/^([^0-9]*)([0-9][0-9,]*)([^0-9]*)$/);
    if (!match) return { prefix: '', numericValue: null, suffix: '' };
    const prefix = match[1] || '';
    const numericValue = toNumber(match[2]);
    const suffix = match[3] || '';
    return { prefix, numericValue, suffix };
}

function formatNumberWithCommas(n) {
    try {
        return n.toLocaleString();
    } catch (e) {
        return String(n);
    }
}

function animateValue(start, end, duration, onUpdate) {
    const startTime = performance.now();
    const delta = end - start;

    function easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
        const elapsed = now - startTime;
        const t = Math.min(1, elapsed / duration);
        const value = start + delta * easeOutCubic(t);
        onUpdate(value);
        if (t < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

/**
 * Initialize testimonials auto-rotating slider
 */
function initTestimonialsSlider() {
    const slider = document.querySelector('.testimonials-slider');
    if (!slider) return;

    const track = slider.querySelector('.testimonials-track');
    const slides = track ? Array.from(track.querySelectorAll('.testimonial-slide')) : [];
    const dotsContainer = document.querySelector('.testimonial-dots');
    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.dot')) : [];

    let currentIndex = Math.max(0, slides.findIndex(s => s.classList.contains('active')));

    function showSlide(nextIndex) {
        if (!slides.length || !track) return;
        currentIndex = (nextIndex + slides.length) % slides.length;
        const offset = -currentIndex * 100;
        track.style.transform = `translateX(${offset}%)`;
        dots.forEach(d => d.classList.remove('active'));
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentIndex + 1);
    }

    let rotateTimer = setInterval(nextSlide, TESTIMONIAL_ROTATE_MS);

    // Pause rotation on hover for usability
    slider.addEventListener('mouseenter', () => {
        clearInterval(rotateTimer);
    });
    slider.addEventListener('mouseleave', () => {
        rotateTimer = setInterval(nextSlide, TESTIMONIAL_ROTATE_MS);
    });

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });
}

/**
 * Animate program cards on scroll
 * @param {IntersectionObserver} observer - The intersection observer
 */
function animateProgramCards(observer) {
    document.querySelectorAll('.program-card').forEach((card, index) => {
        // Set initial state
        card.style.opacity = '0';
        card.style.transform = `translateY(${CARD_ANIMATION_OFFSET_Y}px)`;
        card.style.transition = `all ${CARD_ANIMATION_DURATION_S}s ease ${index * CARD_ANIMATION_STAGGER_S}s`;
        
        // Observe for animation trigger
        observer.observe(card);
    });
}

/**
 * Add hover effects to program cards
 */
function initCardHoverEffects() {
    document.querySelectorAll('.program-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

/**
 * Initialize parallax effect for hero section
 */
function initParallaxEffect() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * PARALLAX_RATE;
        hero.style.transform = `translateY(${rate}px)`;
    });
}

/**
 * Add typing effect to hero text
 * @param {string} selector - CSS selector for the element
 * @param {string} text - Text to type
 * @param {number} speed - Typing speed in milliseconds
 */
function typeWriterEffect(selector, text, speed = TYPE_SPEED_DEFAULT) {
    const element = document.querySelector(selector);
    if (!element) return;

    element.textContent = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

/**
 * Initialize mobile menu toggle (if needed)
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

/**
 * Add keyboard navigation support
 */
function initKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Escape key closes mobile menu
        if (e.key === 'Escape') {
            const navLinks = document.querySelector('.nav-links');
            const menuToggle = document.querySelector('.menu-toggle');
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                if (menuToggle) menuToggle.classList.remove('active');
            }
        }
    });
}

/**
 * Utility function to debounce events
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Execute immediately
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

/**
 * Initialize all optional features
 */
function initOptionalFeatures() {
    initCardHoverEffects();
    initParallaxEffect();
    initMobileMenu();
    initKeyboardNavigation();
}

// Optional features can be initialized from the first DOMContentLoaded block above if needed.