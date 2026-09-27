// Main JavaScript for NoCode Launchpad
// Designed with Emil Kowalski's Design Engineering Principles

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initMobileMenu();
  initScrollHeader();
  initSmoothScroll();
  initNewsletterForm();
  initAnimations();
  initHaptics();
  initAffiliateTracking();
  initMagneticButtons();
  initRippleEffect();
});

// ═══════════════════════════════════════════════════════════════
// Haptic Feedback (Mobile)
// Emil Kowalski: Unseen details compound
// ═══════════════════════════════════════════════════════════════

function initHaptics() {
  const supportsVibration = 'vibrate' in navigator;
  if (!supportsVibration) return;
  
  const haptics = {
    light: () => navigator.vibrate(10),
    medium: () => navigator.vibrate(20),
    heavy: () => navigator.vibrate(40),
    success: () => navigator.vibrate([30, 50, 30]),
    error: () => navigator.vibrate([50, 30, 50, 30, 50]),
    selection: () => navigator.vibrate(5),
  };
  
  document.addEventListener('click', (e) => {
    const target = e.target.closest('.btn');
    if (!target) return;
    
    if (target.classList.contains('btn-primary')) {
      haptics.success();
    } else {
      haptics.light();
    }
  });
  
  const menuToggle = document.getElementById('mobile-menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      haptics.medium();
    });
  }
  
  document.addEventListener('submit', () => {
    haptics.success();
  });
  
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
// Emil Kowalski: Subtle feedback
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
// Emil Kowalski: Every detail compounds
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
      submitBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" class="spinner">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="50" stroke-dashoffset="50">
            <animate attributeName="stroke-dashoffset" values="50;0" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
        Subscribing...
      `;
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        submitBtn.innerHTML = '✓ Subscribed!';
        submitBtn.style.background = 'var(--color-green)';
        emailInput.value = '';
        
        if (window.haptics) {
          window.haptics.success();
        }
        
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
        }, 3000);
        
      } catch (error) {
        console.error('Newsletter subscription error:', error);
        submitBtn.innerHTML = 'Error - Try Again';
        submitBtn.style.background = 'var(--color-amber)';
        
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
// Emil Kowalski: Intersection Observer for reveal animations
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
  
  document.querySelectorAll('.card, .post-card, .feature-card, .tool-card').forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// ═══════════════════════════════════════════════════════════════
// Magnetic Buttons
// Emil Kowalski: Unseen details compound
// ═══════════════════════════════════════════════════════════════

function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-primary');
  
  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Ripple Effect
// Emil Kowalski: Physical feedback
// ═══════════════════════════════════════════════════════════════

function initRippleEffect() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      
      ripple.style.cssText = `
        position: absolute;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: translate(-50%, -50%);
        pointer-events: none;
        animation: ripple 0.6s ease-out;
      `;
      
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), 600);
    });
  });
  
  // Add ripple keyframes
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ripple {
      to {
        width: 200px;
        height: 200px;
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
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

// Export for use in other scripts
window.NoCodeLaunchpad = {
  initMobileMenu,
  initScrollHeader,
  initSmoothScroll,
  initNewsletterForm,
  initAnimations,
  initHaptics,
  initAffiliateTracking,
  initMagneticButtons,
  initRippleEffect,
  debounce,
  formatNumber
};
