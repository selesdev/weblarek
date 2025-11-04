import { IEvents } from '../base/Events';
import { IProduct, IBasketChangePayload } from '../../types';

export class Cart {
  private items: IProduct[] = [];

  constructor(
    private readonly events?: IEvents,
    private readonly eventName = 'model:basket-changed'
  ) {}

  getItems(): IProduct[] {
    return [...this.items];
  }

  addItem(item: IProduct): void {
    if (this.hasItem(item.id)) {
      return;
    }

    this.items = [...this.items, item];
    this.emitChange();
  }

  removeItem(item: IProduct): void {
    const nextItems = this.items.filter(i => i.id !== item.id);

    if (nextItems.length === this.items.length) {
      return;
    }

    this.items = nextItems;
    this.emitChange();
  }

  removeItemById(id: string): void {
    const item = this.items.find(current => current.id === id);
    if (item) {
      this.removeItem(item);
    }
  }

  clear(): void {
    if (this.items.length === 0) {
      return;
    }

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
    const payload: IBasketChangePayload = {
      items: this.getItems(),
      total: this.getTotalPrice(),
    };

    this.events?.emit(this.eventName, payload);
  }
}