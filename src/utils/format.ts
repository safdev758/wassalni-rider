import i18n from '../strings';

export function formatCurrency(amount: number, fractionDigits = 0): string {
  const symbol = i18n.t('currency.symbol');
  const formatted = amount.toLocaleString(i18n.language || 'en', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${formatted} ${symbol}`;
}

export function formatSignedCurrency(amount: number, fractionDigits = 0): string {
  const sign = amount > 0 ? '+' : amount < 0 ? '-' : '';
  return `${sign}${formatCurrency(Math.abs(amount), fractionDigits)}`;
}

export function formatDistanceKm(km: number, fractionDigits = 1): string {
  const formatted = km.toLocaleString(i18n.language || 'en', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  return `${formatted} km`;
}
