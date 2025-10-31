import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';

export class Header extends Component<HTMLElement> {
  private _events: EventEmitter;
  private _counterEl: HTMLElement | null;
  private _cartButton: HTMLElement | null;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this._events = events;

    this._counterEl = this.container.querySelector('.header__basket-counter');
    this._cartButton = this.container.querySelector('.header__basket');
    this._cartButton?.addEventListener('click', () => {
      this._events.emit('header:cart-open');
    });
  }

  setCounter(value: number) {
    if (this._counterEl) {
      this._counterEl.textContent = String(value);
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}
