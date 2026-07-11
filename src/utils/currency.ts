export type CurrencyType = 'NGN' | 'USD' | 'EUR' | 'GBP';

export const EXCHANGE_RATES: Record<CurrencyType, { rate: number; symbol: string; label: string }> = {
  NGN: { rate: 1, symbol: '₦', label: 'NGN (₦)' },
  USD: { rate: 1 / 1500, symbol: '$', label: 'USD ($)' },
  EUR: { rate: 1 / 1650, symbol: '€', label: 'EUR (€)' },
  GBP: { rate: 1 / 1950, symbol: '£', label: 'GBP (£)' },
};

export function formatPrice(priceInNGN: number, currency: CurrencyType): string {
  const { rate, symbol } = EXCHANGE_RATES[currency];
  const converted = priceInNGN * rate;
  const decimals = currency === 'NGN' ? 0 : 2;
  return `${symbol}${converted.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  })}`;
}
