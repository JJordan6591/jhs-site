// ─────────────────────────────────────────────
//  Jordan Home Solutions · main.js
//  To activate the contact form:
//    1. Sign up at https://formspree.io (free)
//    2. Create a new form → copy the Form ID
//    3. Replace YOUR_FORM_ID below with it
// ─────────────────────────────────────────────
const FORMSPREE_ID = 'YOUR_FORM_ID';

// ── Mobile menu ──────────────────────────────
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.getElementById('navLinks');

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('click', () => {
    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// ── Smooth scroll for anchor links ───────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '#top') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset;
      window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
    }
  });
});

// ── Modal ─────────────────────────────────────
const modal = document.getElementById('contactModal');
const openFormButtons = document.querySelectorAll('[data-action="open-form"]');
const closeFormButtons = document.querySelectorAll('.modal-close');

function closeModal() {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.reset();
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    const formStatus = document.getElementById('formStatus');
    if (formStatus) formStatus.textContent = '';
  }
}

if (modal) {
  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => { document.getElementById('name')?.focus(); }, 100);
  }

  openFormButtons.forEach(btn => btn.addEventListener('click', openModal));
  closeFormButtons.forEach(btn => btn.addEventListener('click', closeModal));

  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') closeModal();
  });
} else {
  if (openFormButtons.length > 0) {
    openFormButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.tagName === 'A') return;
        e.preventDefault();
        e.stopPropagation();
        if (window.location.pathname === '/contact' || window.location.pathname === '/contact/') {
          const form = document.getElementById('contactForm');
          if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setTimeout(() => { document.getElementById('name')?.focus(); }, 300);
          }
        } else {
          window.location.href = '/contact/';
        }
      });
    });
  }
}

// ── Scroll to services ────────────────────────
document.querySelectorAll('[data-action="scroll-to-services"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const services = document.getElementById('services');
    if (services) {
      const elementPosition = services.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset;
      window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
    }
  });
});

// ── Form validation & submission ──────────────
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    const statusEl = document.getElementById('formStatus');
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);

    let isValid = true;

    if (!data.name || data.name.trim().length < 2) {
      document.getElementById('nameError').textContent = 'Please enter your name';
      isValid = false;
    }
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      document.getElementById('emailError').textContent = 'Please enter a valid email';
      isValid = false;
    }
    if (!data.message || data.message.trim().length < 10) {
      document.getElementById('messageError').textContent = 'Please tell us about your setup (at least 10 characters)';
      isValid = false;
    }

    if (!isValid) return;

    statusEl.textContent = 'Sending…';
    statusEl.className = 'form-status loading';

    if (FORMSPREE_ID === 'YOUR_FORM_ID') {
      // Formspree not configured yet — fall back to mailto
      const subject = encodeURIComponent(`WiFi Assessment Request from ${data.name}`);
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\n` +
        `Home Size: ${data.homeSize || 'Not specified'}\nService: ${data.service || 'Not specified'}\n\n${data.message}`
      );
      statusEl.innerHTML = `
        <div style="margin-bottom:0.5rem;">Drop me an email directly:</div>
        <a href="mailto:jjordan6591@gmail.com?subject=${subject}&body=${body}"
           class="btn-primary" style="display:inline-block;text-decoration:none;">
          Open in Mail App
        </a>`;
      statusEl.className = 'form-status';
      return;
    }

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        statusEl.textContent = "Thanks! I'll get back to you within 24 hours.";
        statusEl.className = 'form-status success';
        contactForm.reset();
        setTimeout(() => { closeModal(); }, 2000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      statusEl.textContent = 'Something went wrong. Please email jjordan6591@gmail.com directly.';
      statusEl.className = 'form-status error';
    }
  });
}

// ── Current year ──────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Header scroll effect ───────────────────────
const header = document.querySelector('header');
window.addEventListener('scroll', () => {
  if (window.pageYOffset > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}, { passive: true });

// ── Intersection Observer animations ──────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.service-card, .step-item, .process-card, .animate-in').forEach(el => {
  observer.observe(el);
});
