import puppeteer from 'puppeteer';
import config from '../config/config';
import { isInRange as isPriceInRange, parseDisplayPrice } from '../pricing/price';

type Item = {
  link: string;
  title: string;
  price: number;
  sku: string;
};

type ItemNullable = { [k in keyof Item]: Item[k] | null };

type ItemNullableWithStringPrice = Pick<ItemNullable, 'link' | 'title'> & { price: string | null };

const isNotNull = (i: Item | ItemNullable): i is Item => !!(i.link && i.title && i.price);

const matchesName = (title: string, mustContain: string[]) =>
  mustContain.map((m) => m.toLowerCase()).some((m) => title.toLowerCase().indexOf(m) !== -1);

const processQuery =
  (browser: puppeteer.Browser) =>
  async (product: typeof config.productQueries[0]): Promise<Item[]> => {
    const page = await browser.newPage();
    await page.goto(product.query);

    // page.evaluate will execute code within browser, so interface is via serializable results only
    const extractedItems: ItemNullableWithStringPrice[] = await page.evaluate(() => {
      const itemsAsNodes = document.querySelectorAll("div[data-component-type='s-search-result']");
      const items: Element[] = Array.from(itemsAsNodes);

      return items.map((item) => {
        const href = item.querySelector('h2.a-size-mini > a')?.getAttribute('href');
        const link = href ? `https://www.amazon.fr${href}` : null;
        const title = item.getAttribute('data-asin');
        const price = item.querySelector('div.a-row > span.a-color-base');

        return {
          link,
          title,
          price: price && price.textContent,
        };
      });
    });

    return extractedItems
      .map(({ price, title, link }) => ({
        title,
        link,
        price: price ? parseDisplayPrice(product.query.indexOf('.co.uk') !== -1)(price) : null,
        sku: link ? extractProductSkuFromUrl(link) : '',
      }))
      .filter(isNotNull)
      .filter((x) => !product.skuNameMatch || matchesName(x.title, product.skuNameMatch))
      .filter((x) => x.sku.length > 0)
      .filter((x) => isPriceInRange(x.price, product.price));
  };

/**
 * Extracts SKUs from urls of the form:
 * https://www.amazon.de/LG-OLED65B7D-Fernseher-Doppelter-Triple/dp/B06Y5VXG7S/ref...
 * https://www.amazon.de/gp/offer-listing/B06Y5VXG7S/ref=...
 */
const extractProductSkuFromUrl = (url: string): string => {
  const skuRegex = /^.*[dp|offer\-listing]\/(.*)\/.*/;
  const match = url.match(skuRegex);
  return match ? match[1] : '';
};

export default processQuery;
