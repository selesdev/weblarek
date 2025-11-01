import { IProduct } from '../../../types';
import { EventEmitter } from '../../base/Events';
import { Component } from '../../base/Component';
import { categoryMap } from '../../../utils/constants';

export class Card<T extends HTMLElement> extends Component<T> {
  protected readonly events: EventEmitter;
  protected readonly title: HTMLElement;
  protected readonly price: HTMLElement;
  protected readonly image: HTMLImageElement;
  protected readonly category: HTMLElement;
  protected id: string | null = null;

  constructor(container: T, events: EventEmitter) {
    super(container);
    this.events = events;

    this.title = this.container.querySelector('.card__title')!;
    this.price = this.container.querySelector('.card__price')!;
    this.image = this.container.querySelector('.card__image')!;
    this.category = this.container.querySelector('.card__category')!;

    this.container.addEventListener('click', () => {
      if (this.id) {
        this.events.emit('card:select', { id: this.id });
      }
    });
  }

  protected setData(data: IProduct): void {
    this.id = data.id;
    this.title.textContent = data.title;
    this.price.textContent = data.price !== null ? `${data.price} синапсов` : 'Бесценно';
    this.image.src = data.image || '';
    this.image.alt = data.title;

    const categoryClass = categoryMap[data.category] ?? 'card__category_other';
    this.category.className = `card__category ${categoryClass}`;
    this.category.textContent = data.category;
    this.container.dataset.id = data.id;
  }

  render(): HTMLElement {
    return this.container;
  }
}
