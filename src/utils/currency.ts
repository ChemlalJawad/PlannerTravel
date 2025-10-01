// Taux de change approximatifs (à mettre à jour régulièrement)
export const EXCHANGE_RATES = {
  EUR: 1,
  CNY: 0.13, // 1 CNY = 0.13 EUR
  JPY: 0.0062, // 1 JPY = 0.0062 EUR
};

/**
 * Convertit un montant d'une devise vers l'EUR
 */
export function convertToEUR(amount: number, currency: 'EUR' | 'CNY' | 'JPY'): number {
  return amount * EXCHANGE_RATES[currency];
}

/**
 * Formate un prix en EUR avec le prix original entre parenthèses si différent
 * Exemple: "25 EUR (500 JPY)" ou "50 EUR"
 */
export function formatPriceWithOriginal(
  amount: number,
  currency: 'EUR' | 'CNY' | 'JPY'
): string {
  const eurAmount = convertToEUR(amount, currency);
  const formattedEUR = `${eurAmount.toFixed(2)} EUR`;

  if (currency !== 'EUR') {
    return `${formattedEUR} (${amount.toFixed(0)} ${currency})`;
  }

  return formattedEUR;
}

/**
 * Formate uniquement le montant en EUR, sans le prix original
 */
export function formatPriceEUR(amount: number, currency: 'EUR' | 'CNY' | 'JPY'): string {
  const eurAmount = convertToEUR(amount, currency);
  return `${eurAmount.toFixed(2)} EUR`;
}

/**
 * Obtient le symbole de la devise
 */
export function getCurrencySymbol(currency: 'EUR' | 'CNY' | 'JPY'): string {
  const symbols: Record<string, string> = {
    EUR: '€',
    CNY: '¥',
    JPY: '¥',
  };
  return symbols[currency] || currency;
}
