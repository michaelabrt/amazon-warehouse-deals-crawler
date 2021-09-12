# Amazon Warehouse Deals Crawler

> Crawls Amazon Warehouse Deals looking for nice deals based on definition

## Technologies

- TypeScript
- Puppeteer
- RxJS

## Pre-requisites:

- Node
- Yarn

## Configuration

- General configuration such as refresh interval can be found on [config.ts](./src/config.ts)
- The queries to crawl against can be configured in [queries.ts](./src/queries)

## Usage

- Create a .env file which has the following environment variables set:

  - `EMAIL_FROM`: name of sender
  - `EMAIL_TO`: whom to send the email
  - `EMAIL_USER`: sender email account username (i.e someone@gmail.com)
  - `EMAIL_PASSWORD`: sender email account password
  - `EMAIL_HOST`: Hostname of email provider, defaults to gmail ('smtp.gmail.com')

- `yarn start` will run the server and crawl for deals until you stop it

- `yarn cleanStorage` will reset the storage so already notified deals will be retriggered on match
