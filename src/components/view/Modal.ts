import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface ModalState {
  content: HTMLElement;
}

export class Modal extends Component<ModalState> {
  private readonly events: IEvents;
  private readonly closeButton: HTMLElement;
  private readonly contentContainer: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
    this.closeButton = ensureElement<HTMLElement>('.modal__close', container);
    this.contentContainer = ensureElement<HTMLElement>('.modal__content', container);

    this.closeButton.addEventListener('click', () => {
    this.events.emit('modal:close');
    });

    this.container.addEventListener('click', event => {
      if (event.target === this.container) {
        this.events.emit('modal:close');
      }
    });
  }

  set content(element: HTMLElement) {
    this.contentContainer.replaceChildren(element);
    this.container.classList.add('modal_active');
  }

  open(element: HTMLElement): void {
    this.content = element;
  }

  close(): void {
    this.container.classList.remove('modal_active');
    this.contentContainer.replaceChildren();
  }
}