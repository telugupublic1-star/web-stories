# Telugu Public Web Stories — Architecture, Best Practices & Ad Placements Guide

This document is the master engineering and editorial standard for all Web Stories on [stories.telugupublic.com](https://stories.telugupublic.com). It reflects official specifications from **Google Search Central**, the **AMP Project (`amp.dev`)**, and **Google AdSense Help**.

---

## 1. Google AdSense Monetization & Ad Placement Standards

Web Stories use the `<amp-story-auto-ads>` component. Unlike regular web pages, **manual banner ads are strictly prohibited** by Google in Web Stories. The AMP runtime dynamically inserts full-screen interstitial ads between story pages.

### Required Ad Configuration
Every Web Story `<amp-story>` element must include `<amp-story-auto-ads>` containing **both** your publisher ID and your responsive display ad slot:

```html
<amp-story-auto-ads>
  <script type="application/json">
  {
    "ad-attributes": {
      "type": "adsense",
      "data-ad-client": "ca-pub-4638319772065994",
      "data-ad-slot": "1625885899"
    }
  }
  </script>
</amp-story-auto-ads>
```

### Optimal Page Count for Ad Delivery (7 to 10 Pages)
- **The Ad Delivery Algorithm**: The AMP auto-ad algorithm inserts the first ad **after page 2 or 3**, and reserves space before the final CTA page to avoid annoying users.
- **Minimum Threshold**: Stories with only **4 to 5 pages** will almost **never** serve ads because there is insufficient content distance.
- **Rule**: Every story authored for Telugu Public should contain **7 to 10 slides** (Cover + 5–8 informative content slides + 1 final CTA slide).

---

## 2. Visual Layout & Text Placement (Unobstructed Artwork)

### Dynamic Text Placement & Unobstructed Artwork Architecture
Background images must never be obscured by centered, opaque popup dialog boxes. The layout dynamically places text at the **top** or **bottom** depending on where the artwork's subject sits:

1. **Dynamic Grid Alignment Classes**:
   ```css
   /* Dock to bottom with negative space */
   amp-story-grid-layer.bottom {
     align-content: end;
     justify-content: flex-end;
     padding-bottom: 24px;
   }
   /* Dock to top when artwork/subject sits at the bottom */
   amp-story-grid-layer.top {
     align-content: start;
     justify-content: flex-start;
     padding-top: 55px; /* Leaves clearance for AMP story progress bar */
   }
   amp-story-grid-layer.center {
     align-content: center;
     justify-content: center;
   }
   ```

2. **Ultra-Translucent Frosted Glass Card (`.tp-card`)**:
   ```css
   .tp-card {
     background: rgba(15, 23, 42, 0.28);
     backdrop-filter: blur(8px);
     -webkit-backdrop-filter: blur(8px);
     border: 1px solid rgba(255, 255, 255, 0.16);
     border-radius: 16px;
     padding: 12px 16px 14px 16px;
     margin: 0 10px 10px 10px;
     color: #ffffff;
     box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
     text-shadow: 0 1px 4px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.85);
   }
   ```
   *Result*: The card acts as a sleek, ultra-translucent frosted glass overlay that reveals the full photographic depth while keeping Telugu typography (`Mandali` font) razor-sharp.

3. **Dynamic Directional Scrim Overlays**:
   - For bottom-docked slides: `.gradient-overlay` (subtle shading at bottom 30%).
   - For top-docked slides: `.gradient-overlay.top` (subtle shading at top 30%).
   - Neither gradient blocks the opposite half of the background visual.

---

## 3. Safe Zones & System Controls

- **Top Safe Zone (75px)**: The top 75px of every Web Story is reserved for system controls (story progress bar, publisher logo, story title, mute button, and share icon). Never place text or brand badges at the top edge.
- **Bottom Safe Zone (60px)**: The bottom 60px is reserved for the native outlink swipe bar or device navigation bar.
- **Tap Navigation Conflict**: Never place custom `<a>` buttons floating in the middle of slides. Use `<amp-story-page-outlink>` anchored at the bottom of the final slide.

---

## 4. Navigation & Slide Timing (`auto-advance-after`)

- **Content Pages (Slides 1 through N-1)**:
  - `auto-advance-after="7s"` (allows readers comfortable time to absorb 2–3 concise bullet points).
- **Final CTA Page**:
  - **NEVER** add `auto-advance-after` on the final conclusion/CTA slide.
  - The final slide must stay open indefinitely until the user taps the link or swipes away.

---

## 5. Google Discover & Search Metadata Checklist

Every story `<head>` must include:
1. `<link rel="canonical" href="https://stories.telugupublic.com/<slug>.html">` (Self-canonical).
2. `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">`
3. Complete Open Graph Tags (`og:type`, `og:title`, `og:description`, `og:url`, `og:site_name`, `og:image`, `og:image:width`, `og:image:height`).
4. Complete Twitter Card Tags (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`).
5. Schema.org `NewsArticle` or `Article` JSON-LD with `headline`, `image`, `datePublished`, `dateModified`, `author`, `publisher`, and `logo`.
6. `<amp-story>` attributes:
   - `supports-landscape`: Enables desktop full-bleed mode and tablet/mobile landscape viewing.
   - `title`: Short and catchy (< 70 characters recommended by Google).
   - `publisher="Telugu Public"`
   - `publisher-logo-src="https://stories.telugupublic.com/TeluguPublic.png"` (1:1, 500x500px).
   - `poster-portrait-src` (3:4 ratio, >= 640x853px).
   - `poster-square-src` (1:1 ratio, >= 640x640px).
   - `poster-landscape-src` (16:9 ratio, >= 853x640px).

---

## 6. CLI Commands for Developers & Agents

- **Validate all stories**:
  ```bash
  npm run validate
  ```
  Runs official AMPHTML validator and Google metadata audit in batch mode (tests all 15 stories in ~6 seconds).

- **Rebuild sitemap & feed**:
  ```bash
  npm run build
  ```
  Regenerates `sitemap.xml` with Google image tags and `stories.json` for the main `telugupublic.com` website.
