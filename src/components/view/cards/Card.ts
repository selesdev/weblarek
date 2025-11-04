import { IEvents } from '../../base/Events';
import { Component } from '../../base/Component';

interface BaseCardState {
  id: string;
  title?: string;
  price?: number | null;
}

export abstract class Card<T extends BaseCardState> extends Component<T> {
  protected readonly events: IEvents;
  private productId: string | null = null;
  protected readonly titleElement: HTMLElement | null;
  protected readonly priceElement: HTMLElement | null;

  protected constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
    this.titleElement = container.querySelector('.card__title');
    this.priceElement = container.querySelector('.card__price');
  }

  protected set id(value: string) {
    this.productId = value;
  }

  public set title(value: string) {
    if (this.titleElement) {
      this.titleElement.textContent = value;
    }
  }

  public set price(value: number | null) {
    if (this.priceElement) {
      this.priceElement.textContent =
        value === null ? 'Бесценно' : `${value} синапсов`;
    }
  }

  protected emit(eventName: string): void {
    if (this.productId) {
      this.events.emit(eventName, { id: this.productId });
    }
  }
}
