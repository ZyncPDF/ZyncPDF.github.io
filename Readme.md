# ZyncPDF

**100% private, open-source PDF toolkit that runs entirely in your browser.**

No uploads. No registration. No cost.

---

## What is ZyncPDF?

ZyncPDF is a collection of client-side PDF tools built with plain HTML, CSS, and JavaScript. Every operation happens locally in your browser — your files never leave your device.

The project is designed to be hosted as a static site on [GitHub Pages](https://pages.github.com/) with zero server-side code.

---

## Features

- **Merge, split, compress, and rotate PDFs**
- **Convert between PDF, PNG, JPEG, WebP, SVG, HEIC, Word, Excel, PowerPoint, Markdown, HTML, RTF, and Text**
- **Edit PDF metadata, add/remove passwords, extract/remove/sort pages**
- **Flatten PDFs, compare PDFs, edit text in PDFs**
- **Compress images**
- **Dark/light theme**
- **Progressive Web App (PWA) with offline support**
- **Fully responsive — works on mobile**

---

## Project Structure

```
.
├── index.html              # Homepage — tool directory
├── sw.js                   # Service Worker (offline caching)
├── manifest.json           # PWA manifest
├── site.webmanifest        # Alternate PWA manifest
├── robots.txt              # Search engine directives
├── sitemap.xml             # SEO sitemap
├── googleb0ed553d299e3db4.html  # Google Search Console verification
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Pages deployment (pure static)
├── assets/
│   ├── css/
│   │   ├── modern-styles.css   # Main theme (dark/light, animations)
│   │   └── styles.css          # Legacy page styles
│   ├── js/
│   │   ├── theme-switcher.js   # Dark/light mode manager
│   │   └── script.js           # Shared PDF tool logic (PDFConverterPro)
│   └── images/
│       └── logo.png            # Site logo
├── tools/                    # All PDF/conversion tool pages
│   ├── merge-pdf.html
│   ├── split-pdf.html
│   ├── compress-pdf.html
│   ├── rotate-pdf.html
│   ├── pdf-to-png.html
│   ├── pdf-to-jpeg.html
│   ├── pdf-to-txt.html
│   ├── png-to-pdf.html
│   ├── jpeg-to-pdf.html
│   ├── webp-to-pdf.html
│   ├── webp-to-png.html
│   ├── webp-to-jpeg.html
│   ├── svg-to-pdf.html
│   ├── svg-to-png.html
│   ├── svg-to-jpeg.html
│   ├── heif-to-pdf.html
│   ├── html-to-pdf.html
│   ├── markdown-to-pdf.html
│   ├── txt-to-pdf.html
│   ├── rtf-to-pdf.html
│   ├── word-to-pdf.html
│   ├── excel-to-pdf.html
│   ├── ppt-to-pdf.html
│   ├── extract-pages.html
│   ├── remove-pages.html
│   ├── sort-pages.html
│   ├── flatten-pdf.html
│   ├── compare-pdfs.html
│   ├── add-password.html
│   ├── remove-password.html
│   ├── edit-metadata.html
│   ├── remove-metadata.html
│   ├── pdf-text-editor.html
│   └── compress-image.html
└── pages/                    # Info and legal pages
    ├── blog.html
    ├── changelog.html
    ├── donate.html
    ├── support.html
    ├── privacy.html
    ├── terms.html
    └── introducing-luxpdf.html
```

---

## Local Development

Open `index.html` directly in a browser, or serve the folder with any static server:

```bash
# Python
python -m http.server 3000

# Node.js (npx)
npx serve .

# VS Code Live Server extension
```

Then visit `http://localhost:3000`.

No build step is required.

---

## Deploy to GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Set **Source** to `Deploy from a branch`.
4. Select branch `main` and folder `/ (root)`.
5. The `deploy.yml` workflow will automatically deploy on every push to `main`.

> **Note:** The old Vite + TypeScript SPA scaffolding (`src/`, `public/`, `dist/`, `vite.config.js`, `tsconfig.json`) has been removed. This is now a pure static site with no build step.

---

## Dependencies (CDN)

Libraries are loaded from CDNs at runtime — no bundler needed:

| Library | Purpose |
|---------|---------|
| [pdf-lib](https://pdf-lib.js.org/) | PDF creation, merging, splitting, editing |
| [PDF.js](https://mozilla.github.io/pdf.js/) | PDF rendering and text extraction |
| [JSZip](https://stuk.github.io/jszip/) | ZIP packaging for batch downloads |
| [Font Awesome](https://fontawesome.com/) | Icons |
| [Inter](https://fonts.google.com/specimen/Inter) | Typography |

---

## License

AGPL-3.0-or-later — see [LICENSE](LICENSE).

---

## Contributing

Issues and pull requests are welcome at [https://github.com/alanjollyc/ZyncPDF](https://github.com/alanjollyc/ZyncPDF).
