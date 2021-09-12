type Query = {
  label: string;
  /**
   * Amazon search url
   */
  query: string;
  /**
   * The product title must contain at least one of these strings, to further refine results
   */
  skuNameMatch?: string[];
  price: {
    /**
     * product price must be at most this
     */
    below: number;
    /**
     * product price must be at least this
     */
    above?: number;
  };
  /**
   * If enabled, notifications will be re-sent if the new price is lower than the last notification's
   */
  renotifyOnLowerPrice?: boolean;
};

export type Price = Query['price'];

const productsQueries: Query[] = [
  // Ultrawide monitors
  {
    label: 'LG UltraGear 38GN950-B',
    query: 'https://www.amazon.fr/s?k=lg+38gn950-b&i=warehouse-deals&ref=nb_sb_ss_ts-doa-p_4_5',
    price: {
      below: 1000,
    },
    skuNameMatch: ['B086C3FZ3X'],
    renotifyOnLowerPrice: true,
  },
  {
    label: 'LG UltraGear 34GN850-B',
    query:
      'https://www.amazon.fr/s?k=lg+34gn850-b&i=warehouse-deals&__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&ref=nb_sb_noss',
    price: {
      below: 650,
    },
    skuNameMatch: ['B0864GCQPL'],
    renotifyOnLowerPrice: true,
  },
  // Mouse
  {
    label: 'Logitech G Pro X Superlight',
    query:
      'https://www.amazon.fr/s?k=logitech+g+pro+x+superlight&i=warehouse-deals&__mk_fr_FR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=BQNHZXRF40FQ&sprefix=logitech+g+pro+x%2Cwarehouse-deals%2C159&ref=nb_sb_ss_i_4_16',
    price: {
      below: 115,
    },
    skuNameMatch: ['B07W5JKPJX'],
    renotifyOnLowerPrice: true,
  },
];

export default productsQueries;
