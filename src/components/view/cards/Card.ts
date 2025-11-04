import { IEvents } from '../../base/Events';
import { Component } from '../../base/Component';

export abstract class Card<T extends { id: string }> extends Component<T> {
  protected readonly events: IEvents;
  private productId: string | null = null;

  protected constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
  }

  protected set id(value: string) {
    this.productId = value;
  }

  protected emit(eventName: string): void {
    if (this.productId) {
      this.events.emit(eventName, { id: this.productId });
    }
  }
}
