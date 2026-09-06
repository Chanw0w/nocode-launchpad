const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.join(__dirname, '..');

describe('SEO Validation', () => {
  test('index.html has proper meta tags', () => {
    const indexPath = path.join(BLOG_DIR, 'index.html');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // Check for title and description in front matter
    expect(content).toContain('title:');
    expect(content).toContain('description:');
  });

  test('_config.yml has site metadata', () => {
    const configPath = path.join(BLOG_DIR, '_config.yml');
    const config = fs.readFileSync(configPath, 'utf8');
    
    // Check for essential SEO fields
    expect(config).toContain('title:');
    expect(config).toContain('description:');
    expect(config).toContain('url:');
  });

  test('blog posts have proper front matter', () => {
    const postsDir = path.join(BLOG_DIR, '_posts');
    if (fs.existsSync(postsDir)) {
      const posts = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
      
      posts.forEach(post => {
        const content = fs.readFileSync(path.join(postsDir, post), 'utf8');
        
        // Check front matter
        expect(content).toMatch(/^---/);
        expect(content).toContain('title:');
        expect(content).toContain('layout:');
      });
    }
  });

  test('robots.txt exists or is generated', () => {
    const robotsPath = path.join(BLOG_DIR, 'robots.txt');
    const siteRobotsPath = path.join(BLOG_DIR, '_site', 'robots.txt');
    
    const exists = fs.existsSync(robotsPath) || fs.existsSync(siteRobotsPath);
    expect(exists).toBe(true);
  });

  test('sitemap is generated', () => {
    const sitemapPath = path.join(BLOG_DIR, '_site', 'sitemap.xml');
    if (fs.existsSync(path.join(BLOG_DIR, '_site'))) {
      expect(fs.existsSync(sitemapPath)).toBe(true);
    }
  });
});
