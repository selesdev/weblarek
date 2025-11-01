import { Component } from '../base/Component';
import { EventEmitter } from '../base/Events';
import { selectors } from '../../utils/constants';
import { cloneTemplate, ensureElement } from '../../utils/utils';

export class Success extends Component<HTMLElement> {
  private readonly events: EventEmitter;
  private readonly description: HTMLElement;
  private readonly closeButton: HTMLButtonElement;

  constructor(events: EventEmitter) {
    const template = ensureElement<HTMLTemplateElement>(selectors.success);
    super(cloneTemplate<HTMLElement>(template));
    this.events = events;
    this.description = this.container.querySelector('.order-success__description') as HTMLElement;
    this.closeButton = this.container.querySelector('.order-success__close') as HTMLButtonElement;
    this.closeButton.addEventListener('click', () => {
      this.events.emit('success:close');
  });
  }

 setMessage(message: string) {
    this.description.textContent = message;
  }
}
