import { IProduct } from '../../../../types';

export class CardCartView {
  private element: HTMLElement;
  private removeHandler?: (product: IProduct) => void;

  constructor(private product: IProduct) {
    this.element = document.createElement('div');
    this.element.classList.add('cart-item');
  }

  render(): HTMLElement {
    const image = this.product.image || 'https://via.placeholder.com/60x60?text=No+Image';
    const title = this.product.title || 'Без названия';
    const price = this.product.price ?? 0;

    this.element.innerHTML = `
      <div class="cart-item__info">
        <img src="${image}" alt="${title}" class="cart-item__img" />
        <div>
          <h4 class="cart-item__title">${title}</h4>
          <p class="cart-item__price">${price.toLocaleString()} ₽</p>
        </div>
      </div>
      <button class="cart-item__remove">Удалить</button>
    `;

    const removeBtn = this.element.querySelector('.cart-item__remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (this.removeHandler) this.removeHandler(this.product);
      });
    }

    return this.element;
  }

  setRemoveHandler(handler: (product: IProduct) => void) {
    this.removeHandler = handler;
  }
}
