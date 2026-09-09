import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function SEOHead({ title, description, image, url }: SEOProps) {
  useEffect(() => {
    document.title = title ? `${title} | Marketplace` : 'Marketplace — Multi-Publisher Platform';

    const meta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) || document.querySelector(`meta[property="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (name.startsWith('og:')) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    meta('description', description || 'Discover products from multiple publishers');
    meta('og:title', title || 'Marketplace');
    meta('og:description', description || 'Multi-publisher marketplace');
    if (image) meta('og:image', image);
    if (url) meta('og:url', url);
    meta('twitter:card', 'summary_large_image');
  }, [title, description, image, url]);

  return null;
}
