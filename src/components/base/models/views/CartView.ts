import { IProduct } from '../../../../types';
import { CardCartView } from './CardCartView';

export class CartView {
  private container: HTMLElement;

  constructor(private selector: string) {
    const node = document.querySelector(selector);
    if (!node) {
      throw new Error('Cart container not found!');
    }
    this.container = node as HTMLElement;
  }

  update(items: IProduct[]) {
    this.container.innerHTML = '';

    if (!items || items.length === 0) {
      this.container.innerHTML = '<p class="cart-empty">Корзина пуста</p>';
      return;
    }

    items.forEach((item) => {
      const card = new CardCartView(item);
      const node = card.render();

      card.setRemoveHandler((product) => {
        const event = new CustomEvent('cart:remove', { detail: product });
        document.dispatchEvent(event);
      });

      this.container.appendChild(node);
    });

    // безопасное суммирование
    const total = items.reduce((sum, i) => sum + (i.price ?? 0), 0);

    const totalEl = document.createElement('div');
    totalEl.classList.add('cart-total');
    totalEl.textContent = `Итого: ${total.toLocaleString()} ₽`;
    this.container.appendChild(totalEl);
  }

  getContent(): HTMLElement {
    return this.container;
  }
}
