// Main JavaScript for NoCode Launchpad
// Dark Tech Theme with Haptic Feedback

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initMobileMenu();
  initScrollHeader();
  initSmoothScroll();
  initNewsletterForm();
  initAnimations();
  initHaptics();
  initAffiliateTracking();
});

// ═══════════════════════════════════════════════════════════════
// Haptic Feedback (Mobile)
// ═══════════════════════════════════════════════════════════════

function initHaptics() {
  // Check if Vibration API is supported
  const supportsVibration = 'vibrate' in navigator;
  
  if (!supportsVibration) return;
  
  // Haptic patterns
  const haptics = {
    light: () => navigator.vibrate(10),
    medium: () => navigator.vibrate(20),
    heavy: () => navigator.vibrate(40),
    success: () => navigator.vibrate([30, 50, 30]),
    error: () => navigator.vibrate([50, 30, 50, 30, 50]),
    selection: () => navigator.vibrate(5),
  };
  
  // Add haptic feedback to buttons
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.btn');
    if (!target) return;
    
    if (target.classList.contains('btn-primary')) {
      haptics.success();
    } else {
      haptics.light();
    }
  });
  
  // Add haptic to mobile menu toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      haptics.medium();
    });
  }
  
  // Add haptic to form submissions
  document.addEventListener('submit', () => {
    haptics.success();
  });
  
  // Store haptics globally for use in other scripts
  window.haptics = haptics;
}

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
  
  // Close menu on link click
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
  
  let lastScroll = 0;
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
        
        lastScroll = currentScroll;
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
      
      // Disable button and show loading
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" class="spinner">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-dashoffset="50">
            <animate attributeName="stroke-dashoffset" values="50;0" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        Subscribing...
      `;
      
      try {
        // Here you would typically send to your email service
        // For now, we'll simulate a success
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success
        submitBtn.innerHTML = '✓ Subscribed!';
        submitBtn.style.background = 'var(--color-green)';
        emailInput.value = '';
        
        // Trigger success haptic
        if (window.haptics) {
          window.haptics.success();
        }
        
        // Reset after 3 seconds
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
        
      } catch (error) {
        console.error('Newsletter subscription error:', error);
        submitBtn.innerHTML = 'Error - Try Again';
        submitBtn.style.background = 'var(--color-amber)';
        
        // Trigger error haptic
        if (window.haptics) {
          window.haptics.error();
        }
        
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
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
  // Intersection Observer for fade-in animations
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
  
  // Observe elements
  document.querySelectorAll('.card, .post-card, .feature-card, .tool-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ═══════════════════════════════════════════════════════════════
// Affiliate Link Tracking
// ═══════════════════════════════════════════════════════════════

function initAffiliateTracking() {
  // Track affiliate link clicks
  document.querySelectorAll('a[href*="pxf.io"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const url = link.href;
      const program = url.includes('base44') ? 'Base44' : 'Wix';
      
      // Log to console (replace with analytics)
      console.log(`Affiliate click: ${program}`, url);
      
      // Google Analytics event
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

// Export for use in other scripts
window.NoCodeLaunchpad = {
  initMobileMenu,
  initScrollHeader,
  initSmoothScroll,
  initNewsletterForm,
  initAnimations,
  initHaptics,
  initAffiliateTracking,
  debounce,
  formatNumber
};
