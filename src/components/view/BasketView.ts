import { Component } from '../base/Component';
import { EventEmitter } from '../base/Events';
import { IProduct } from '../../types';
import { selectors } from '../../utils/constants';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { BasketCard } from './cards/BasketCard';

export class BasketView extends Component<HTMLElement> {
  private readonly events: EventEmitter;
  private readonly list: HTMLElement;
  private readonly total: HTMLElement;
  private readonly orderButton: HTMLButtonElement;

  constructor(events: EventEmitter) {
    const template = ensureElement<HTMLTemplateElement>(selectors.basket);
    super(cloneTemplate<HTMLElement>(template));
    this.events = events;

    this.list = this.container.querySelector('.basket__list') as HTMLElement;
    this.total = this.container.querySelector('.basket__price') as HTMLElement;
    this.orderButton = this.container.querySelector('.basket__button') as HTMLButtonElement;

    this.orderButton.addEventListener('click', () => {
      if (!this.orderButton.disabled) {
        this.events.emit('basket:order');
      }
    });
  }

  setItems(items: IProduct[]) {
    this.list.innerHTML = '';
    items.forEach((item, index) => {
      const card = new BasketCard(this.events);
      card.setProduct(item, index + 1);
      this.list.append(card.render());
    });
    this.orderButton.disabled = items.length === 0;
  }

  setTotal(total: number) {
    this.total.textContent = `${total} синапсов`;
  }
}