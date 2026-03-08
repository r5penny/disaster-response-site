/**
 * script.js — Disaster Response by Ryan
 * Handles: FAQ accordion, mobile menu, header scroll, contact forms, smooth scroll
 *
 * =========================================================
 * GHL WEBHOOK SETUP (GoHighLevel Integration)
 * =========================================================
 * 1. Log into GoHighLevel → Settings → Integrations → Webhooks
 * 2. Create a new webhook for "Contact Form Submission"
 * 3. Copy the webhook URL and paste it below, replacing the placeholder
 * =========================================================
 */

// ── GHL Configuration ──────────────────────────────────────────────────────
// PASTE YOUR GHL WEBHOOK URL HERE:
const GHL_WEBHOOK_URL = 'YOUR_GHL_WEBHOOK_URL_HERE';

// ── Site Contact Info ───────────────────────────────────────────────────────
const PHONE_DISPLAY = '(616) 822-1978';
const PHONE_LINK    = '6168221978';
// Example: 'https://services.leadconnectorhq.com/hooks/abc123xyz/webhook-trigger/...'
// ───────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {

    // ── FAQ Accordion ────────────────────────────────────────────────────────
    // When user clicks a question, it expands; clicking again collapses it.
    // Only one question is open at a time.
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const isActive = question.classList.contains('active');

            // Close ALL open answers first
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                const ans = q.nextElementSibling;
                if (ans) { ans.style.maxHeight = null; ans.classList.remove('open'); }
            });

            // If this one wasn't already open, open it now
            if (!isActive) {
                question.classList.add('active');
                const answer = question.nextElementSibling;
                if (answer) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                    answer.classList.add('open');
                }
            }
        });
    });

    // ── Header Scroll Shrink ─────────────────────────────────────────────────
    // Adds a 'scrolled' CSS class to the header once user scrolls down 80px,
    // which triggers a smaller/compact header style defined in styles.css
    const header = document.querySelector('.site-header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 80);
        });
    }

    // ── Mobile Menu Toggle ───────────────────────────────────────────────────
    // Shows/hides the mobile nav and swaps the hamburger ☰ icon to X
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNav  = document.querySelector('.mobile-nav');

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            mobileNav.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            const isOpen = mobileNav.classList.contains('active');
            icon.classList.toggle('fa-bars', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : ''; // Prevent background scroll when menu open
        });
    }

    // ── XSS Protection ──────────────────────────────────────────────────────
    // WHY: Never insert user-typed text directly into HTML — attackers can inject
    // scripts. This function converts special characters to safe HTML entities.
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ── GHL Form Submission ──────────────────────────────────────────────────
    // Collects all form field values, sends them to GoHighLevel via webhook,
    // then shows a success or error message to the visitor.
    async function submitToGHL(formData) {
        // If no webhook URL is configured, log a warning and return
        if (!GHL_WEBHOOK_URL || GHL_WEBHOOK_URL === 'YOUR_GHL_WEBHOOK_URL_HERE') {
            console.warn('[GHL] No webhook URL configured. Set GHL_WEBHOOK_URL in script.js.');
            return { ok: true, fallback: true }; // Still show success UI so user isn't confused
        }

        // Send form data as JSON to GHL webhook
        // GHL receives this and automatically creates a contact/lead in your CRM
        const response = await fetch(GHL_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        return response;
    }

    // ── Contact Form Handler ─────────────────────────────────────────────────
    // Works for both the full contact page form (#contact-form)
    // and the homepage mini-form (#home-contact-form)
    function setupContactForm(formEl) {
        if (!formEl) return;

        formEl.addEventListener('submit', async function (e) {
            e.preventDefault(); // Stop browser default form submit (page reload)

            // Collect values from all form fields
            const nameEl    = formEl.querySelector('[id$="-name"]');    // ends with -name
            const phoneEl   = formEl.querySelector('[id$="-phone"]');   // ends with -phone
            const emailEl   = formEl.querySelector('[id$="-email"]');
            const serviceEl = formEl.querySelector('[id$="-service"]');
            const messageEl = formEl.querySelector('[id$="-message"]');

            // Basic validation — name and phone are required
            if (!nameEl || !phoneEl || !nameEl.value.trim() || !phoneEl.value.trim()) {
                const firstRequired = !nameEl?.value.trim() ? nameEl : phoneEl;
                if (firstRequired) {
                    firstRequired.style.borderColor = '#ef4444';
                    firstRequired.focus();
                    // Show visible error message below the field
                    let fieldErr = firstRequired.parentElement.querySelector('.field-error');
                    if (!fieldErr) {
                        fieldErr = document.createElement('p');
                        fieldErr.className = 'field-error';
                        fieldErr.style.cssText = 'color:#ef4444;font-size:.85rem;margin:.3rem 0 0;';
                        firstRequired.parentElement.appendChild(fieldErr);
                    }
                    fieldErr.textContent = firstRequired === nameEl ? 'Please enter your name.' : 'Please enter your phone number.';
                }
                return;
            }

            // Show loading state on the button
            const submitBtn = formEl.querySelector('[type="submit"]');
            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
            }

            // Build the payload — GHL maps these fields to contact properties
            const payload = {
                name:        nameEl.value.trim(),
                phone:       phoneEl.value.trim(),
                email:       emailEl   ? emailEl.value.trim()   : '',
                service:     serviceEl ? serviceEl.value        : '',
                message:     messageEl ? messageEl.value.trim() : '',
                source:      'Website Contact Form',
                page_url:    window.location.href
            };

            try {
                await submitToGHL(payload);

                // ✅ Success: replace form with confirmation message
                const safeName  = escapeHTML(payload.name);
                const safePhone = escapeHTML(payload.phone);
                formEl.innerHTML = `
                    <div style="text-align:center; padding:3rem 1rem;">
                        <i class="fa-solid fa-circle-check" style="font-size:3.5rem; color:#22c55e; margin-bottom:1.25rem; display:block;"></i>
                        <h3 style="margin-bottom:.5rem;">Got it, ${safeName}!</h3>
                        <p style="margin-bottom:1.5rem; color:var(--text-muted);">We'll call <strong style="color:#fff;">${safePhone}</strong> back shortly. For emergencies, reach us directly:</p>
                        <div style="display:flex; gap:1rem; justify-content:center; flex-wrap:wrap;">
                            <a href="tel:${PHONE_LINK}" class="btn btn-primary"><i class="fa-solid fa-phone"></i> Call ${PHONE_DISPLAY}</a>
                            <a href="sms:${PHONE_LINK}" class="btn btn-secondary"><i class="fa-solid fa-comment-sms"></i> Text Us</a>
                        </div>
                    </div>`;

            } catch (err) {
                // ❌ Error: restore button and show error
                console.error('[GHL] Form submission failed:', err);
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                }
                // Show inline error below button
                let errMsg = formEl.querySelector('.form-error');
                if (!errMsg) {
                    errMsg = document.createElement('p');
                    errMsg.className = 'form-error';
                    errMsg.style.cssText = 'color:#ef4444; margin-top:.75rem; text-align:center; font-size:.9rem;';
                    formEl.appendChild(errMsg);
                }
                errMsg.textContent = 'Oops — something went wrong. Please call us at (616) 822-1978.';
            }
        });
    }

    // Attach handler to all three forms across the site
    setupContactForm(document.getElementById('contact-form'));        // /contact/ page
    setupContactForm(document.getElementById('home-contact-form'));   // Homepage main form
    setupContactForm(document.getElementById('home-contact-form-2')); // Homepage sidebar form

    // ── Scroll-triggered Animations ─────────────────────────────────────────
    // WHY: .fade-up and .animate-on-scroll elements start invisible in CSS.
    // This observer watches for them to enter the viewport and adds the class
    // that makes them fade in. Without this, they'd stay invisible forever.
    if ('IntersectionObserver' in window) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view', 'visible'); // 'in-view' for .fade-up, 'visible' for .animate-on-scroll
                    scrollObserver.unobserve(entry.target); // Only animate once
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        // Watch all fade-up and animate-on-scroll elements
        document.querySelectorAll('.fade-up, .animate-on-scroll').forEach(el => {
            scrollObserver.observe(el);
        });
    } else {
        // Fallback for very old browsers — just make everything visible
        document.querySelectorAll('.fade-up, .animate-on-scroll').forEach(el => {
            el.classList.add('in-view', 'visible');
        });
    }

    // ── Smooth Scrolling ─────────────────────────────────────────────────────
    // Makes internal anchor links (#section) scroll smoothly instead of jumping
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') { e.preventDefault(); return; }

            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            e.preventDefault();

            // Close mobile menu if it's open
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                const icon = menuToggle?.querySelector('i');
                if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
                document.body.style.overflow = '';
            }

            targetElement.scrollIntoView({ behavior: 'smooth' });
        });
    });

});
