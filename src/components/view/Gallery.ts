import { Component } from '../base/Component';
import { EventEmitter } from '../base/Events';
import { IProduct } from '../../types';
import { CatalogCard } from './cards/CatalogCard';

export class Gallery extends Component<HTMLElement> {
  private readonly events: EventEmitter;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this.events = events;
  }

  renderProducts(products: IProduct[]):void {
    this.container.innerHTML = '';

    products.forEach(product => {
      const card = new CatalogCard(this.events);
      card.setProduct(product);
      this.container.append(card.render());
    });
  }

  render(): HTMLElement {
    return this.container;
  }
}
