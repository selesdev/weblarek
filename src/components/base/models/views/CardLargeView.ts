import { IProduct } from '../../../../types';

export class CardLargeView {
  private node: HTMLElement;

  constructor(product: IProduct) {
    this.node = document.createElement('div');
    this.node.className = 'large-card';
    this.node.innerHTML = `
      <h2>${product.title}</h2>
      <img src="${product.image}" alt="${product.title}">
      <p>${product.description}</p>
      <span>${product.price} ₽</span>
    `;
  }

  public render(): HTMLElement {
    return this.node;
  }
}
