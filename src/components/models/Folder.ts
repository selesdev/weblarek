import { IEvents } from '../base/Events';
import { IProduct } from '../../types';

export class Folder {
  private items: IProduct[] = [];
  private selectedItem: IProduct | null = null;

  constructor(
    private readonly events?: IEvents,  
    private readonly itemsEvent = 'model:products-changed',
    private readonly selectedEvent = 'model:selected-product-changed'
  ) {}

  setItems(items: IProduct[]): void {
    this.items = [...items];
    this.emitItemsChange();
  }

  getItems(): IProduct[] {
    return [...this.items];
  }

  getItemById(id: string): IProduct | undefined {
    return this.items.find(item => item.id === id);
  }

  setSelectedItem(item: IProduct): void {
    this.selectedItem = item;
    this.emitSelectedChange();
  }

  clearSelectedItem(): void {
    if (!this.selectedItem) {
      return;
    }
    this.selectedItem = null;
    this.emitSelectedChange();
  }

  getSelectedItem(): IProduct | null {
    return this.selectedItem;
  }

  private emitItemsChange(): void {
    this.events?.emit(this.itemsEvent, { products: this.getItems()});
  }

  private emitSelectedChange(): void {
    this.events?.emit(this.selectedEvent, { product: this.getSelectedItem()});
  }
}