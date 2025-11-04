import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface HeaderState {
  counter: number;
}

export class Header extends Component<HeaderState> {
  private readonly events: IEvents;
  private readonly counterElement: HTMLElement | null;
  private readonly cartButton: HTMLElement | null;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;

    this.counterElement = this.container.querySelector('.header__basket-counter');
    this.cartButton = this.container.querySelector('.header__basket');
    this.cartButton?.addEventListener('click', () => {
    this.events.emit('header:cart-open');
    });
  }

  set counter(value: number) {
    if (!this.counterElement) {
      return;
    }
    this.counterElement.textContent = String(value);
    this.counterElement.classList.toggle('header__basket-counter_hidden', value === 0);
  }
}
