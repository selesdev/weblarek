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
  private readonly titleElement: HTMLElement;
  private readonly priceElement: HTMLElement;
  private readonly imageElement: HTMLImageElement;
  private readonly categoryElement: HTMLElement;

  constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.titleElement = this.container.querySelector('.card__title') as HTMLElement;
    this.priceElement = this.container.querySelector('.card__price') as HTMLElement;
    this.imageElement = this.container.querySelector('.card__image') as HTMLImageElement;
    this.categoryElement = this.container.querySelector('.card__category') as HTMLElement;

    this.container.addEventListener('click', () => {
      this.emit('card:select');
    });
  }

  set title(value: string) {
    this.titleElement.textContent = value;
    this.imageElement.alt = value;
  }

  set price(value: number | null) {
    this.priceElement.textContent = value === null ? 'Бесценно' : `${value} синапсов`;
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