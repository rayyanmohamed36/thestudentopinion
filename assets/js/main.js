document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const filterChips = document.querySelectorAll('[data-filter]');
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  initIssuesArticlesFeed();
});

function initIssuesArticlesFeed() {
  const articlesGrid = document.querySelector('[data-issues-articles-grid]');
  const template = document.querySelector('#issue-article-card-template');
  if (!articlesGrid || !template) {
    return;
  }

  const emptyState = document.querySelector('[data-issues-articles-empty]');
  const banner = document.querySelector('[data-issues-articles-banner]');
  const apiBaseAttr = document.body?.dataset?.apiBase || '';
  const apiBase = apiBaseAttr.replace(/\/$/, '');
  const articlesEndpoint = apiBase ? `${apiBase}/articles` : '/articles';

  const setBanner = (message = '', isError = false) => {
    if (!banner) return;
    if (!message) {
      banner.hidden = true;
      banner.textContent = '';
      banner.classList.remove('error');
      return;
    }
    banner.hidden = false;
    banner.textContent = message;
    banner.classList.toggle('error', isError);
  };

  const formatMeta = (article) => {
    const author = article.author || 'Unknown author';
    const created = article.created_at_display || '';
    return created ? `By ${author} · ${created}` : `By ${author}`;
  };

  const renderArticles = (articles) => {
    articlesGrid.innerHTML = '';
    if (!Array.isArray(articles) || !articles.length) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    const maxChars = 240;

    articles.forEach((article) => {
      const clone = document.importNode(template.content, true);
      const metaEl = clone.querySelector('[data-issue-article-meta]');
      const titleEl = clone.querySelector('[data-issue-article-title]');
      const abstractEl = clone.querySelector('[data-issue-article-abstract]');
      const pdfEl = clone.querySelector('[data-issue-article-pdf]');

      metaEl.textContent = formatMeta(article);
      titleEl.textContent = article.title || 'Untitled article';

      const abstract = (article.abstract || '').trim();
      const snippet = abstract.length > maxChars ? `${abstract.slice(0, maxChars).trim()}…` : abstract;
      abstractEl.textContent = snippet || 'Abstract coming soon.';

      if (article.pdf_url) {
        pdfEl.href = article.pdf_url;
        pdfEl.removeAttribute('aria-disabled');
      } else {
        pdfEl.href = '#';
        pdfEl.setAttribute('aria-disabled', 'true');
      }

      articlesGrid.appendChild(clone);
    });
  };

  const fetchArticles = async () => {
    setBanner();
    if (emptyState) emptyState.hidden = true;

    try {
      const response = await fetch(articlesEndpoint, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Details:', errorText);
        throw new Error(`Unable to fetch articles (status ${response.status}).`);
      }

      const data = await response.json();
      renderArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      articlesGrid.innerHTML = '';
      setBanner('We could not load the articles feed right now. Please refresh or try again later.', true);
    }
  };

  fetchArticles();
}
