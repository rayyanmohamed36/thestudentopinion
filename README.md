# The Student Opinion

A fully static, student-led academic journal website that spotlights youth scholarship and provides submission resources. Built with plain HTML, CSS, and a dash of vanilla JavaScript so it can be hosted on any static host (GitHub Pages, Netlify, Vercel, etc.).

## Features
- **Multi-page experience**: home, archive, article template, about, submission guidelines, and contact hub.
- **Reusable layout system**: shared navigation, footer, and card components styled via `assets/css/styles.css`.
- **Issue + article storytelling**: curated content blocks, timelines, and metrics highlighting the journal’s reach.
- **Contributor resources**: submission checklist, timeline table, FAQ, and contact emails.
- **Lightweight enhancements**: filter chip state + dynamic footer year handled in `assets/js/main.js`.

## Project Structure
```
.
├── index.html          # Landing page with hero, featured articles, metrics, and CTAs
├── issues.html         # Issue archive with download links and distribution info
├── article.html        # Sample article layout for future pieces
├── about.html          # Mission statement, timeline, and editorial team
├── submit.html         # Submission guidelines, timeline, FAQ, and resources
├── contact.html        # Contact channels, regional chapters, newsletter CTA
├── assets
│   ├── css
│   │   └── styles.css  # Global typography, layout, and component styles
│   ├── js
│   │   └── main.js     # Footer year + chip interaction enhancements
│   └── images          # Drop any future imagery or illustrations here
└── docs
    └── site-plan.md    # High-level content/visual plan for the site
```

## Getting Started
1. **Serve locally** (any static server works). Example using Python:
   ```bash
   cd thestudentopinion
   python3 -m http.server 8000
   ```
2. Open [http://localhost:8000](http://localhost:8000) and browse.

## Deployment
- Upload the repo to any static host (GitHub Pages, Netlify Drop, Render static, etc.).
- Ensure the root directory is served so relative asset paths (e.g., `assets/css/styles.css`) resolve correctly.

## Customization Tips
- Update issue cards and article content directly in the HTML files.
- Extend the color palette or typography within `:root` variables in `assets/css/styles.css`.
- Add new pages by duplicating the base structure (nav + footer) and adjusting copy.

## License
Content and layout are provided for educational use. Customize freely for your student publication.
