import { Price } from '../queries';

const poundToEuroConversion = 1.17;

export const parseDisplayPrice = (isUk: boolean) => (price: string) => {
  const currencySymbols = ['EUR', 'GBP', '£', '€'];
  const currencyLessPrice = currencySymbols.reduce((p, currency) => p.replace(currency, ''), price.replace(/\s/g, ''));
  const localizedPrice = isUk
    ? currencyLessPrice.replace('.', '*').replace(',', '.').replace('*', ',')
    : currencyLessPrice;

  const unlocalizedPrice = parseFloat(localizedPrice.replace('.', '').split(',')[0].trim());

  return isUk ? Math.round(unlocalizedPrice * poundToEuroConversion) : unlocalizedPrice;
};

export const isInRange = (price: number, { below, above }: Price) => price < below && (!above || price > above);
