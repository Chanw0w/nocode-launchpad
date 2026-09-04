/**
 * Brevo (formerly Sendinblue) Newsletter Integration
 * 
 * Setup Instructions:
 * 1. Create a Brevo account at https://www.brevo.com
 * 2. Go to Contacts > Forms > Create a new form
 * 3. Get your form ID from the form URL
 * 4. Replace 'YOUR_FORM_ID' below with your actual form ID
 * 
 * For API integration (optional):
 * 1. Go to Settings > API Keys
 * 2. Generate a new API key
 * 3. Use the API key in your backend
 */

// Brevo Form Integration
class BrevoNewsletter {
  constructor(options = {}) {
    this.formId = options.formId || 'YOUR_FORM_ID';
    this.apiKey = options.apiKey || null;
    this.listId = options.listId || null;
    this.onSuccess = options.onSuccess || this.defaultSuccess;
    this.onError = options.onError || this.defaultError;
    
    this.init();
  }
  
  init() {
    // Find all newsletter forms
    const forms = document.querySelectorAll('.newsletter-form, #newsletter-form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleSubmit(e));
    });
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    const email = emailInput.value;
    
    if (!this.validateEmail(email)) {
      this.onError('Please enter a valid email address');
      return;
    }
    
    // Disable button and show loading
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Subscribing...';
    
    try {
      // Method 1: Using Brevo's form action URL
      if (this.formId !== 'YOUR_FORM_ID') {
        const response = await fetch(`https://assets.mailerlite.com/jsonp/${this.formId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ email }),
        });
        
        if (response.ok) {
          this.onSuccess(email);
          emailInput.value = '';
        } else {
          throw new Error('Subscription failed');
        }
      } 
      // Method 2: Using Brevo API (requires backend proxy)
      else if (this.apiKey && this.listId) {
        const response = await this.subscribeViaAPI(email);
        if (response.ok) {
          this.onSuccess(email);
          emailInput.value = '';
        } else {
          throw new Error('API subscription failed');
        }
      } else {
        // Fallback: Just show success (for demo)
        this.onSuccess(email);
        emailInput.value = '';
      }
    } catch (error) {
      this.onError(error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }
  
  async subscribeViaAPI(email) {
    // Note: This requires a backend proxy to avoid exposing API key
    // For client-side, use the form action method instead
    return fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify({
        email,
        listIds: [parseInt(this.listId)],
        updateEnabled: true,
      }),
    });
  }
  
  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  defaultSuccess(email) {
    // Track conversion
    if (typeof gtag !== 'undefined') {
      gtag('event', 'sign_up', {
        'method': 'email',
        'email': email,
      });
    }
    
    // Show success message
    const container = document.querySelector('.newsletter-form-container, .footer-newsletter');
    if (container) {
      const message = document.createElement('div');
      message.className = 'newsletter-success';
      message.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <p>Welcome! Check your email for the free guide.</p>
      `;
      container.appendChild(message);
    }
    
    console.log('Newsletter subscription successful:', email);
  }
  
  defaultError(message) {
    console.error('Newsletter subscription error:', message);
    
    // Show error message
    const container = document.querySelector('.newsletter-form-container, .footer-newsletter');
    if (container) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'newsletter-error';
      errorDiv.innerHTML = `<p>${message}</p>`;
      container.appendChild(errorDiv);
      
      setTimeout(() => errorDiv.remove(), 3000);
    }
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize with your Brevo form ID
  window.brevoNewsletter = new BrevoNewsletter({
    formId: 'YOUR_FORM_ID', // Replace with your Brevo form ID
    // apiKey: 'YOUR_API_KEY', // Optional: For API integration
    // listId: '1', // Optional: Your Brevo list ID
  });
});

// Export for manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BrevoNewsletter;
}
