import { Component } from '../../base/Component';
import { EventEmitter } from '../../base/Events';
import { IProduct } from '../../../types';
import { cloneTemplate, ensureElement } from '../../../utils/utils';
import { selectors } from '../../../utils/constants';

export class BasketCard extends Component<HTMLLIElement> {
  private readonly events: EventEmitter;
  private readonly deleteButton: HTMLButtonElement;
  private readonly title: HTMLElement;
  private readonly price: HTMLElement;
  private readonly index: HTMLElement;
  private productId: string | null = null;

  constructor(events: EventEmitter) {
    const template = ensureElement<HTMLTemplateElement>(selectors.cardBasket);
    super(cloneTemplate<HTMLLIElement>(template));
    this.events = events;

    this.deleteButton = this.container.querySelector('.basket__item-delete') as HTMLButtonElement;
    this.title = this.container.querySelector('.card__title') as HTMLElement;
    this.price = this.container.querySelector('.card__price') as HTMLElement;
    this.index = this.container.querySelector('.basket__item-index') as HTMLElement;

    this.deleteButton.addEventListener('click', () => {
      if (this.productId) {
        this.events.emit('basket:item-remove', { id: this.productId });
      }
    });
  }

  setProduct(product: IProduct, position: number):void {
    this.productId = product.id;
    this.index.textContent = String(position);
    this.title.textContent = product.title;
    this.price.textContent = product.price !== null ? `${product.price} синапсов` : 'Бесценно';
  }
}
