# Article Organization Structure

## Directory Layout
```
articles/
├── spring-2025/
│   └── designing-youth-climate-accords/
│       ├── index.html           # Article content
│       ├── metadata.json        # Article metadata (author, categories, DOI, etc.)
│       ├── data.csv             # Research data
│       └── images/              # Article-specific images (optional)
├── winter-2024/
│   └── [article-folder]/
└── summer-2024/
    └── [article-folder]/
```

## Metadata Schema (metadata.json)
Each article folder contains a `metadata.json` file with:
- **Basic info**: title, slug, author details
- **Publication**: date, issue volume/season, theme
- **Categorization**: categories, tags, keywords
- **Academic**: abstract, peer review status, DOI, citation
- **Assets**: downloadable materials, images
- **Relations**: related articles, featured status

## Benefits
1. **SEO-friendly URLs**: `/articles/spring-2025/designing-youth-climate-accords/`
2. **Easy organization**: Issues and articles grouped chronologically
3. **Metadata portability**: JSON can feed into future CMS or search
4. **Asset co-location**: Data, images, PDFs stored with article
5. **Scalability**: Add new issues/articles without restructuring

## Example Article Created
- **Path**: `articles/spring-2025/designing-youth-climate-accords/`
- **Files**: index.html, metadata.json, data.csv
- **Linked from**: index.html (Featured Work) and issues.html (Spring 2025 issue)
