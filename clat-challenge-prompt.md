# ÉCLAT — 奢侈品电商网站

> 由 **[Your Name]** 出品 · WorkBuddy × Tencent EdgeOne AI Prompts × Skills 挑战赛参赛作品

## 🎬 Demo

[添加 Demo GIF 或截图]

> 🖼️ 静态封面：[查看原图](./demo.png)

## 📌 作品信息

| 字段 | 内容 |
|---|---|
| 作品名称 | ÉCLAT |
| 类型 | 奢侈品电商网站（珠宝、香水、手袋） |
| 技术栈 | React + Vite + TypeScript + Tailwind CSS + shadcn/ui + Edge Functions |
| 出品方 | [Your Name] |

## 📝 作品介绍

ÉCLAT 是一个奢侈品电商网站，涵盖珠宝、香水、手袋等品类。设计风格以暗黑奢华为主调，搭配香槟金色调，呈现精致高端的视觉体验。页面展示品牌故事、产品系列、用户评价等模块，通过流畅的动效和精美的排版，为用户带来沉浸式的奢侈品购物体验。

---

## 🚀 完整 Prompt（直接复制以下内容喂给 AI 编程工具）

```
Build a luxury ecommerce website in English using React + Vite + TypeScript + Tailwind CSS + shadcn/ui.

GOAL
Create a premium homepage for a luxury brand called ÉCLAT that sells jewelry, perfume, and handbags.

The site should feel like a shoppable art exhibition inspired by museum aesthetics:
- dark
- elegant
- cinematic
- sophisticated
- collectible

This is not a generic ecommerce template, not a SaaS landing page, and not a fashion campaign collage.

The website must use EdgeOne Pages Edge Functions for lightweight backend functionality.

ASSETS
Use the following remote CDN assets directly. Do not copy them into local public/media/.

CDN base:
https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/

Media URLs:
- Hero video: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/hero.mp4
- Brand Story video: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Maison%20Story.mp4
- Brand Story poster: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Maison%20Story.png
- Craftsmanship video: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Craftsmanship%20%20Stats.mp4
- Closing CTA video: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Closing%20CTA.mp4
- Closing CTA poster: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Closing%20CTA.png
- Pearls Collection: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Pearls%20Collection.png
- Fine Jewelry: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/Fine%20Jewelry%20Collection.png
- High Jewelry: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/High%20Jewelry%20Collection.png
- Product images: https://cdnstatic.tencentcs.com/edgeone/pages/product-activities/jewelry/[Product%20Name].png

BRAND RULES
Brand name: ÉCLAT

Color world:
- deep Prussian blue-black
- ultramarine silk blue
- pearl ivory
- muted champagne gold

Luxury rule:
All visuals must feel expensive, curated, and timeless.
Do not use:
- recognizable luxury brand logos
- neon or sci-fi lighting
- startup aesthetics
- loud commercial styling
- collage-style layouts

TECH STACK
- React
- Vite
- TypeScript
- Tailwind CSS
- shadcn/ui
- lucide-react
- motion / framer-motion
- tailwindcss-animate

═════════════════════════════════════════════════
SHARED HOOKS
═════════════════════════════════════════════════

Create reusable hooks for common patterns:

1. useLazyVideo (src/hooks/useLazyVideo.ts)
- Returns a `videoRef` (React ref to HTMLVideoElement)
- Uses IntersectionObserver with `rootMargin: '300px'` to observe the video element
- When the video enters the viewport, call `videoRef.current.play()` (ignore AbortError)
- When the video leaves the viewport, call `videoRef.current.pause()`
- Cleanup observer on unmount
- All background videos (Hero, BrandStory, Craftsmanship, CTA) MUST use this hook so only visible videos actually play. Prevents mobile Safari throttling of concurrent autoplay and saves bandwidth.

Implementation:

```typescript
// src/hooks/useLazyVideo.ts
import { useEffect, useRef } from 'react';

export function useLazyVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {}); // Ignore AbortError
          } else {
            video.pause();
          }
        });
      },
      { rootMargin: '300px' }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
    };
  }, []);

  return videoRef;
}
```

2. BlurText (src/components/BlurText.tsx)
- Word-by-word blur-to-clear animation
- Each word animates from `filter: blur(10px)` to `filter: blur(0px)`
- Also animates `opacity: 0 → 1` and `y: 50 → 0`
- Staggered delay: 100ms per word
- Uses framer-motion `motion` component
- Only animates once when entering viewport (uses `useInView` from framer-motion)

Implementation:

```tsx
// src/components/BlurText.tsx
import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface BlurTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export function BlurText({ text, className = '', delay = 0 }: BlurTextProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '100px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  const words = text.split(' ');

  useState(() => {
    if (isInView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [isInView, hasAnimated]);

  return (
    <div ref={ref} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
          animate={hasAnimated ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: delay + index * 0.1, ease: 'easeOut' }}
          style={{ display: 'inline-block', marginRight: '0.3em' }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}
```

FONTS
Use Google Fonts:
- Cormorant Garamond (500, 600, 700, italic) for headings
- Manrope (300, 400, 500, 600) for body text

Tailwind font families:
- heading: ["Cormorant Garamond", "serif"]
- body: ["Manrope", "sans-serif"]

CSS VARIABLES
Define these in src/index.css:

:root {
  --background: 220 34% 6%;
  --foreground: 35 28% 95%;
  --primary: 41 42% 74%;
  --primary-foreground: 220 34% 6%;
  --muted-foreground: 35 12% 72%;
  --border: 35 25% 92% / 0.14;
  --card: 220 24% 10%;
  --radius: 0px;
}

GLASS COMPONENTS
Create reusable component styles in @layer components:

.luxury-glass
- background: rgba(255,255,255,0.03)
- backdrop-filter: blur(10px) saturate(120%)
- border: 1px solid rgba(255,255,255,0.08)
- box-shadow: inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 40px rgba(0,0,0,0.22)
- position: relative
- overflow: hidden
- subtle luxury gradient border effect using ::before

NON-NEGOTIABLE LAYOUT RULES
The site may feel editorial and cinematic, but the layout itself must remain stable, structured, and production-grade.

Do not do any of the following:
- no overlapping collage layouts
- no floating image clusters
- no negative margins for decorative offset
- no staggered text/image misalignment
- no sticky split editorial panels
- no freeform magazine-style composition
- no text drifting outside its wrapper
- no cards breaking grid alignment
- no decorative motion affecting layout flow

Global layout rules:
- Use one centered content container for all non-full-bleed content
- Max width: 1280px
- Horizontal padding: px-6 md:px-10 lg:px-16
- Use mx-auto consistently
- Standard section spacing: py-24 md:py-32
- Keep vertical rhythm consistent
- Keep headings, body copy, and CTA groups inside predictable wrappers

Media rules:
- Background media must be absolute inset-0 only
- Foreground content must be inside a separate relative z-10 wrapper
- Background media uses object-cover
- Media sections must keep stable heights
- Cards and grids remain in normal document flow

Grid rules:
- Collections: 1 col mobile, 2 col tablet, 3 equal-width cards desktop
- Products: 2 col mobile, 3 col desktop
- Testimonials: 1 col mobile, 3 col desktop
- Stats: 2 col mobile, 4 col desktop

Aspect ratio rules:
- Collection cards: 4:5
- Product cards: 4:5
- Keep card heights consistent within the same row
- Do not mix random heights

Responsiveness:
- Intentionally design mobile, tablet, desktop
- Prevent overflow, collisions, broken nav, or drifting CTAs
- Check 390px, 768px, 1024px, 1440px

Final layout priority:
If artistic direction conflicts with layout stability, choose layout stability.

SITE STRUCTURE
Build exactly 9 main sections in this order.

SECTION 1 — FIXED NAVBAR
Structure:
- fixed top navbar
- content inside max-width container
- left: circular monogram É in museum-glass
- center: nav pill with links (New Arrivals, Collections, Maison, Craft, Appointment)
- right: primary CTA button (Shop the Collection)

Behavior:
- transparent at top
- gently darkens on scroll
- stable 3-part layout
- do not let center nav collide with CTA on smaller screens

SECTION 2 — HERO
Height: min-h-[1000px]

Background:
- use Hero video
- full-bleed background media
- subtle dark overlay
- bottom fade gradient

Foreground:
- centered max-width wrapper
- stable vertical spacing
- no floating foreground composition

Content:
- badge: New + The Pearl Reimagined
- headline: Where Masterpiece Meets Desire
- subtext: A maison of pearls, diamonds, and sculpted light — inspired by silence, devotion, and the unforgettable magnetism of the gaze.
- CTA 1: Shop High Jewelry
- CTA 2: Book a Private Appointment
- prestige line: Pearls. Diamonds. Objects of devotion.

Animation:
- gentle blur-to-clear reveal for headline
- fade-up for paragraph and CTA row
- slow, tasteful, no bounce

SECTION 3 — BRAND STORY
Background:
- use Brand Story video
- use Brand Story poster as fallback
- full-width background media
- top and bottom dark fades

Foreground layout:
- centered wrapper
- compact text block
- no split layout
- no staggered overlays
- no editorial offset composition

Content:
- badge: Our Maison
- heading: A study in light, rarity, and restraint.
- subtext: Born from the poetry of old-master portraiture, each piece is designed to feel collected, not consumed — treasured not for trend, but for atmosphere, memory, and permanence.
- CTA: Discover the Story

Mood:
- quiet
- elegant
- cinematic
- like the Hero world expanding into a still-life room

SECTION 4 — SIGNATURE COLLECTIONS
Use a clean responsive grid, not editorial staggered rows.

Layout:
- 1 column on mobile
- 2 columns on tablet
- 3 equal-width cards on desktop
- consistent heights and spacing

Images:
- Pearls Collection
- Fine Jewelry Collection
- High Jewelry Collection

Card copy:
- Pearls — Round, luminous, and quietly commanding.
- Fine Jewelry — Diamond fire, rendered with discipline.
- High Jewelry — Collector pieces for evening, memory, and ceremony.

Buttons:
- Explore Pearls
- View Fine Jewelry
- Enter High Jewelry

SECTION 5 — FEATURED PRODUCTS GRID
Use a clean ecommerce product grid.

Layout:
- 2 columns on mobile
- 3 columns on desktop
- consistent card height
- clean typography
- restrained hover effects only

Products:
- Lune Pearl Drop — Round Cultured Pearl / 18k Gold — $1,280
- Noir Halo Stud — Diamond / White Gold — $2,450
- Atelier Ribbon Collar — Pearl / Sapphire / Gold — $4,800
- Velours Earring — South Sea Pearl / Diamond — $3,900
- Eclipse Ring — Pearl / Diamond / Gold — $1,960
- Nocturne Cuff — Brushed Gold / Pearl — $2,780

Each card includes:
- image
- product name
- material line
- price
- button: View Piece
- view counter (from KV Storage)

SECTION 6 — CRAFTSMANSHIP / TRUST STATS
Background:
- use Craftsmanship / Stats video
- if video fails, fall back to dark Prussian-black background

Foreground layout:
- one centered stats panel only
- keep all four stats inside one structured luxury-glass card
- do not scatter metrics across the section

Content:
- badge: Craft & Trust
- heading: Precision you can feel before you can name it.
- subtext: From nacre to setting, every detail is shaped to preserve rarity, comfort, and enduring value.

Stats:
- 18k — Solid gold craftsmanship
- VS+ — Selected diamond clarity
- 100% — Certified authenticity
- Worldwide — White-glove delivery

Visual rule:
- darker
- more material-driven
- more technical
- still calm and readable

SECTION 7 — TESTIMONIALS / EDITORIAL VOICES
Layout:
- 1 column mobile
- 3 columns desktop
- calm grid
- no video

Badge:
- Editorial Voices

Heading:
- Admired in private. Remembered in public.

Testimonials:
- "The kind of jewelry that changes the posture of the person wearing it." — Elisa Moreau, Fashion Editor
- "Every piece feels less like a purchase and more like an acquisition." — Nina Hart, Collector
- "Quiet, exacting, unforgettable — luxury without performance." — Camille Ross, Creative Director

SECTION 8 — CLOSING CTA + FOOTER
Background:
- use Closing CTA video
- use Closing CTA poster as fallback

Foreground layout:
- one narrow centered column for heading, subtext, buttons
- footer in a separate bottom row inside a max-width container
- no overlap between CTA content and footer
- footer must remain darker and more readable than the central CTA area

Content:
- heading: Enter the maison.
- subtext: Discover the collection, or book a private appointment for a more intimate way to explore the pieces.
- CTA 1: Shop the Collection
- CTA 2: Book Appointment

Footer:
- left: © 2026 ÉCLAT
- right links: Shipping, Returns, Care, Contact

EDGE FUNCTIONS
Use EdgeOne Pages Edge Functions.

Create these endpoints:
- edge-functions/api/site-content.js
- edge-functions/api/collections.js
- edge-functions/api/products.js
- edge-functions/api/products/[slug].js (view counter)
- edge-functions/api/private-appointment.js
- edge-functions/api/health.js

API REQUIREMENTS

GET /api/site-content
Return JSON for:
- brand name
- nav links
- hero copy
- section labels
- testimonial content
- footer links

GET /api/collections
Return:
- title
- subtitle
- image path
- href

GET /api/products
Return:
- name
- material
- price
- image path
- slug
- views (from KV Storage)

POST /api/products/[slug]/view
Increment view counter in KV Storage

POST /api/private-appointment
Accept:
- name
- email
- preferredDate
- message

Validate payload and return:
{
  "success": true,
  "requestId": "APT-...",
  "message": "Your private appointment request has been received."
}

GET /api/health
Return:
{ "ok": true }

FRONTEND DATA RULE
Do not hardcode all content directly inside React components.
Use APIs for:
- collections
- products (with view counts)
- part of site content
- appointment submission

Use sensible loading states.

IMPLEMENTATION NOTES
- Use the EdgeOne Pages skill from:
  https://github.com/edgeone-pages/edgeone-pages-skills
- Follow the EdgeOne Pages skill rules during setup and deployment.
- Before login, ask whether to use the China site or the Global site.
- After the project is built and verified locally, deploy it to EdgeOne Pages.
- Use KV Storage for:
  - User sessions
  - Product view counts
  - Appointment requests

TECHNICAL REQUIREMENTS
- TypeScript everywhere
- clean component structure
- semantic HTML
- accessible alt text and labels
- visible focus states
- lucide-react icons
- motion / framer-motion for restrained entrance animation
- no bouncy animation
- use tailwindcss-animate
- reusable media config mapping
- reusable BackgroundMedia component
- reusable button and section badge components

RECOMMENDED COMPONENTS
- NavBar
- HeroSection
- BrandStorySection
- SignatureCollectionsSection
- FeaturedProductsSection
- CraftSection
- TestimonialsSection
- ClosingCTASection
- Footer
- BackgroundMedia
- SectionBadge
- GlassButton
- AppointmentDialog or AppointmentDrawer

═════════════════════════════════════════════════
KEY PATTERNS
═════════════════════════════════════════════════

- Section badges: `luxury-glass rounded-full px-3.5 py-1 text-xs font-medium text-white font-body inline-block mb-4`
- Section headings: `text-4xl md:text-5xl lg:text-6xl font-heading italic text-white tracking-tight leading-[0.9]`
- All videos: HTML5 `<video>` (autoPlay, loop, muted, playsInline, object-cover) — MP4, NOT HLS
- All background videos MUST use `useLazyVideo` hook
- All background videos include `poster` attribute for fallback
- Video fades: 200px, linear-gradient(to bottom/top, black, transparent)
- Outer wrapper: `bg-black overflow-visible`
- Every image: `object-cover` + container `overflow-hidden` + rounded radius
- Anchor navigation: native smooth scrolling (scroll-behavior: smooth + scroll-padding-top: 80px on html)
- Respect `prefers-reduced-motion` on all motion components
- All external media from CDN base URL (do not copy to local)
- Loading states: use <LoadingSpinner> for sections, <ErrorMessage> for API errors
- Product cards: consistent aspect ratio (4:5), restrained hover effects only
- KV Storage keys: `product-views:<slug>` (integer, increment on view)

═════════════════════════════════════════════════
ENVIRONMENT CONSTRAINT
═════════════════════════════════════════════════

The generated website MUST work under the following environment constraints.

DEVELOPMENT ENVIRONMENT
- Node.js: >= 18.0.0 (LTS recommended)
- npm: >= 9.0.0 (or yarn/pnpm equivalent)
- Vite: >= 5.0.0
- TypeScript: >= 5.0.0
- EdgeOne Pages CLI: latest (install via `npm install -g edgeone@latest`)

BROWSER COMPATIBILITY
Must work correctly in:
- Chrome/Chromium 90+ (desktop & mobile)
- Firefox 90+
- Safari 15+ (desktop & iOS)
- Edge 90+

Critical browser-specific rules:
- iOS Safari: videos MUST use `useLazyVideo` hook (prevents autoplay blocking)
- Safari: backdrop-filter requires -webkit- prefix fallback
- Firefox: `aspect-ratio` CSS is supported (no polyfill needed)
- All browsers: test `prefers-reduced-motion` respect

DEVICE COMPATIBILITY
Must be fully functional on:
- iOS devices (iPhone/iPad, Safari mobile)
- Android devices (Chrome mobile)
- Desktop (Windows, macOS, Linux)
- Tablet (iPad, Android tablets)

Touch requirements:
- All buttons: min 44x44px touch target
- No hover-only interactions (must work on touch)
- Swipe/scroll must be smooth (no jank)
- Form inputs: mobile keyboard must not break layout

NETWORK REQUIREMENTS
CDN assets:
- All media from `https://cdnstatic.tencentcs.com/...`
- Assume CDN is always available (do NOT add CDN failure handling)
- Optimize for slow 3G (test with Chrome DevTools)

API requirements:
- Edge Functions must respond within 10 seconds
- KV Storage operations: expect < 100ms latency
- Graceful handling: show loading states, not blank screens

DEPLOYMENT ENVIRONMENT
EdgeOne Pages constraints:
- Edge Functions: V8 runtime (NO Node.js built-in modules)
  - ❌ DO NOT USE: `fs`, `path`, `crypto`, `http`, `net`, `os`
  - ✅ USE INSTEAD: Web APIs (`Request`, `Response`, `fetch`, `console`)
- KV Storage: available via global variables (e.g., `EDGEONE_KV`)
- Build output: `dist/` directory (Vite default)
- Node.js version on build: 18.x (EdgeOne default)

RUNTIME CONSTRAINTS
Edge Functions V8 runtime limitations:
- No `require()` — use ES modules (`import`)
- No `__dirname` or `__filename`
- No binary npm packages (must be pure JavaScript)
- Max execution time: 10 seconds
- Max memory: 128 MB
- KV Storage: key max 512 bytes, value max 25 MB

RESPONSIVE BREAKPOINTS
Must test at these exact widths:
- 390px (iPhone 12/13/14 Mini)
- 428px (iPhone 12/13/14 Pro Max)
- 768px (iPad Mini)
- 1024px (iPad Air/Pro)
- 1440px (standard desktop)
- 1920px (large desktop)

At each breakpoint, verify:
- No horizontal overflow (no x-axis scrollbar)
- No overlapping elements
- Text remains readable (no tiny fonts)
- Buttons remain clickable (no accidental overlaps)

ACCESSIBILITY REQUIREMENTS
Must meet WCAG AA standards:
- Color contrast ratio: ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- All images: have `alt` text (descriptive, not "image")
- All buttons: have `aria-label` if icon-only
- Keyboard navigation: all interactive elements reachable via `Tab`
- Focus states: visible (not `outline: none`)

PERFORMANCE BUDGET
Target metrics (test with Lighthouse):
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Total Blocking Time (TBT): < 200ms
- Cumulative Layout Shift (CLS): < 0.1
- Lighthouse Performance score: ≥ 80
- Lighthouse Accessibility score: ≥ 90

Optimization rules:
- Videos: lazy-loaded via `useLazyVideo` (only play when visible)
- Images: `object-cover` with explicit width/height (prevents CLS)
- Fonts: use `font-display: swap` (Google Fonts default)
- Animations: use `transform` and `opacity` only (GPU-accelerated)

═════════════════════════════════════════════════
FINAL QUALITY BAR
═════════════════════════════════════════════════

The generated website MUST pass ALL of the following quality checks.

❌ THE RESULT MUST NOT LOOK LIKE:

Visual Red Flags:
- a generic Shopify theme with luxury images dropped in
- a SaaS landing page (too much white space, generic CTA buttons)
- a loud fashion campaign (neon colors, collage layouts, chaotic composition)
- a tech demo (placeholder content, unpolished spacing, debug UI visible)
- an experimental art project (overlapping elements, unreadable text, no clear navigation)
- a travel brochure (too many bright colors, casual typography)

Technical Red Flags:
- layout breaks at 390px, 768px, 1024px, or 1440px
- videos autoplay without lazy loading (useLazyVideo not implemented)
- hardcoded content instead of API calls
- TypeScript errors or `any` type usage
- missing loading states or error handling
- console errors related to missing assets or API failures

✅ THE RESULT MUST LOOK LIKE:

Visual Excellence:
- a luxury brand homepage (like Celine, Loewe, or Hermès)
- a shoppable art exhibition (museum aesthetics, curated feeling)
- dark, controlled, elegant, and memorable
- premium enough to feel like a real $10M+ revenue brand site
- structurally stable across ALL screen sizes
- intentional white space (negative space) that feels expensive

Technical Excellence:
- Zero TypeScript errors (strict mode enabled)
- Zero layout breaks at any viewport (390px → 1440px+)
- Smooth, intentional animations (no bouncy, no cheesy)
- Proper loading states for all API-driven content
- Graceful fallbacks for video/poster images
- Semantic HTML with proper ARIA labels
- Accessible color contrast (WCAG AA minimum)

Performance & Responsiveness:
- Videos lazy-load correctly (only play when in viewport)
- Images use object-cover with proper aspect ratios
- No horizontal overflow on mobile (390px)
- Navbar functional and styled at all breakpoints
- Touch-friendly on mobile (tap targets ≥ 44px)

Code Quality:
- Reusable components (no 200+ line components)
- Shared hooks implemented (useLazyVideo, BlurText)
- Consistent naming conventions (camelCase TS/TSX, kebab-case CSS)
- No hardcoded API URLs (use environment variables or config)
- Edge Functions follow V8 runtime constraints (no Node.js modules)

Animation Quality:
- Entrance animations use blur-to-clear or fade-up only
- No bounce, no spring, no elastic effects
- Animations respect `prefers-reduced-motion`
- Video transitions use gradient fades (not hard cuts)

Content & Data:
- Products display view counts from KV Storage
- API endpoints return proper JSON (not HTML errors)
- Site content loads from /api/site-content (not hardcoded)
- Footer links are functional (not # placeholders)

Final Verification Checklist:
1. ✅ Run `npm run dev` — no console errors
2. ✅ Test at 390px — no horizontal scroll, no overlapping text
3. ✅ Test at 768px — tablet layout stable, nav functional
4. ✅ Test at 1024px — desktop layout correct
5. ✅ Test at 1440px — large screen layout doesn't break
6. ✅ Scroll to Hero, Brand Story, Craft sections — videos play only when visible
7. ✅ Click "View Piece" on a product — view count increments in KV
8. ✅ Submit private appointment form — receives success response
9. ✅ Check /api/health — returns `{ "ok": true }`
10. ✅ Lighthouse score ≥ 80 (Performance), ≥ 90 (Accessibility)

If ANY of the above checks fail, the result is NOT acceptable.
Redo the failing sections until all checks pass.

DELIVERY REQUIREMENT
After building:
1. run locally (`npm run dev`)
2. verify layout at multiple breakpoints (390px, 768px, 1024px, 1440px)
3. verify media loading and fallback behavior
4. verify API wiring (products with view counts)
5. test navbar behavior on scroll
6. run `npm run build` to ensure production build succeeds
7. deploy according to the implementation notes above
8. verify deployed site matches local version

```

---

## 附录：项目结构

```
eclat-luxury/
├── src/
│   ├── components/
│   │   ├── NavBar.tsx
│   │   ├── HeroSection.tsx
│   │   ├── BrandStorySection.tsx
│   │   ├── SignatureCollectionsSection.tsx
│   │   ├── FeaturedProductsSection.tsx
│   │   ├── CraftSection.tsx
│   │   ├── TestimonialsSection.tsx
│   │   ├── ClosingCTASection.tsx
│   │   ├── Footer.tsx
│   │   ├── BackgroundMedia.tsx
│   │   ├── SectionBadge.tsx
│   │   └── GlassButton.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── edge-functions/
│   ├── api/
│   │   ├── site-content.js
│   │   ├── collections.js
│   │   ├── products.js
│   │   ├── products/
│   │   │   └── [slug].js
│   │   ├── private-appointment.js
│   │   └── health.js
│   └── _middleware.js
├── public/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

**创建时间**: 2026-05-15  
**下一步**: 使用上述 Prompt 重新生成网站，然后部署到 EdgeOne Pages
