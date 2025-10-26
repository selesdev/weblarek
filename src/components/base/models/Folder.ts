import { IProduct } from "../../../types";
import { Model } from "./Model";

export class Folder extends Model<IProduct[]> {
  private items: IProduct[] = [];
  private selectedItem: IProduct | null = null;

  setItems(items: IProduct[]): void {
    this.items = items;
    this.emit('folder:update', this.items);
  }

  getItems(): IProduct[] {
    return this.items;
  }

  getItemById(id: string): IProduct | undefined {
    return this.items.find(item => item.id === id);
  }

  setSelectedItem(item: IProduct): void {
    this.selectedItem = item;
    this.emit('folder:select', this.selectedItem);
  }

  getSelectedItem(): IProduct | null {
    return this.selectedItem;
  }
}
