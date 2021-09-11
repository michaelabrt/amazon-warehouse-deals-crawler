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

const isNotNull = (i: Item | ItemNullable): i is Item => i.link !== null && i.title !== null && i.price !== null;

const matchesName = (title: string, mustContain: string[]) =>
  mustContain.map((m) => m.toLowerCase()).some((m) => title.toLowerCase().indexOf(m) !== -1);

const processQuery =
  (browser: puppeteer.Browser) =>
  async (product: typeof config.productQueries[0]): Promise<Item[]> => {
    const page = await browser.newPage();
    await page.goto(product.query);

    // page.evaluate will execute code within browser, so interface is via serializable results only
    const extractedItems: ItemNullableWithStringPrice[] = await page.evaluate(() => {
      const itemsAsNodes = document.querySelectorAll('#atfResults .s-item-container');
      const items: Element[] = Array.from(itemsAsNodes);
      console.log(items);
      return items.map((item) => {
        const link = item.querySelector('.a-size-mini.a-link-normal.a-text-normal');
        const title = item.querySelector('a.s-access-detail-page .s-access-title');
        const price = item.querySelector('.a-color-price');

        return {
          link: link && link.getAttribute('href'),
          title: title && title.getAttribute('data-attribute'),
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
      .filter((x) => product.skuNameMatch === undefined || matchesName(x.title, product.skuNameMatch))
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
