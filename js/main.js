// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.getElementById('navLinks');

if (mobileMenuToggle) {
  mobileMenuToggle.addEventListener('click', () => {
    const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
    mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
    navLinks.classList.toggle('active');
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  });

  // Close menu when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

// Smooth scrolling for anchor links
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
      // Scroll to section, allowing header to cover section headers
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset;

      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  });
});

// Modal functionality
const modal = document.getElementById('contactModal');
const openFormButtons = document.querySelectorAll('[data-action="open-form"]');
const closeFormButtons = document.querySelectorAll('.modal-close');

// Define closeModal function outside the if block so it can be called from form handler
function closeModal() {
  if (!modal) return; // Safe to call even if modal doesn't exist
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  // Reset form if it exists
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.reset();
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    const formStatus = document.getElementById('formStatus');
    if (formStatus) formStatus.textContent = '';
  }
}

// Only set up modal if it exists on the page
if (modal) {
  function openModal() {
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Focus first input
    setTimeout(() => {
      document.getElementById('name')?.focus();
    }, 100);
  }

  openFormButtons.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  closeFormButtons.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  // Close modal on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });
} else {
  // If modal doesn't exist, redirect open-form buttons to contact section
  if (openFormButtons.length > 0) {
    openFormButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        // If button is a link, let it work normally
        if (btn.tagName === 'A') return;
        
        // Prevent default button behavior
        e.preventDefault();
        e.stopPropagation();
        
        // Redirect to home page contact section
        window.location.href = '/#contact';
      });
    });
  }
}

// Scroll to services
document.querySelectorAll('[data-action="scroll-to-services"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const services = document.getElementById('services');
    if (services) {
      // Scroll to section, allowing header to cover section headers
      const elementPosition = services.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
  });
});

// Form validation and submission
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    const statusEl = document.getElementById('formStatus');
    statusEl.textContent = '';
    statusEl.className = 'form-status';
    
    // Get form data
    const formData = new FormData(contactForm);
    const data = Object.fromEntries(formData);
    
    // Validate
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
    
    if (!isValid) {
      return;
    }
    
    // Show loading state
    statusEl.textContent = 'Sending...';
    statusEl.className = 'form-status loading';
    
    try {
      // Option 1: Use Formspree (free tier available)
      // Replace YOUR_FORM_ID with your Formspree form ID
      const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        statusEl.textContent = 'Thank you! We\'ll get back to you within 24 hours.';
        statusEl.className = 'form-status success';
        contactForm.reset();
        
        // Close modal after 2 seconds
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      // Fallback: Use mailto link
      const subject = encodeURIComponent(`WiFi Assessment Request from ${data.name}`);
      const body = encodeURIComponent(
        `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone || 'Not provided'}\nHome Size: ${data.homeSize || 'Not specified'}\nService Interest: ${data.service || 'Not specified'}\n\nMessage:\n${data.message}`
      );
      
      // Show success message and mailto link
      statusEl.innerHTML = `
        <div style="margin-bottom: 0.5rem;">Form submission service not configured.</div>
        <a href="mailto:jordan@jordanhomesolutions.com?subject=${subject}&body=${body}" 
           class="btn-primary" 
           style="display: inline-block; text-decoration: none;">
          Send via Email Instead
        </a>
      `;
      statusEl.className = 'form-status';
    }
  });
}

// Set current year
document.getElementById('year').textContent = new Date().getFullYear();

// Add scroll effect to header
let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
  
  // Section headers stick at 88px and stop before covering content below
  const stickyTop = 88; // Headers stick at 88px from top
  const sectionHeaders = document.querySelectorAll('.section-header');
  
  sectionHeaders.forEach(headerEl => {
    const rect = headerEl.getBoundingClientRect();
    const headerTop = rect.top;
    const headerBottom = rect.bottom;
    
    // Find the next content element (cards/grid) after this header
    const section = headerEl.closest('section');
    const nextContent = section?.querySelector('.services-grid, .process-grid, .step-list');
    
    if (nextContent) {
      const contentRect = nextContent.getBoundingClientRect();
      const contentTop = contentRect.top;
      const minGap = 30; // Minimum gap between header and content
      
      // Calculate if header would cover the content
      // Stop sticky when content is approaching the header bottom
      if (contentTop - headerBottom < minGap && headerTop <= stickyTop + 10) {
        // Header would cover content - remove sticky positioning
        headerEl.style.position = 'relative';
        headerEl.style.top = 'auto';
      } else if (headerTop > stickyTop) {
        // Header is below sticky position - restore sticky
        headerEl.style.position = 'sticky';
        headerEl.style.top = `${stickyTop}px`;
      }
    }
  });
  
  lastScroll = currentScroll;
});

// Scroll-triggered animations using Intersection Observer
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      // Stop observing once animated
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observe sections (for opacity fade-in only, not headers)
document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});


// Observe service cards with stagger
document.querySelectorAll('.service-card').forEach(card => {
  observer.observe(card);
});


// Observe step items
document.querySelectorAll('.step-item').forEach(step => {
  observer.observe(step);
});


// Observe process card
const processCard = document.querySelector('.process-card');
if (processCard) {
  observer.observe(processCard);
}
