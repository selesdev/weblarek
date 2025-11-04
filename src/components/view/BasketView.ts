import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface BasketViewState {
  items: HTMLElement[];
  total: string;
}

export class BasketView extends Component<BasketViewState> {
  private readonly events: IEvents;
  private readonly list: HTMLElement;
  private readonly totalField: HTMLElement;
  private readonly orderButton: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
    this.list = this.container.querySelector('.basket__list') as HTMLElement;
    this.totalField = this.container.querySelector('.basket__price') as HTMLElement;
    this.orderButton = this.container.querySelector('.basket__button') as HTMLButtonElement;

    this.orderButton.addEventListener('click', () => {
      if (!this.orderButton.disabled) {
        this.events.emit('basket:order');
      }
    });
  }

  set items(elements: HTMLElement[]) {
    this.list.replaceChildren(...elements);
    this.orderButton.disabled = elements.length === 0;
  }

  set total(value: string) {
    this.totalField.textContent = value;
  }
}