import { IProduct } from '../../../types';
import { EventEmitter } from '../../base/events';
import { Component } from '../../base/Component';
import { categoryMap } from '../../../utils/constants';

export class Card<T extends HTMLElement> extends Component<T> {
  protected _events: EventEmitter;
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _image: HTMLImageElement;
  protected _category: HTMLElement;

  constructor(container: T, events: EventEmitter) {
    super(container);
    this._events = events;

    this._title = this.container.querySelector('.card__title')!;
    this._price = this.container.querySelector('.card__price')!;
    this._image = this.container.querySelector('.card__image')!;
    this._category = this.container.querySelector('.card__category')!;

    this.container.addEventListener('click', () => {
      this._events.emit('card:click', { element: this.container });
    });
  }

  setData(data: IProduct) {
    this._title.textContent = data.title;
    this._price.textContent = data.price !== null ? `${data.price} синапсов` : 'Бесценно';
    this._image.src = data.image || '';
    this._image.alt = data.title;

    const categoryClass = (categoryMap as Record<string, string>)[data.category] || 'card__category_other';
    this._category.className = `card__category ${categoryClass}`;

    this.container.dataset.id = data.id;

  }

  render(): HTMLElement {
    return this.container;
  }
}
