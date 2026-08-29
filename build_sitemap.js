const fs = require('fs');
const path = require('path');

const storiesDir = __dirname;
const files = fs.readdirSync(storiesDir)
  .filter(f => f.endsWith('.html') && f !== 'index.html')
  .sort((a, b) => {
    const statA = fs.statSync(path.join(storiesDir, a));
    const statB = fs.statSync(path.join(storiesDir, b));
    return statB.mtimeMs - statA.mtimeMs; // newest first
  });

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

const urls = files.map(file => {
  const filePath = path.join(storiesDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const stat = fs.statSync(filePath);

  // Extract modification or publication date if available in JSON-LD
  let lastmod = stat.mtime.toISOString().split('T')[0];
  const dateMatch = content.match(/"dateModified":\s*"([^"]+)"/) || content.match(/"datePublished":\s*"([^"]+)"/);
  if (dateMatch && dateMatch[1]) {
    lastmod = dateMatch[1].split('T')[0];
  }

  // Extract poster image for Google Discover Image Sitemap if present
  const posterMatch = content.match(/poster-portrait-src="([^"]+)"/);
  const imageTag = posterMatch && posterMatch[1] ? `
    <image:image>
      <image:loc>${escapeXml(posterMatch[1])}</image:loc>
    </image:image>` : '';

  return `  <url>
    <loc>https://stories.telugupublic.com/${file}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>${imageTag}
  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://stories.telugupublic.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`;

fs.writeFileSync(path.join(storiesDir, 'sitemap.xml'), sitemap, 'utf8');
console.log(`✅ Dynamic sitemap.xml successfully generated with ${files.length + 1} URLs!`);
