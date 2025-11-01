import { Component } from '../base/Component';
import { EventEmitter } from '../base/Events';

export class Modal extends Component<HTMLElement> {
  private readonly events: EventEmitter;
  private readonly closeButton: HTMLElement;
  private readonly content: HTMLElement;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this.events = events;

    this.closeButton = this.container.querySelector('.modal__close')!;
    this.content = this.container.querySelector('.modal__content')!;

    this.closeButton.addEventListener('click', () => this.close());
    this.container.addEventListener('click', (event) => {
    if (event.target === this.container) {
      this.close();
    }
    });
  }

  open(content: HTMLElement) {
    this.content.innerHTML = '';
    this.content.append(content);
    this.container.classList.add('modal_active');
    this.events.emit('modal:open');
  }

  close() {
    this.container.classList.remove('modal_active');
    this.content.innerHTML = '';
    this.events.emit('modal:close');
  }
}