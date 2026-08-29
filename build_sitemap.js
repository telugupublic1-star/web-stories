const fs = require('fs');
const path = require('path');

const storiesDir = __dirname;
const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.html') && f !== 'index.html');

const urls = files.map(file => {
  const stat = fs.statSync(path.join(storiesDir, file));
  const lastmod = stat.mtime.toISOString();
  return `  <url>
    <loc>https://stories.telugupublic.com/${file}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stories.telugupublic.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;

fs.writeFileSync(path.join(storiesDir, 'sitemap.xml'), sitemap, 'utf8');
console.log(`✅ sitemap.xml generated with ${files.length + 1} URLs!`);
