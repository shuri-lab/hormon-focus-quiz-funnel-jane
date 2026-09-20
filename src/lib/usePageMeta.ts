import { useEffect } from 'react';

interface Meta {
  title: string;
  description: string;
  /** Social preview image, absolute or root-relative. */
  image?: string;
  noindex?: boolean;
}

function upsert(selector: string, make: () => HTMLMetaElement | HTMLLinkElement) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
  if (!el) {
    el = make();
    document.head.appendChild(el);
  }
  return el;
}

function meta(name: string, value: string, attr: 'name' | 'property' = 'name') {
  const el = upsert(`meta[${attr}="${name}"]`, () => {
    const m = document.createElement('meta');
    m.setAttribute(attr, name);
    return m;
  }) as HTMLMetaElement;
  el.setAttribute('content', value);
}

/**
 * Per-route title, description, canonical and Open Graph tags.
 *
 * This is a client-side SPA, so search engines see these after hydration and
 * social scrapers usually do not. The landing pages are ad destinations, and
 * ad platforms do not need OG tags to run traffic — but if these pages are
 * ever shared organically, prerender them at build time or move to SSR.
 */
export function usePageMeta({ title, description, image, noindex }: Meta) {
  useEffect(() => {
    document.title = title;
    meta('description', description);
    /* Exactly 'noindex'. Not 'noindex,nofollow': the pages that set this are
       our own funnel screens, and telling a crawler not to follow the links
       out of them was never the intent. */
    meta('robots', noindex ? 'noindex' : 'index,follow');

    meta('og:title', title, 'property');
    meta('og:description', description, 'property');
    meta('og:type', 'website', 'property');
    meta('og:url', window.location.href, 'property');
    if (image) meta('og:image', new URL(image, window.location.origin).toString(), 'property');

    meta('twitter:card', image ? 'summary_large_image' : 'summary');

    const canonical = upsert('link[rel="canonical"]', () => {
      const l = document.createElement('link');
      l.setAttribute('rel', 'canonical');
      return l;
    }) as HTMLLinkElement;
    canonical.setAttribute('href', window.location.origin + window.location.pathname);
  }, [title, description, image, noindex]);
}
