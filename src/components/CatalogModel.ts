import { EventEmitter } from './base/events';
import { IProduct, IBuyer } from '../types';

export class CatalogModel {
  private products: IProduct[] = [];
  private selectedProduct: IProduct | null = null;
  private basket: IProduct[] = [];
  private buyer: Partial<IBuyer> = {};

  constructor(private _events: EventEmitter) {}

  setProducts(products: IProduct[]) {
    this.products = products;
    this._events.emit('model:products-changed', { products });
  }

  getProducts(): IProduct[] {
    return this.products;
  }

  getProductById(id: string): IProduct | undefined {
    return this.products.find(p => p.id === id);
  }

  setSelectedProduct(product: IProduct) {
    this.selectedProduct = product;
    this._events.emit('model:selected-product-changed', { product });
  }

  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }

  addToBasket(product: IProduct) {
    this.basket.push(product);
    this._events.emit('model:basket-changed', { basket: this.basket });
  }

  removeFromBasket(index: number) {
    this.basket.splice(index, 1);
    this._events.emit('model:basket-changed', { basket: this.basket });
  }

  clearBasket() {
    this.basket = [];
    this._events.emit('model:basket-changed', { basket: this.basket });
  }

  getBasket(): IProduct[] {
    return this.basket;
  }

  setBuyer(buyer: Partial<IBuyer>) {
    this.buyer = { ...this.buyer, ...buyer };
    this._events.emit('model:buyer-changed', { buyer: this.buyer });
  }

  getBuyer(): Partial<IBuyer> {
    return this.buyer;
  }
}
