import { Card } from './Card';
import { IEvents } from '../../base/Events';

interface BasketCardState {
  id: string;
  title: string;
  price: number | null;
  index: number;
}

  export class BasketCard extends Card<BasketCardState> {
  private readonly deleteButton: HTMLButtonElement;
  private readonly indexElement: HTMLElement;
  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.deleteButton = this.container.querySelector('.basket__item-delete') as HTMLButtonElement;
    this.indexElement = this.container.querySelector('.basket__item-index') as HTMLElement;

    this.deleteButton.addEventListener('click', () => {
      this.emit('basket:item-remove');
    });
  }

  set index(value: number) {
    this.indexElement.textContent = String(value);
  }
}
