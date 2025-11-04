import { Card } from './Card';
import { IEvents } from '../../base/Events';
import { categoryMap } from '../../../utils/constants';

interface CatalogCardState {
  id: string;
  title: string;
  price: number | null;
  image: string;
  category: string;
}

export class CatalogCard extends Card<CatalogCardState> {
  private readonly imageElement: HTMLImageElement;
  private readonly categoryElement: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.imageElement = this.container.querySelector('.card__image') as HTMLImageElement;
    this.categoryElement = this.container.querySelector('.card__category') as HTMLElement;

    this.container.addEventListener('click', () => {
      this.emit('card:select');
    });
  }

  override set title(value: string) {
    super.title = value;
    this.imageElement.alt = value;
  }

  set image(src: string) {
    this.imageElement.src = src;
  }

  set category(value: string) {
    const modifier = categoryMap[value] ?? 'card__category_other';
    this.categoryElement.className = `card__category ${modifier}`;
    this.categoryElement.textContent = value;
  }
}