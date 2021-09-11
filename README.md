# Amazon Warehouse Deals Crawler

> Crawls Amazon Warehouse Deals looking for cheap products based on definition

## Motivation

Check the latest syntax for RxJS and try to score a cheap oled TV in Amazon Warehouse Deals in the process :)

## Technology

- Chrome Puppeteer
- RxJS 6
- TypeScript

## Pre-requisites:

- Node
- Yarn

## Configuration

- General configuration such as refresh interval and so on can be found on [config.ts](./src/config/config.ts)
- The queries to crawl against can be configured in [queries.ts](./src/config/queries)

## Usage

- Your environment must have the following environment variables set

  - `EMAIL_FROM`: name of sender
  - `EMAIL_TO`: whom to send the email
  - `EMAIL_USER`: sender email account username (i.e someone@gmail.com)
  - `EMAIL_PASSWORD`: sender email account password
  - `EMAIL_HOST`: Hostname of email provider, defaults to gmail ('smtp.gmail.com')

- `yarn start` will run the server

Example

- `EMAIL_FROM=xxx EMAIL_TO=foo@gmail.com EMAIL_USER=bar@gmail.com EMAIL_PASSWORD=12345 yarn run startyarn start` will fire the server and crawl for deals infinitely
- `yarn cleanStorage` will reset the storage so already notified deals will be retriggered on match
