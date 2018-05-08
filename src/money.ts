export const parseDisplayPrice = (isUk: boolean) => (price: string) => {
  const currencySymbols = ['EUR', 'GBP', '£', '€']
  const currencyLessPrice = currencySymbols.reduce((p, currency) => p.replace(currency, ''), price)
  const localizedPrice = isUk
    ? currencyLessPrice
        .replace('.', '*')
        .replace(',', '.')
        .replace('*', ',')
    : currencyLessPrice

  return parseFloat(
    localizedPrice
      .replace('.', '')
      .split(',')[0]
      .trim()
  )
}