import { IProduct } from "../../../types";
import { Model } from "./Model";

export class Cart extends Model<IProduct[]> {
  private items: IProduct[] = [];

  addItem(item: IProduct): void {
    this.items.push(item);
    this.emit('cart:change', this.items);
  }

  removeItem(item: IProduct): void {
    this.items = this.items.filter(i => i.id !== item.id);
    this.emit('cart:change', this.items);
  }

  clear(): void {
    this.items = [];
    this.emit('cart:clear');
  }

  getItems(): IProduct[] {
    return this.items;
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
}
