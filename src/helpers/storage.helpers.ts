import { LocalStorage } from 'node-localstorage';
import config from '../config';

const ls = new LocalStorage(config.persistance.path, Infinity);

export const hasBeenSent = (id: string, compareToPrice?: number) => {
  const item = ls.getItem(id);
  return item && (!compareToPrice || JSON.parse(item) > compareToPrice);
};

export const flagAsSent = (id: string, price: number) => ls.setItem(id, JSON.stringify(price));

export const storageCount = () => ls.length;
