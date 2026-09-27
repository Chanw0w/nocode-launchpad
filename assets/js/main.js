// Main JavaScript for NoCode Launchpad
// Brutalist Pastel Theme

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initScrollHeader();
  initSmoothScroll();
  initNewsletterForm();
  initAnimations();
  initAffiliateTracking();
});

// ═══════════════════════════════════════════════════════════════
// Mobile Menu
// ═══════════════════════════════════════════════════════════════

function initMobileMenu() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (!menuToggle || !mobileMenu) return;
  
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('active');
    mobileMenu.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });
  
  const mobileLinks = mobileMenu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Header Scroll Effect
// ═══════════════════════════════════════════════════════════════

function initScrollHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  
  let ticking = false;
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
        
        ticking = false;
      });
      ticking = true;
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// Smooth Scroll
// ═══════════════════════════════════════════════════════════════

function initSmoothScroll() {
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

// ═══════════════════════════════════════════════════════════════
// Newsletter Form
// ═══════════════════════════════════════════════════════════════

function initNewsletterForm() {
  const forms = document.querySelectorAll('.newsletter-form');
  
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = form.querySelector('input[type="email"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Subscribing...';
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        submitBtn.innerHTML = 'Subscribed!';
        emailInput.value = '';
        
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 3000);
        
      } catch (error) {
        console.error('Newsletter subscription error:', error);
        submitBtn.innerHTML = 'Error - Try Again';
        
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 3000);
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Animations
// ═══════════════════════════════════════════════════════════════

function initAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  document.querySelectorAll('.card, .portfolio-card, .stat-card, .testimonial-card, .tool-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ═══════════════════════════════════════════════════════════════
// Affiliate Link Tracking
// ═══════════════════════════════════════════════════════════════

function initAffiliateTracking() {
  document.querySelectorAll('a[href*="pxf.io"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const url = link.href;
      const program = url.includes('base44') ? 'Base44' : 'Wix';
      
      console.log(`Affiliate click: ${program}`, url);
      
      if (typeof gtag !== 'undefined') {
        gtag('event', 'affiliate_click', {
          'event_category': 'affiliate',
          'event_label': program,
          'value': 1
        });
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

window.NoCodeLaunchpad = {
  initMobileMenu,
  initScrollHeader,
  initSmoothScroll,
  initNewsletterForm,
  initAnimations,
  initAffiliateTracking,
  debounce,
  formatNumber
};
