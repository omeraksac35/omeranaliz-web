import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const RECENT_KEY = 'omeranaliz:recent';
const FAVORITES_KEY = 'omeranaliz:favorites';
const MAX_RECENT = 8;

export function useWatchlist() {
  const [recent, setRecent] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((v) => v && setRecent(JSON.parse(v)));
    AsyncStorage.getItem(FAVORITES_KEY).then((v) => v && setFavorites(JSON.parse(v)));
  }, []);

  const addRecent = useCallback((symbol: string) => {
    setRecent((prev) => {
      const next = [symbol, ...prev.filter((s) => s !== symbol)].slice(0, MAX_RECENT);
      AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const next = prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isFavorite = useCallback((symbol: string) => favorites.includes(symbol), [favorites]);

  return { recent, favorites, addRecent, toggleFavorite, isFavorite };
}
