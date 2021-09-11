import puppeteer from 'puppeteer';
import { from, timer, catchError, concatMap, delay, filter, finalize, map, mergeMap, reduce, tap } from 'rxjs';
import config from './config/config';
import log from './logging/log';
import { flagAsSent, hasBeenSent, storageCount } from './persistance/storage';
import { ISendItemWithSku, Item, processProductDetail, sendItems } from './processor/productDetails';
import processQuery from './processor/query';

log.banner('===========================================');
log.banner('===== Amazon Warehouse Deals Crawler ======');
log.banner('===========================================');
log.info(`\nStats: All time deals found: ${storageCount()} \n`);

timer(0, config.crawler.interval)
  .pipe(
    tap((i) => log.info(`Run ${i}: Instantiating new browser`)),
    concatMap(() => puppeteer.launch(config.puppeteer)),
    mergeMap((browser) =>
      from(config.productQueries)
        // process chain of queries
        .pipe(
          // delay(config.crawler.delayPerQuery),
          map((query) => ({
            browser,
            query,
          })),
          tap((data) => log.info(`Processing query: "${data.query.label}"`, '1')),
          mergeMap((data) =>
            from(processQuery(data.browser)(data.query))
              // Process all summary products matching query
              .pipe(
                map((products) =>
                  products.filter((p) => !hasBeenSent(p.sku, data.query.renotifyOnLowerPrice ? p.price : undefined))
                ), // skip already sent
                tap((products) =>
                  log.debug(`"${data.query.label}": identified ${products.length} new product(s)`, '2')
                ),
                mergeMap((products) => from(products)),
                mergeMap((product) =>
                  from(processProductDetail(data.browser)(product.link, data.query))
                    //
                    .pipe(
                      //
                      filter((d): d is { item: Item; page: puppeteer.Page } => !!d.item),
                      map(({ item, page }) => ({
                        ...item,
                        page,
                        url: product.link,
                        title: product.title,
                        sku: product.sku,
                      }))
                    )
                )
              )
          ),
          // consolidate all products into array
          reduce<ISendItemWithSku, ISendItemWithSku[]>((acc, value) => {
            acc.push(value);
            return acc;
          }, [])
        )
        .pipe(filter((x) => x.length > 0)) // filter out empty results
        .pipe(
          tap((items) => log.success(`Grouping matches and firing email w/ ${items.length} product(s)`, '1')),
          map((items) => items.sort((a, b) => a.price - b.price)), // sort price asc
          mergeMap((items) =>
            from(sendItems(items)).pipe(tap(() => items.forEach((item) => flagAsSent(item.sku, item.price))))
          ),
          finalize(() => {
            log.debug('Finished crawling, terminating browser', '1');
            return browser.close();
          })
        )
    ),
    catchError((e, source) => {
      log.error(`An error has ocurred: ${e}`, '1');
      return source.pipe(delay(config.crawler.interval));
    })
  )
  .forEach(() => null);
