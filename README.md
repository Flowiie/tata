# Tata Productions — website

Static, dependency-free site (HTML + CSS + vanilla JS). Open `index.html` or serve the folder:

```bash
python3 -m http.server 8000
```

## Replacing the hero video

The first screen is a full-bleed looping video. The current file is a generated placeholder.

1. Export the final reel as **`assets/video/hero.mp4`** (1920×1080, H.264, 10–20 s seamless loop, < 8 MB, `-movflags +faststart`).
2. Replace **`assets/video/hero-poster.jpg`** with a still frame (shown while the video loads).
3. The same file feeds the scroll-expanding "Showreel" section and the "Play showreel" modal.
   To use a longer reel with sound in the modal, change the `<source>` inside `#modalVideo` in `index.html`.

## Languages (EN / ES)

The site is bilingual with an EN / ES switch in the header.

- English text lives in `index.html`; every translatable element carries a `data-i18n="key"` (or `data-i18n-aria` for labels).
- Spanish text lives in `assets/js/i18n.js` under the same keys. Strings built from JS (marquee, portfolio, form errors…) are in `I18N.dynamic`.
- Initial language: `?lang=es` / `?lang=en` in the URL, then the visitor's last choice, then the browser language.

## Structure

- `index.html` — content and sections
- `assets/css/style.css` — design tokens (`:root`) and styles
- `assets/js/i18n.js` — Spanish translations
- `assets/js/main.js` — preloader, timecode HUD, cursor, scroll effects, portfolio data (`projects` array), form validation

The contact form only validates in the browser; connect it to a backend or a service such as Formspree before launch.
