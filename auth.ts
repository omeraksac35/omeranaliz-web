// Basit yerel giriş kilidi. ÖNEMLİ: Bu gerçek bir güvenlik sınırı DEĞİLDİR —
// istemci tarafı (client-side) kodda saklandığı için uygulama paketine
// erişebilen biri bu değerleri çıkarabilir. Amacı, telefonu eline alan
// birinin uygulamayı rastgele açmasını engelleyen hafif bir kilittir.
export const VALID_USER_ID = 'OmerA';
export const VALID_PASSWORD = 'omeranaliz25';

export function checkCredentials(userId: string, password: string): boolean {
  return userId.trim() === VALID_USER_ID && password === VALID_PASSWORD;
}
