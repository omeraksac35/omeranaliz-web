import type { AnalysisResult, NewsResult } from './types';

/**
 * Zaten hesaplanmış teknik + bilanço + haber verilerini okunabilir bir
 * paragrafa dönüştürür. Bu yeni bir "yapay zeka görüşü" veya tahmin
 * ÜRETMEZ — sadece mevcut verileri birleştirip düzyazıya çevirir.
 */
export function buildCommentary(result: AnalysisResult, news: NewsResult | null): string {
  const parts: string[] = [];

  parts.push(
    `Kısa vadede (günlük) sinyal ${result.kisa_vadeli.signal}, uzun vadede (haftalık) sinyal ${result.uzun_vadeli.signal}. ${result.consistency_note}`
  );

  const fundNotesText = result.fund_notes.map((n) => n.replace(/^[+-]\s*/, '')).join(', ');
  parts.push(
    `Bilanço tarafında şirket "${result.fund_verdict}" olarak değerlendiriliyor${
      fundNotesText ? ` (${fundNotesText})` : ''
    }.`
  );

  if (news) {
    if (news.critical_notes.length > 0) {
      const categories = Array.from(new Set(news.critical_notes.flatMap((c) => c.categories)));
      parts.push(`Son günlerde dikkat çekici gelişmeler var: ${categories.join(', ')}. Detay için haberlere bak.`);
    } else if (news.articles.length > 0) {
      parts.push('Son günlerde kritik bir gelişme (sermaye artırımı, birleşme, dava vb.) tespit edilmedi.');
    }
  }

  const bothBuy = result.kisa_vadeli.is_buy_signal && result.uzun_vadeli.is_buy_signal;
  const bothSell = result.kisa_vadeli.signal === 'SAT' && result.uzun_vadeli.signal === 'SAT';
  const fundWeak = result.fund_verdict === 'ZAYIF';

  if (bothBuy && !fundWeak) {
    parts.push('Özetle: Kısa vadeli, uzun vadeli ve bilanço verileri aynı (olumlu) yönde birleşiyor.');
  } else if (bothBuy && fundWeak) {
    parts.push('Özetle: Teknik görünüm olumlu ama bilanço zayıf — bu bir uyarı işareti, dikkatli ol.');
  } else if (bothSell) {
    parts.push('Özetle: Kısa ve uzun vadeli teknik görünüm olumsuz yönde birleşiyor.');
  } else {
    parts.push('Özetle: Veriler karışık sinyaller veriyor, net bir yönde tam bir birleşme yok.');
  }

  parts.push('Bu bir yatırım tavsiyesi değildir; kendi araştırmanı yapıp kendi risk toleransına göre karar ver.');

  return parts.join(' ');
}
