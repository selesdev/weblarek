import { Component } from '../../base/Component';
import { EventEmitter } from '../../base/Events';
import { IProduct } from '../../../types';
import { categoryMap, selectors } from '../../../utils/constants';
import { cloneTemplate, ensureElement } from '../../../utils/utils';

export class PreviewCard extends Component<HTMLElement> {
  private readonly events: EventEmitter;
  private readonly title: HTMLElement;
  private readonly category: HTMLElement;
  private readonly text: HTMLElement;
  private readonly price: HTMLElement;
  private readonly image: HTMLImageElement;
  private readonly button: HTMLButtonElement;
  private product: IProduct | null = null;
  private inBasket = false;


  constructor(events: EventEmitter) {
    const template = ensureElement<HTMLTemplateElement>(selectors.cardPreview);
    super(cloneTemplate<HTMLElement>(template));
    this.events = events;

    this.title = this.container.querySelector('.card__title')!;
    this.category = this.container.querySelector('.card__category')!;
    this.text = this.container.querySelector('.card__text')!;
    this.price = this.container.querySelector('.card__price')!;
    this.image = this.container.querySelector('.card__image')!;
    this.button = this.container.querySelector('.card__button')!;

    this.button.addEventListener('click', () => {
      if (!this.product || this.product.price === null) {
        return;
      }

      if (this.inBasket) {
        this.events.emit('preview:remove');
      } else {
        this.events.emit('preview:buy');
      }
    });
  }

   setProduct(product: IProduct, inBasket: boolean): void {
    this.product = product;
    this.title.textContent = product.title;
    this.text.textContent = product.description || '';
    this.price.textContent = product.price !== null ? `${product.price} синапсов` : 'Бесценно';
    this.image.src = product.image || '';
    this.image.alt = product.title;

    const categoryClass = categoryMap[product.category] ?? 'card__category_other';
    this.category.className = `card__category ${categoryClass}`;
    this.category.textContent = product.category;

    this.updateButtonState(inBasket);
  }

  setBasketState(inBasket: boolean): void {
    if (!this.product) {
      return;
    }
    this.updateButtonState(inBasket);
  }

  getProduct(): IProduct | null {
    return this.product;
  }
  private updateButtonState(inBasket: boolean): void {
    this.inBasket = inBasket;

    if (!this.product || this.product.price === null) {
      this.button.disabled = true;
      this.button.textContent = 'Недоступно';
      return;
    }

    this.button.disabled = false;
    this.button.textContent = inBasket ? 'Удалить из корзины' : 'Купить';
  }
}
