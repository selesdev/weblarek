import { IProduct } from '../../../../types';

export class CardSmallView {
  private product: IProduct;
  private node: HTMLElement;

  constructor(product: IProduct) {
    this.product = product;
    this.node = document.createElement('div');
    this.node.className = 'product-card';
    this.node.innerHTML = `
      <img src="${product.image}" alt="${product.title}">
      <h3>${product.title}</h3>
      <span>${product.price} ₽</span>
      <button class="add-btn">В корзину</button>
      <button class="view-btn">Подробнее</button>
    `;
  }

  public setEventListeners(
    addCallback: (p: IProduct) => void,
    viewCallback: (p: IProduct) => void
  ) {
    this.node.querySelector('.add-btn')?.addEventListener('click', () => addCallback(this.product));
    this.node.querySelector('.view-btn')?.addEventListener('click', () => viewCallback(this.product));
  }

  public render(): HTMLElement {
    return this.node;
  }
}
