import { Component } from '../base/Component';
import { EventEmitter } from '../base/events';
import { cloneTemplate } from '../../utils/utils';

export class Success extends Component<HTMLElement> {
  protected _events: EventEmitter;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this._events = events;
  }

  open(message?: string) {
    const modalContent = this.container.querySelector('.modal__content') as HTMLElement;
    if (!modalContent) return;

    modalContent.innerHTML = '';

    const template = cloneTemplate<HTMLElement>('#success');
    modalContent.appendChild(template);

    const desc = modalContent.querySelector('.order-success__description') as HTMLElement | null;
    const btn = modalContent.querySelector('.order-success__close') as HTMLButtonElement | null;

    if (desc && message) desc.textContent = message;
    if (btn) {
      btn.addEventListener('click', () => {
        modalContent.innerHTML = '';
        this.container.classList.remove('modal_active');
        this._events.emit('success:close');
      });
    }

    this.container.classList.add('modal_active');
    this._events.emit('success:open');
  }

  close() {
    const modalContent = this.container.querySelector('.modal__content') as HTMLElement;
    if (modalContent) modalContent.innerHTML = '';
    this.container.classList.remove('modal_active');
    this._events.emit('success:close');
  }

  render(): HTMLElement {
    return this.container;
  }
}
