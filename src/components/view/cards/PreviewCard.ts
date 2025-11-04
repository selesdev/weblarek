import { Card } from './Card';
import { IEvents } from '../../base/Events';
import { categoryMap } from '../../../utils/constants';

interface PreviewCardState {
  id: string;
  title: string;
  description: string;
  price: number | null;
  image: string;
  category: string;
  inBasket: boolean;
}


  export class PreviewCard extends Card<PreviewCardState> {
  private readonly categoryElement: HTMLElement;
  private readonly descriptionElement: HTMLElement;
  private readonly imageElement: HTMLImageElement;
  private readonly button: HTMLButtonElement;

    constructor(container: HTMLElement, events: IEvents) {
    super(container, events);
    this.categoryElement = this.container.querySelector('.card__category') as HTMLElement;
    this.descriptionElement = this.container.querySelector('.card__text') as HTMLElement;
    this.imageElement = this.container.querySelector('.card__image') as HTMLImageElement;
    this.button = this.container.querySelector('.card__button') as HTMLButtonElement;

    this.button.addEventListener('click', () => {
      if (this.button.disabled) {
        return;
      }

      const action = this.button.classList.contains('card__button_remove') ? 'preview:remove' : 'preview:buy';
      this.emit(action);
    });
  }

   override set title(value: string) {
    super.title = value;
    this.imageElement.alt = value;
  }


    set category(value: string) {
    const modifier = categoryMap[value] ?? 'card__category_other';
    this.categoryElement.className = `card__category ${modifier}`;
    this.categoryElement.textContent = value;
  }

    set description(value: string) {
    this.descriptionElement.textContent = value;
  }

  override set price(value: number | null) {
    super.price = value;
    if (value === null) {
      this.button.disabled = true;
      this.button.textContent = 'Недоступно';
      this.button.classList.remove('card__button_remove');
      return;
    }
    this.button.disabled = false;
    if (!this.button.classList.contains('card__button_remove')) {
      this.button.textContent = 'В корзину';
    }
  }

  set image(src: string) {
    this.imageElement.src = src;
  }

  set inBasket(value: boolean) {
    if (this.button.disabled) {
      return;
    }

    this.button.classList.toggle('card__button_remove', value);
    this.button.textContent = value ? 'Удалить из корзины' : 'В корзину';
  }
}
