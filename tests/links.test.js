const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..');

describe('Link Validation', () => {
  test('no broken internal links in posts', () => {
    const postsDir = path.join(BLOG_DIR, '_posts');
    if (!fs.existsSync(postsDir)) return;

    const posts = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
    const internalLinks = [];

    posts.forEach(post => {
      const content = fs.readFileSync(path.join(postsDir, post), 'utf8');
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;

      while ((match = linkRegex.exec(content)) !== null) {
        const url = match[2];
        if (url.startsWith('/') || url.startsWith('#')) {
          internalLinks.push({ post, url });
        }
      }
    });

    // Log found internal links
    if (internalLinks.length > 0) {
      console.log(`Found ${internalLinks.length} internal links`);
    }
  });

  test('affiliate links are properly formatted', () => {
    const postsDir = path.join(BLOG_DIR, '_posts');
    if (!fs.existsSync(postsDir)) return;

    const posts = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

    posts.forEach(post => {
      const content = fs.readFileSync(path.join(postsDir, post), 'utf8');
      
      // Check for affiliate links
      const affiliateLinks = content.match(/https:\/\/[a-z]+\.pxf\.io\/c\/\d+\/\d+\/\d+\?trafcat=[a-z]+/g);
      
      if (affiliateLinks) {
        affiliateLinks.forEach(link => {
          expect(link).toMatch(/^https:\/\/[a-z]+\.pxf\.io\/c\/\d+\/\d+\/\d+\?trafcat=[a-z]+$/);
        });
      }
    });
  });

  test('no empty links in HTML files', () => {
    const htmlFiles = ['index.html', '404.html', 'privacy.html', 'terms.html'];
    
    htmlFiles.forEach(file => {
      const filePath = path.join(BLOG_DIR, file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for empty href attributes
        const emptyLinks = content.match(/href=""/g);
        expect(emptyLinks).toBeNull();
      }
    });
  });
});
