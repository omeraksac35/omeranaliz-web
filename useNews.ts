import { useEffect, useState } from 'react';

import { API_BASE_URL } from './config';
import type { NewsResult } from './types';

export function useNews(ticker: string | null) {
  const [data, setData] = useState<NewsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ticker) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE_URL}/news/${encodeURIComponent(ticker)}`)
      .then(async (resp) => {
        const json = await resp.json();
        if (!resp.ok) throw new Error(json.detail || 'Haberler alınamadı.');
        if (!cancelled) setData(json as NewsResult);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Haberler alınamadı.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return { data, loading, error };
}
