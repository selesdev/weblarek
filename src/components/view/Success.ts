import { Component } from '../base/Component';
import { IEvents } from '../base/Events';

interface SuccessState {
  message: string;
}

export class Success extends Component<SuccessState> {
  private readonly events: IEvents;
  private readonly description: HTMLElement;
  private readonly closeButton: HTMLButtonElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
    this.description = this.container.querySelector('.order-success__description') as HTMLElement;
    this.closeButton = this.container.querySelector('.order-success__close') as HTMLButtonElement;
    this.closeButton.addEventListener('click', () => {
      this.events.emit('success:close');
  });
  }

  set message(value: string) {
    this.description.textContent = value;
  }
}
