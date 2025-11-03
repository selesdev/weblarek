import { EventEmitter } from '../Events';
import { IProduct, IBasketChangePayload } from '../../../types';

export class Cart {
  private items: IProduct[] = [];

  constructor(
    private readonly events?: EventEmitter,
    private readonly eventName = 'model:basket-changed'
  ) {}

  getItems(): IProduct[] {
    return this.items;
  }

  addItem(item: IProduct): void {
    this.items.push(item);
    this.emitChange();
  }

  removeItem(item: IProduct): void {
    this.items = this.items.filter(i => i.id !== item.id);
    this.emitChange();
  }

  clear(): void {
    this.items = [];
    this.emitChange();
  }

  getTotalPrice(): number {
    return this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  getCount(): number {
    return this.items.length;
  }

  hasItem(id: string): boolean {
    return this.items.some(i => i.id === id);
  }

  private emitChange(): void {
    this.events?.emit<IBasketChangePayload>(this.eventName, {
      items: this.getItems(),
      total: this.getTotalPrice(),
    });
  }
}