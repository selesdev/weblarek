import { Component } from '../../base/Component';
import { EventEmitter } from '../../base/events';

export class BasketCard extends Component<HTMLElement> {
  protected _events: EventEmitter;
  protected _deleteButton!: HTMLButtonElement;
  protected _title!: HTMLElement;
  protected _price!: HTMLElement;
  protected _index!: HTMLElement;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this._events = events;

    this._deleteButton = container.querySelector('.basket__item-delete') as HTMLButtonElement;
    this._title = container.querySelector('.card__title') as HTMLElement;
    this._price = container.querySelector('.card__price') as HTMLElement;
    this._index = container.querySelector('.basket__item-index') as HTMLElement;
  }

  setIndex(index: number) {
    if (this._index) this._index.textContent = String(index);
  }

  setData(title: string, price: string) {
    if (this._title) this._title.textContent = title;
    if (this._price) this._price.textContent = price;
  }

  setDeleteHandler(handler: () => void) {
    if (this._deleteButton) {
      this._deleteButton.addEventListener('click', handler);
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}
