import { Price } from '../config/queries';

const poundToEuroConversion = 1.17;

export const parseDisplayPrice = (isUk: boolean) => (price: string) => {
  const currencySymbols = ['EUR', 'GBP', '£', '€'];
  const currencyLessPrice = currencySymbols.reduce((p, currency) => p.replace(currency, ''), price);
  const localizedPrice = isUk
    ? currencyLessPrice.replace('.', '*').replace(',', '.').replace('*', ',')
    : currencyLessPrice;

  const unlocalizedPrice = parseFloat(localizedPrice.replace('.', '').split(',')[0].trim());

  return isUk ? Math.round(unlocalizedPrice * poundToEuroConversion) : unlocalizedPrice;
};

export const isInRange = (price: number, config: Price) =>
  price < config.below && (config.above === undefined || price > config.above);
