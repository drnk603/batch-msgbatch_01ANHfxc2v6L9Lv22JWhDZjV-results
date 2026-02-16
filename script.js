(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  const app = window.__app;

  function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  function throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => { inThrottle = false; }, limit);
      }
    };
  }

  function initBurgerMenu() {
    if (app.burgerInited) return;
    app.burgerInited = true;

    const toggle = document.querySelector('.navbar-toggler');
    const collapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.nav-link');
    const body = document.body;

    if (!toggle || !collapse) return;

    function isOpen() {
      return collapse.classList.contains('show');
    }

    function openMenu() {
      collapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
    }

    function closeMenu() {
      collapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
    }

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (isOpen()) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (isOpen()) {
          closeMenu();
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (isOpen() && !collapse.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    const resizeHandler = debounce(() => {
      if (window.innerWidth >= 1024 && isOpen()) {
        closeMenu();
      }
    }, 200);

    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  function getHeaderHeight() {
    const header = document.querySelector('.sticky-top, .l-header');
    return header ? header.offsetHeight : 76;
  }

  function initSmoothScroll() {
    if (app.smoothScrollInited) return;
    app.smoothScrollInited = true;

    document.addEventListener('click', (e) => {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.startsWith('#')) {
        e.preventDefault();
        const id = href.substring(1);
        const element = document.getElementById(id);
        if (element) {
          const offset = getHeaderHeight();
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  }

  function initScrollSpy() {
    if (app.scrollSpyInited) return;
    app.scrollSpyInited = true;

    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    if (navLinks.length === 0) return;

    const sections = [];
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#') && href !== '#') {
        const id = href.substring(1);
        const section = document.getElementById(id);
        if (section) {
          sections.push({ link, section });
        }
      }
    });

    if (sections.length === 0) return;

    function updateActiveLink() {
      const scrollPosition = window.scrollY + getHeaderHeight() + 50;

      let currentSection = null;
      sections.forEach(({ section }) => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = section;
        }
      });

      sections.forEach(({ link, section }) => {
        if (section === currentSection) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        } else {
          link.classList.remove('active');
          link.removeAttribute('aria-current');
        }
      });
    }

    const throttledUpdate = throttle(updateActiveLink, 100);
    window.addEventListener('scroll', throttledUpdate, { passive: true });
    updateActiveLink();
  }

  function initActiveMenu() {
    if (app.activeMenuInited) return;
    app.activeMenuInited = true;

    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
      const linkPath = link.getAttribute('href');
      if (!linkPath) return;

      let isActive = false;

      if (linkPath === '/' || linkPath === '/index.html') {
        if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/index.html')) {
          isActive = true;
        }
      } else if (linkPath.startsWith('/') && !linkPath.startsWith('/#')) {
        if (currentPath === linkPath || currentPath.endsWith(linkPath)) {
          isActive = true;
        }
      }

      if (isActive) {
        link.setAttribute('aria-current', 'page');
        link.classList.add('active');
      } else {
        link.removeAttribute('aria-current');
        link.classList.remove('active');
      }
    });
  }

  function initImages() {
    if (app.imagesInited) return;
    app.imagesInited = true;

    const images = document.querySelectorAll('img');

    images.forEach(img => {
      if (!img.hasAttribute('loading') && !img.classList.contains('c-logo__img') && !img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }

      if (!img.classList.contains('img-fluid')) {
        img.classList.add('img-fluid');
      }

      img.addEventListener('error', function() {
        const errorImg = this;
        const svgPlaceholder = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#e9ecef"/><text x="50" y="50" font-family="Arial" font-size="14" fill="#6c757d" text-anchor="middle" dominant-baseline="middle">Image</text></svg>';
        const blob = new Blob([svgPlaceholder], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        errorImg.src = url;
        errorImg.style.objectFit = 'contain';

        if (errorImg.closest('.c-logo')) {
          errorImg.style.maxHeight = '40px';
        }
      });
    });
  }

  function initForms() {
    if (app.formsInited) return;
    app.formsInited = true;

    const form = document.getElementById('contactForm');
    if (!form) return;

    app.notify = function(message, type) {
      let container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `alert alert-${type || 'info'} alert-dismissible fade show`;
      toast.setAttribute('role', 'alert');
      toast.innerHTML = `${message}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;
      container.appendChild(toast);

      const closeBtn = toast.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          toast.classList.remove('show');
          setTimeout(() => {
            if (container.contains(toast)) {
              container.removeChild(toast);
            }
          }, 150);
        });
      }

      setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
          if (container.contains(toast)) {
            container.removeChild(toast);
          }
        }, 150);
      }, 5000);
    };

    function validateField(field) {
      const id = field.id;
      const value = field.value.trim();
      let isValid = true;
      let errorMessage = '';

      if (id === 'firstName' || id === 'lastName') {
        if (value === '') {
          isValid = false;
          errorMessage = 'This field is required.';
        } else if (!/^[a-zA-ZÀ-ÿ\s\-']{2,50}$/.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid name (2-50 characters).';
        }
      }

      if (id === 'email') {
        if (value === '') {
          isValid = false;
          errorMessage = 'Email is required.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address.';
        }
      }

      if (id === 'phone') {
        if (value === '') {
          isValid = false;
          errorMessage = 'Phone number is required.';
        } else if (!/^[\d\s\+\-\(\)]{10,20}$/.test(value)) {
          isValid = false;
          errorMessage = 'Please enter a valid phone number (10-20 digits).';
        }
      }

      if (id === 'subject') {
        if (value === '') {
          isValid = false;
          errorMessage = 'Subject is required.';
        } else if (value.length < 3) {
          isValid = false;
          errorMessage = 'Subject must be at least 3 characters.';
        }
      }

      if (id === 'message') {
        if (value === '') {
          isValid = false;
          errorMessage = 'Message is required.';
        } else if (value.length < 10) {
          isValid = false;
          errorMessage = 'Message must be at least 10 characters.';
        }
      }

      if (id === 'privacyConsent') {
        if (!field.checked) {
          isValid = false;
          errorMessage = 'You must accept the privacy policy.';
        }
      }

      const parent = field.closest('.mb-3, .mb-4, .form-check');
      let errorElement = parent ? parent.querySelector('.invalid-feedback') : null;

      if (!isValid) {
        field.classList.add('is-invalid');
        if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.className = 'invalid-feedback';
          if (parent) {
            parent.appendChild(errorElement);
          }
        }
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';
      } else {
        field.classList.remove('is-invalid');
        if (errorElement) {
          errorElement.style.display = 'none';
        }
      }

      return isValid;
    }

    const fields = form.querySelectorAll('input, textarea');
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) {
          validateField(field);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();

      let isFormValid = true;
      fields.forEach(field => {
        if (!validateField(field)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        app.notify('Please correct the errors in the form.', 'danger');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
      }

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }

        window.location.href = 'thank_you.html';
      }, 1000);
    });
  }

  function initCookieConsent() {
    if (app.cookieConsentInited) return;
    app.cookieConsentInited = true;

    const cookieConsent = document.getElementById('cookieConsent');
    if (!cookieConsent) return;

    const acceptBtn = document.getElementById('acceptCookies');
    const declineBtn = document.getElementById('declineCookies');

    const consentGiven = localStorage.getItem('cookieConsent');

    if (!consentGiven) {
      setTimeout(() => {
        cookieConsent.classList.add('show');
      }, 1000);
    }

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieConsent.classList.remove('show');
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'declined');
        cookieConsent.classList.remove('show');
      });
    }
  }

  function initScrollToTop() {
    if (app.scrollToTopInited) return;
    app.scrollToTopInited = true;

    let scrollBtn = document.querySelector('.scroll-to-top');
    
    if (!scrollBtn) {
      scrollBtn = document.createElement('button');
      scrollBtn.className = 'scroll-to-top c-button c-button--primary';
      scrollBtn.setAttribute('aria-label', 'Scroll to top');
      scrollBtn.innerHTML = '↑';
      scrollBtn.style.cssText = 'position: fixed; bottom: 2rem; right: 2rem; z-index: 999; width: 48px; height: 48px; padding: 0; border-radius: 50%; opacity: 0; visibility: hidden; transition: all 300ms ease-in-out;';
      document.body.appendChild(scrollBtn);
    }

    function toggleButton() {
      if (window.scrollY > 300) {
        scrollBtn.style.opacity = '1';
        scrollBtn.style.visibility = 'visible';
      } else {
        scrollBtn.style.opacity = '0';
        scrollBtn.style.visibility = 'hidden';
      }
    }

    const throttledToggle = throttle(toggleButton, 200);
    window.addEventListener('scroll', throttledToggle, { passive: true });

    scrollBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    toggleButton();
  }

  function initAccordion() {
    if (app.accordionInited) return;
    app.accordionInited = true;

    const accordionButtons = document.querySelectorAll('.accordion-button');

    accordionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const target = button.getAttribute('data-bs-target');
        if (!target) return;

        const collapse = document.querySelector(target);
        if (!collapse) return;

        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          button.setAttribute('aria-expanded', 'false');
          button.classList.add('collapsed');
          collapse.classList.remove('show');
        } else {
          button.setAttribute('aria-expanded', 'true');
          button.classList.remove('collapsed');
          collapse.classList.add('show');
        }
      });
    });
  }

  function initCountUp() {
    if (app.countUpInited) return;
    app.countUpInited = true;

    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'));
      const duration = parseInt(counter.getAttribute('data-duration')) || 2000;
      const increment = target / (duration / 16);

      let current = 0;

      function updateCount() {
        current += increment;
        if (current < target) {
          counter.textContent = Math.ceil(current);
          requestAnimationFrame(updateCount);
        } else {
          counter.textContent = target;
        }
      }

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            updateCount();
            observer.unobserve(counter);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(counter);
    });
  }

  function initModal() {
    if (app.modalInited) return;
    app.modalInited = true;

    const modalTriggers = document.querySelectorAll('[data-modal]');
    
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        
        if (modal) {
          modal.classList.add('show');
          document.body.classList.add('u-no-scroll');
        }
      });
    });

    const modalCloses = document.querySelectorAll('[data-modal-close]');
    
    modalCloses.forEach(closeBtn => {
      closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        if (modal) {
          modal.classList.remove('show');
          document.body.classList.remove('u-no-scroll');
        }
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
          openModal.classList.remove('show');
          document.body.classList.remove('u-no-scroll');
        }
      }
    });
  }

  app.init = function() {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initImages();
    initForms();
    initCookieConsent();
    initScrollToTop();
    initAccordion();
    initCountUp();
    initModal();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }

})();
