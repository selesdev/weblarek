import { Card } from './Card';
import { EventEmitter } from '../../base/Events';
import { IProduct } from '../../../types';
import { cloneTemplate, ensureElement } from '../../../utils/utils';
import { selectors } from '../../../utils/constants';

export class CatalogCard extends Card<HTMLButtonElement> {
  constructor(events: EventEmitter) {
    const template = ensureElement<HTMLTemplateElement>(selectors.cardCatalog);
    super(cloneTemplate<HTMLButtonElement>(template), events);
  }

  setProduct(product: IProduct) {
    this.setData(product);
  }
}