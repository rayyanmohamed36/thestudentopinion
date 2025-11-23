const normalizeLineEndings = (text = '') => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
const paragraphSeparator = /\n\s*\n/;

const escapeHtml = (str = '') =>
  str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const splitIntoParagraphs = (text = '') => {
  const trimmed = normalizeLineEndings(text).trim();
  if (!trimmed) return [];
  return trimmed
    .split(paragraphSeparator)
    .map((segment) => segment.trim())
    .filter(Boolean);
};

const paragraphsToHtml = (text = '') => {
  const paragraphs = splitIntoParagraphs(text);
  if (!paragraphs.length) return '';
  return paragraphs.map((segment) => `<p>${escapeHtml(segment)}</p>`).join('');
};

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
  initHomeArticlesFeed();
  initArticlesIndexPage();
  initArticleDetailPage();
});

const getApiBase = () => {
  const attr = document.body?.dataset?.apiBase || '';
  return attr.replace(/\/?$/, '') || '';
};

function initArticlesFeed({
  gridSelector,
  templateSelector,
  emptySelector,
  bannerSelector,
  limit,
}) {
  const articlesGrid = document.querySelector(gridSelector);
  const template = document.querySelector(templateSelector);
  if (!articlesGrid || !template) {
    return;
  }

  const emptyState = emptySelector ? document.querySelector(emptySelector) : null;
  const banner = bannerSelector ? document.querySelector(bannerSelector) : null;
  const apiBase = getApiBase();
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
    let list = Array.isArray(articles) ? articles : [];
    if (limit && list.length) {
      list = list.slice(0, limit);
    }
    if (!list.length) {
      if (emptyState) emptyState.hidden = false;
      return;
    }

    if (emptyState) emptyState.hidden = true;

    list.forEach((article) => {
      const clone = document.importNode(template.content, true);
      const metaEl = clone.querySelector('[data-issue-article-meta]');
      const titleEl = clone.querySelector('[data-issue-article-title]');
      const abstractEl = clone.querySelector('[data-issue-article-abstract]');
      const pdfEl = clone.querySelector('[data-issue-article-pdf]');
      const readEl = clone.querySelector('[data-issue-article-read]');
      const authorEl = clone.querySelector('[data-home-article-author]');

      metaEl.textContent = formatMeta(article);
      titleEl.textContent = article.title || 'Untitled article';
      if (authorEl) {
        authorEl.textContent = article.author ? `By ${article.author}` : '';
        authorEl.hidden = !article.author;
      }

      const abstractHtml = paragraphsToHtml(article.abstract || '');
      if (abstractHtml) {
        abstractEl.innerHTML = abstractHtml;
      } else {
        abstractEl.textContent = 'Abstract coming soon.';
      }

      if (pdfEl) {
        if (article.pdf_url) {
          pdfEl.href = article.pdf_url;
          pdfEl.removeAttribute('aria-disabled');
        } else {
          pdfEl.href = '#';
          pdfEl.setAttribute('aria-disabled', 'true');
        }
      }

      if (readEl) {
        const detailUrl = article.id ? `article.html?id=${article.id}` : null;
        if (detailUrl) {
          readEl.href = detailUrl;
          readEl.removeAttribute('aria-disabled');
        } else {
          readEl.href = '#';
          readEl.setAttribute('aria-disabled', 'true');
        }
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

function initIssuesArticlesFeed() {
  initArticlesFeed({
    gridSelector: '[data-issues-articles-grid]',
    templateSelector: '#issue-article-card-template',
    emptySelector: '[data-issues-articles-empty]',
    bannerSelector: '[data-issues-articles-banner]',
  });
}

function initArticlesIndexPage() {
  initArticlesFeed({
    gridSelector: '[data-articles-list-grid]',
    templateSelector: '#articles-list-card-template',
    emptySelector: '[data-articles-list-empty]',
    bannerSelector: '[data-articles-list-banner]',
  });
}

function initHomeArticlesFeed() {
  initArticlesFeed({
    gridSelector: '[data-home-articles-grid]',
    templateSelector: '#home-article-card-template',
    bannerSelector: '[data-home-articles-banner]',
    emptySelector: '[data-home-articles-empty]',
    limit: 1,
  });
}

function initArticleDetailPage() {
  const articlePage = document.querySelector('[data-article-page]');
  if (!articlePage) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get('id');
  const errorEl = document.querySelector('[data-article-error]');
  const loadingEl = document.querySelector('[data-article-loading]');
  const heroSection = document.querySelector('[data-article-hero]');
  const contentSection = document.querySelector('[data-article-content]');
  const titleEl = document.querySelector('[data-article-title]');
  const metaEl = document.querySelector('[data-article-meta]');
  const abstractEl = document.querySelector('[data-article-abstract]');
  const bodyEl = document.querySelector('[data-article-body]');
  const pdfLinks = document.querySelectorAll('[data-article-pdf]');

  const showError = (message) => {
    if (loadingEl) loadingEl.hidden = true;
    if (heroSection) heroSection.hidden = true;
    if (contentSection) contentSection.hidden = true;
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  };

  if (!articleId) {
    showError('Article not found.');
    return;
  }

  const apiBase = getApiBase();
  const endpoint = apiBase ? `${apiBase}/articles/${articleId}` : `/articles/${articleId}`;

  const renderBody = (bodyText = '') => {
    if (!bodyEl) return;
    bodyEl.innerHTML = '';
    const paragraphs = splitIntoParagraphs(bodyText);
    if (!paragraphs.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Full article text is not available yet.';
      bodyEl.appendChild(empty);
      return;
    }

    paragraphs.forEach((segment) => {
      const paragraph = document.createElement('p');
      paragraph.textContent = segment;
      bodyEl.appendChild(paragraph);
    });
  };

  const setPdfLinks = (url) => {
    pdfLinks.forEach((link) => {
      if (url) {
        link.href = url;
        link.removeAttribute('aria-disabled');
      } else {
        link.href = '#';
        link.setAttribute('aria-disabled', 'true');
      }
    });
  };

  fetch(endpoint, { headers: { Accept: 'application/json' } })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to load article.');
      }
      return response.json();
    })
    .then((article) => {
      if (loadingEl) loadingEl.hidden = true;
      if (heroSection) heroSection.hidden = false;
      if (contentSection) contentSection.hidden = false;
      if (errorEl) errorEl.hidden = true;

      if (titleEl) titleEl.textContent = article.title || 'Untitled article';
      if (metaEl) {
        const author = article.author || 'Unknown author';
        const created = article.created_at_display || '';
        metaEl.textContent = created ? `By ${author} · ${created}` : `By ${author}`;
      }
      if (abstractEl) {
        abstractEl.textContent = article.abstract || 'Abstract coming soon.';
      }
      renderBody(article.body || '');
      setPdfLinks(article.pdf_url);
    })
    .catch((error) => {
      console.error(error);
      showError('We could not load this article. Please try again later.');
    });
}
