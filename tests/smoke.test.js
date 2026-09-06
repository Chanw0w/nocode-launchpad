const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..');
const SITE_DIR = path.join(BLOG_DIR, '_site');

describe('Smoke Tests', () => {
  beforeAll(() => {
    // Check if _site directory exists
    if (!fs.existsSync(SITE_DIR)) {
      console.warn('Warning: _site directory not found. Run `bundle exec jekyll build` first.');
    }
  });

  test('index.html exists in built site', () => {
    const indexPath = path.join(SITE_DIR, 'index.html');
    if (fs.existsSync(SITE_DIR)) {
      expect(fs.existsSync(indexPath)).toBe(true);
    }
  });

  test('404.html exists in source', () => {
    const notFoundPath = path.join(BLOG_DIR, '404.html');
    expect(fs.existsSync(notFoundPath)).toBe(true);
  });

  test('privacy page exists in source', () => {
    const privacyPath = path.join(BLOG_DIR, 'privacy.html');
    expect(fs.existsSync(privacyPath)).toBe(true);
  });

  test('terms page exists in source', () => {
    const termsPath = path.join(BLOG_DIR, 'terms.html');
    expect(fs.existsSync(termsPath)).toBe(true);
  });

  test('_config.yml exists and is valid', () => {
    const configPath = path.join(BLOG_DIR, '_config.yml');
    expect(fs.existsSync(configPath)).toBe(true);
    
    const config = fs.readFileSync(configPath, 'utf8');
    expect(config).toContain('title:');
    expect(config).toContain('description:');
    expect(config).toContain('url:');
  });

  test('main CSS file exists', () => {
    const cssPath = path.join(BLOG_DIR, 'assets/css/main.css');
    expect(fs.existsSync(cssPath)).toBe(true);
  });

  test('main JS file exists', () => {
    const jsPath = path.join(BLOG_DIR, 'assets/js/main.js');
    expect(fs.existsSync(jsPath)).toBe(true);
  });
});
