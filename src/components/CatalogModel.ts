import { EventEmitter } from './base/Events';
import { IProduct, IBuyer } from '../types';
import { Folder } from './base/models/Folder';
import { Cart } from './base/models/Cart';
import { Buyer } from './base/models/Buyer';

export class CatalogModel {
  private readonly productsStore:Folder;
  private readonly cart:Cart;
  private readonly buyer:Buyer;
  private selectedProduct: IProduct | null = null;
 
  constructor(events: EventEmitter) {
    this.productsStore = new Folder(events);
    this.cart = new Cart(events);
    this.buyer = new Buyer(events);
  }
 
  setProducts(products: IProduct[]): void {
    this.productsStore.setItems(products);
  }
 
  getProducts(): IProduct[] {
    return this.productsStore.getItems();
  }
 
  getProductById(id: string): IProduct | undefined {
    return this.productsStore.getItemById(id);
  }
 
  setSelectedProduct(product: IProduct | null): void {
    if (product) {
      this.productsStore.setSelectedItem(product);
    } else {
      this.productsStore.clearSelectedItem();
    }
    this.selectedProduct = product;
  }
 
  getSelectedProduct(): IProduct | null {
    return this.selectedProduct;
  }
 
  addToBasket(product: IProduct): void {
    if (this.cart.hasItem(product.id)) {
      return;
    }
    this.cart.addItem(product);
  }
 
  removeFromBasket(index: number): void {
    const items = this.cart.getItems();
    if (index < 0 || index >= items.length) {
      return;
    }
    this.cart.removeItem(items[index]);
  }

  removeFromBasketById(id: string): void {
    const item = this.cart.getItems().find(product => product.id === id);

    if (!item) {
      return;
    }
    this.cart.removeItem(item);
   }
 
  clearBasket(): void {
    this.cart.clear();
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
   }
 
  clearBuyer(): void {
    this.buyer.clear();
   }
 
  getBuyer(): Partial<IBuyer> {
    return this.buyer.getData();
  }
 }