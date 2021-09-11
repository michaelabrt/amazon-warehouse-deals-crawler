import queries from './queries';

const config = {
  productQueries: queries,
  puppeteer: {
    devtools: process.env.DEBUG === 'true',
    dumpio: true,
  },
  /**
   * Every how often we crawl all pages
   */
  crawler: {
    /**
     * How much to wait between each product search
     */
    delayPerQuery: 4000,
    /**
     * Cron time gap
     */
    interval: 60 * 1000,
    navigationTimeout: 10 * 1000,
    screenshotViewport: {
      width: 1280,
      height: 1024,
    },
  },
  email: {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    smtpConfig: {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: 587,
      secure: false, // upgrade later with STARTTLS
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
  },
  persistance: {
    /**
     * Storage is relative to the project root folder
     */
    path: './.storage',
  },
};

export default config;
