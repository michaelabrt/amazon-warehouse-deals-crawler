import puppeteer from 'puppeteer';
import config from '../config/config';
import sendEmail from '../email';
import { isInRange as isPriceInRange, parseDisplayPrice } from '../pricing/price';

export interface Item {
  seller: string;
  price: number;
  condition: string;
}

export interface ISendItem extends Item {
  url: string;
  page: puppeteer.Page;
  title: string;
}

export interface ISendItemWithSku extends ISendItem {
  sku: string;
}

type ItemNullable = { [k in keyof Item]: Item[k] | null };

type ItemNullableWithStringPrice = Pick<ItemNullable, 'seller' | 'condition'> & { price: string | null };

const isNotNull = (i: Item | ItemNullable): i is Item => i.seller !== null && i.price !== null && i.condition !== null;

const cheapestWarehouseDealItem = (
  items: ItemNullableWithStringPrice[],
  product: typeof config.productQueries[0],
  priceParser: ReturnType<typeof parseDisplayPrice>
): Item | undefined => {
  return items
    .map(({ condition, seller, price }) => ({
      seller,
      condition,
      price: price ? priceParser(price) : null,
    }))
    .filter(isNotNull)
    .filter((x) => ['Amazon Warehouse', 'Amazon', 'Amazon Warehouse Deals'].indexOf(x.seller) !== -1)
    .filter((x) => isPriceInRange(x.price, product.price))
    .sort((x, y) => x.price - y.price)[0];
};

export const sendItems = async (items: ISendItem[]) => {
  const attachments = [];
  for (const item of items) {
    await item.page.setViewport(config.crawler.screenshotViewport);
    const screenshot = await item.page.screenshot();

    attachments.push({
      content: screenshot as Buffer,
      name: `${item.title.replace(' ', '-').toLocaleLowerCase()}.png`,
    });
  }

  const description = items.reduce(
    (acc, { condition, price, title, url }) => `${acc} 
    <h4><a href="${url}">${title}</a> €${price}</h4>
    Condition: ${condition}
    <br/><br/>
  `,
    ''
  );

  const subject = `Warehouse Deals Found`;

  await sendEmail(config.email, subject, description, attachments);

  for (const item of items) {
    await item.page.close();
  }
};

export const processProductDetail =
  (browser: puppeteer.Browser) =>
  async (
    url: string,
    product: typeof config.productQueries[0]
  ): Promise<{ item: Item | undefined; page: puppeteer.Page }> => {
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector('.olp-touch-link');
    const offersLink = await page.$('.olp-touch-link');
    const href = await page.evaluate((offersLink) => offersLink.getAttribute('href'), offersLink);
    await page.goto(`https://www.amazon.fr${href}`);
    await page.waitForSelector('#aod-offer-list');

    // page.evaluate will execute code within browser, so interface is via serializable results only
    const extractedItems: ItemNullableWithStringPrice[] = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('#aod-offer'));

      return items.map((item) => {
        const sellerName = item.querySelector('#aod-offer-soldBy a');
        const price = item.querySelector('.a-price-whole');
        const condition = item.querySelector('.expandable-expanded-text');

        return {
          seller: sellerName?.textContent?.replace(/\n/g, '') || null,
          price: price?.textContent?.replace(/\s/g, '') || null,
          condition: condition?.textContent?.replace(/\n/g, '') || null,
        };
      });
    });

    return {
      item: cheapestWarehouseDealItem(extractedItems, product, parseDisplayPrice(url.indexOf('.co.uk') !== -1)),
      page,
    };
  };
