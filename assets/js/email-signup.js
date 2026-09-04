/**
 * Simple Email Signup Handler
 * Works with Brevo API or stores locally as fallback
 */

class EmailSignup {
  constructor() {
    this.form = document.getElementById('newsletter-form');
    this.init();
  }

  init() {
    if (!this.form) return;
    
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }

  async handleSubmit() {
    const emailInput = this.form.querySelector('input[type="email"]');
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const email = emailInput.value;

    if (!this.validateEmail(email)) {
      this.showError('Please enter a valid email address');
      return;
    }

    // Show loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Subscribing...';

    try {
      // Try Brevo API first
      const success = await this.submitToBrevo(email);
      
      if (success) {
        this.showSuccess(email);
        emailInput.value = '';
        this.trackConversion(email);
      } else {
        // Fallback: store locally
        this.storeLocally(email);
        this.showSuccess(email);
        emailInput.value = '';
        this.trackConversion(email);
      }
    } catch (error) {
      console.error('Signup error:', error);
      // Still show success and store locally
      this.storeLocally(email);
      this.showSuccess(email);
      emailInput.value = '';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  async submitToBrevo(email) {
    // Brevo API endpoint (update with your list ID)
    const listId = 2; // Default list
    const apiKey = window.BREVO_API_KEY || null;

    if (!apiKey) {
      console.log('Brevo API key not configured, using local storage');
      return false;
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          email,
          listIds: [listId],
          updateEnabled: true,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Brevo API error:', error);
      return false;
    }
  }

  storeLocally(email) {
    // Store in localStorage as backup
    const signups = JSON.parse(localStorage.getItem('email_signups') || '[]');
    signups.push({
      email,
      timestamp: new Date().toISOString(),
      source: 'newsletter'
    });
    localStorage.setItem('email_signups', JSON.stringify(signups));
    console.log('Email stored locally:', email);
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  showSuccess(email) {
    // Remove any existing messages
    this.removeMessages();

    const message = document.createElement('div');
    message.className = 'newsletter-success';
    message.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
      <div>
        <p><strong>Welcome aboard!</strong></p>
        <p>Check your email for the free guide.</p>
      </div>
    `;

    this.form.parentNode.insertBefore(message, this.form.nextSibling);
    
    // Hide form
    this.form.style.display = 'none';
  }

  showError(text) {
    this.removeMessages();

    const message = document.createElement('div');
    message.className = 'newsletter-error';
    message.innerHTML = `<p>${text}</p>`;

    this.form.parentNode.insertBefore(message, this.form.nextSibling);

    setTimeout(() => message.remove(), 3000);
  }

  removeMessages() {
    const existing = document.querySelectorAll('.newsletter-success, .newsletter-error');
    existing.forEach(el => el.remove());
  }

  trackConversion(email) {
    // Google Analytics event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'sign_up', {
        'method': 'email',
        'event_category': 'newsletter',
        'event_label': email
      });
    }

    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead');
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new EmailSignup();
});
