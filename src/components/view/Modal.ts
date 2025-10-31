import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';

export class Modal extends Component<HTMLElement> {
  protected _events: EventEmitter;
  protected _closeButton: HTMLElement;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container); 
    this._events = events;

    this._closeButton = container.querySelector('.modal__close')!;
    this._closeButton.addEventListener('click', () => {
      this.close();
      this._events.emit('modal:close');
    });
  }

  open() {
    this.container.classList.add('modal_active');
    this._events.emit('modal:open');
  }

  close() {
    this.container.classList.remove('modal_active');
    this._events.emit('modal:close');
  }

  render(): HTMLElement {
    return this.container;
  }
}