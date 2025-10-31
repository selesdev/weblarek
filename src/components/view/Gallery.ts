import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';
import { cloneTemplate } from '../../utils/utils';
import { IProduct } from '../../types';
import { selectors } from '../../utils/constants';

export class Gallery extends Component<HTMLElement> {
  protected _events: EventEmitter;
  protected _container: HTMLElement;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this._events = events;
    this._container = container;
  }

  renderProducts(products: IProduct[]) {
    this._container.innerHTML = '';

    const template = document.querySelector<HTMLTemplateElement>(selectors.cardCatalog);
    if (!template) return;

    products.forEach(product => {
      const card = cloneTemplate<HTMLButtonElement>(selectors.cardCatalog);
      card.dataset.id = product.id;

      const titleEl = card.querySelector('.card__title');
      const priceEl = card.querySelector('.card__price');
      const categoryEl = card.querySelector('.card__category');
      const imgEl = card.querySelector('.card__image') as HTMLImageElement;

      if (titleEl) titleEl.textContent = product.title;
      if (priceEl) priceEl.textContent = product.price ? `${product.price} синапсов` : '';
      if (categoryEl) categoryEl.textContent = product.category;
      if (imgEl && product.image) imgEl.src = product.image;
      card.addEventListener('click', () => {
        this._events.emit('card:click', { element: card });
      });

      this._container.appendChild(card);
    });
  }

  render(): HTMLElement {
    return this.container;
  }
}
