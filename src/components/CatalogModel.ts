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
  private productsStore = new Folder();
  private cart = new Cart();
  private buyer = new Buyer();
 
  constructor(private readonly events: EventEmitter) {}
 
   setProducts(products: IProduct[]) {
    this.productsStore.setItems(products);
    this.events.emit('model:products-changed', { products });
   }
 
   getProducts(): IProduct[] {
    return this.productsStore.getItems();
   }
 
   getProductById(id: string): IProduct | undefined {
    return this.productsStore.getItemById(id);
   }
 
  setSelectedProduct(product: IProduct | null) {
    if (product) {
      this.productsStore.setSelectedItem(product);
    }
    this.events.emit('model:selected-product-changed', { product });
   }
 
   getSelectedProduct(): IProduct | null {
    return this.productsStore.getSelectedItem();
   }
 
   addToBasket(product: IProduct) {
    this.cart.addItem(product);
    this.emitBasketChanges();
   }
 
   removeFromBasket(index: number) {
    this.cart.removeItemByIndex(index);
    this.emitBasketChanges();
  }
  removeFromBasketById(id: string) {
    const index = this.cart.getItems().findIndex(item => item.id === id);
    if (index !== -1) {
      this.removeFromBasket(index);
    }
   }
 
   clearBasket() {
    this.cart.clear();
    this.emitBasketChanges();
   }
 
   getBasket(): IProduct[] {
    return this.cart.getItems();
  }

  getBasketTotal(): number {
    return this.cart.getTotalPrice();
  }

  setBuyer(data: Partial<IBuyer>) {
    this.buyer.setData(data);
    this.events.emit('model:buyer-changed', { buyer: this.getBuyer() });
   }
 
  clearBuyer() {
    this.buyer.clear();
    this.events.emit('model:buyer-changed', { buyer: this.getBuyer() });
   }
 
   getBuyer(): Partial<IBuyer> {
    return this.buyer.getData();
  }

  private emitBasketChanges() {
   const items = this.cart.getItems();
    this.events.emit('model:basket-changed', {
      items,
      total: this.cart.getTotalPrice(),
    } satisfies IBasketChangePayload);
   }
 }