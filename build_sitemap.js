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

const storiesData = [];

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

  // Extract poster image
  const posterMatch = content.match(/poster-portrait-src="([^"]+)"/);
  const posterUrl = posterMatch && posterMatch[1] ? posterMatch[1] : 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=450&h=750&fit=crop';

  // Extract title
  let title = file.replace(/-/g, ' ').replace('.html', '');
  const titleMatch = content.match(/<title>([^<|]+)/);
  if (titleMatch && titleMatch[1]) {
    title = titleMatch[1].trim();
  }

  // Extract brand / category
  let category = 'ఆరోగ్యం';
  let badgeClass = 'badge-health';
  if (file.includes('vratham') || file.includes('raksha') || file.includes('festival')) {
    category = 'పండుగలు';
    badgeClass = 'badge-festival';
  } else if (file.includes('narasimha') || file.includes('ashtottaram') || file.includes('spiritual') || file.includes('hanuman')) {
    category = 'ఆధ్యాత్మికం';
    badgeClass = 'badge-devotional';
  } else if (file.includes('kisan') || file.includes('schemes') || file.includes('govt')) {
    category = 'ప్రభుత్వ పథకాలు';
    badgeClass = 'badge-schemes';
  } else if (file.includes('appsc') || file.includes('job') || file.includes('education')) {
    category = 'ఉద్యోగాలు';
    badgeClass = 'badge-jobs';
  } else if (file.includes('mutual') || file.includes('sip') || file.includes('finance') || file.includes('stock') || file.includes('upi') || file.includes('atm')) {
    category = 'ఫైనాన్స్';
    badgeClass = 'badge-finance';
  }

  storiesData.push({
    title,
    category,
    badgeClass,
    url: `https://stories.telugupublic.com/${file}`,
    image: posterUrl,
    date: lastmod
  });

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

// 1. Generate sitemap.xml
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

// Sort stories newest first by date
storiesData.sort((a, b) => new Date(b.date) - new Date(a.date));

// 2. Generate stories.json (Dynamic Feed for Main Website)
fs.writeFileSync(path.join(storiesDir, 'stories.json'), JSON.stringify(storiesData, null, 2), 'utf8');

console.log(`✅ sitemap.xml generated with ${files.length + 1} URLs!`);
console.log(`✅ stories.json dynamic feed generated with ${storiesData.length} stories!`);
