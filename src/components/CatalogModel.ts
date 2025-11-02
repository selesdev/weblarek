import { EventEmitter } from './base/Events';
import { IProduct, IBuyer } from '../types';
import { Folder } from './base/models/Folder';
import { Cart } from './base/models/Cart';
import { Buyer } from './base/models/Buyer';

export interface IBasketChangePayload {
  items: IProduct[];
  total: number;
}
 
export class CatalogModel {
  private readonly productsStore = new Folder();
  private readonly cart = new Cart();
  private readonly buyer = new Buyer();
 
  constructor(private readonly events: EventEmitter) {}
 
  setProducts(products: IProduct[]): void {
    this.productsStore.setItems(products);
    this.events.emit('model:products-changed', { products });
   }
 
  getProducts(): IProduct[] {
    return this.productsStore.getItems();
   }
 
  getProductById(id: string): IProduct | undefined {
    return this.productsStore.getItemById(id);
   }
 
  setSelectedProduct(product: IProduct | null): void {
    this.productsStore.setSelectedItem(product);
    this.events.emit('model:selected-product-changed', { product });
   }
 
  getSelectedProduct(): IProduct | null {
    return this.productsStore.getSelectedItem();
   }
 
  addToBasket(product: IProduct): void {
    if (this.cart.hasItem(product.id)) {
      return;
    }
    this.cart.addItem(product);
    this.emitBasketChanges();
  }
 
  removeFromBasket(index: number):void {
    const items = this.cart.getItems();
    if (index < 0 || index >= items.length) {
      return;
    }
    this.cart.removeItem(items[index]);
    this.emitBasketChanges();
  }
  removeFromBasketById(id: string): void {
    const item = this.cart.getItems().find(product => product.id === id);

    if (!item) {
      return;
    }
    this.cart.removeItem(item);
    this.emitBasketChanges();
   }
 
  clearBasket():void {
    this.cart.clear();
    this.emitBasketChanges();
   }
 
  getBasket(): IProduct[] {
    return this.cart.getItems();
  }

  getBasketTotal(): number {
    return this.cart.getTotalPrice();
  }

  isInBasket(id: string): boolean {
    return this.cart.hasItem(id);
  }

  setBuyer(data: Partial<IBuyer>): void {
    this.buyer.setData(data);
    this.events.emit('model:buyer-changed', { buyer: this.getBuyer() });
   }
 
  clearBuyer():void {
    this.buyer.clear();
    this.events.emit('model:buyer-changed', { buyer: this.getBuyer() });
   }
 
  getBuyer(): Partial<IBuyer> {
    return this.buyer.getData();
  }

  private emitBasketChanges():void {
   const items = this.cart.getItems();
    this.events.emit('model:basket-changed', {
      items,
      total: this.cart.getTotalPrice(),
    } satisfies IBasketChangePayload);
   }
 }