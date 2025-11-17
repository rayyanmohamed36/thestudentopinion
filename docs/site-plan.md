# The Student Opinion — Site Plan

## Purpose
The Student Opinion is a student-led academic journal that showcases research, essays, and opinion pieces from high school and undergraduate contributors. The site should feel credible yet energetic, emphasizing peer-led scholarship and accessibility.

## Target Audiences
- Student researchers/authors looking to publish.
- Educators and mentors supervising student scholarship.
- Readers (students, parents, schools) seeking youth academic perspectives.

## Content Pillars
1. **Current Issue** — highlight latest edition with featured articles.
2. **Archive** — browse past issues by theme with teasers.
3. **Editorial Team** — introduce student board, advisors, and mission.
4. **Submission Guide** — outline timelines, rubrics, and author resources.
5. **Get Involved** — recruitment, partnerships, events, and newsletter.
6. **Contact** — general inquiries, pitches, campus chapters.

## Page Lineup
| Page | Purpose | Key Sections |
| --- | --- | --- |
| `index.html` | Hero splash and highlights | hero, featured articles, current issue CTA, testimonials, quick metrics, latest news |
| `issues.html` | Archive of issues | filter chips, cards per issue, download links |
| `article.html` | Rich article template | breadcrumb, author block, pull quotes, related articles |
| `about.html` | Mission + editorial team | manifesto, timeline, team grid, advisory board |
| `submit.html` | Submission + contributor resources | requirements, submission timeline, FAQ, downloadable kit |
| `contact.html` | Contact + involvement | forms CTA (mailto), campus chapters, newsletter |

## Components & Shared Elements
- Sticky top navigation with logo, issue CTA, and mobile menu toggle (pure CSS/JS minimal).
- Footer with contact, quick links, and social icons.
- Accent gradient backgrounds referencing academic colors (navy, teal, coral).
- Cards, badges, and timeline components built with utility classes in CSS.

## Visual Language
- Typeface stack: `"Space Grotesk", "Inter", system fonts` via Google Fonts.
- Color palette:
  - Midnight Ink `#0f172a`
  - Deep Teal `#0d9488`
  - Coral Pop `#fb7185`
  - Golden Accent `#fbbf24`
  - Mist `#e2e8f0`
- Use soft gradients and glassmorphism panels for modern academic feel.

## Content Notes
- Provide three sample issues (Spring 2025, Winter 2024, Summer 2024) with faux abstracts.
- Include two sample featured articles with excerpt paragraphs.
- Add quotes from student contributors.
- Submission page should include checklist, timeline, and rubrics summary.
- Contact page uses `mailto:` links instead of forms to keep static.

## Stretch Ideas (Future)
- Tag filtering via vanilla JS.
- Dark mode toggle.
- Markdown-powered article ingestion.
