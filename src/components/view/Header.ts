import { Component } from '../base/Component';
import { EventEmitter } from '../base/Events';

export class Header extends Component<HTMLElement> {
  private readonly events: EventEmitter;
  private readonly counterElement: HTMLElement | null;
  private readonly cartButton: HTMLElement | null;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this.events = events;

    this.counterElement = this.container.querySelector('.header__basket-counter');
    this.cartButton = this.container.querySelector('.header__basket');
    this.cartButton?.addEventListener('click', () => {
    this.events.emit('header:cart-open');
    });
  }

  setCounter(value: number) {
    if (this.counterElement) {
      this.counterElement.textContent = String(value);
      this.counterElement.classList.toggle('header__basket-counter_hidden', value === 0);
    }
  }

  render(): HTMLElement {
    return this.container;
  }
}
