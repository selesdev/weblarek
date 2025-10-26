import { IProduct } from "../../../../types";
import { ModalView } from "./ModalView";
import { CartView } from "./CartView";

export class AppView {
  protected gallery: HTMLElement;
  protected modal: ModalView;
  protected cart: CartView;

  constructor(gallerySelector: string, modal: ModalView, cart: CartView) {
    const el = document.querySelector(gallerySelector);
    if (!el) throw new Error(`Элемент ${gallerySelector} не найден`);
    this.gallery = el as HTMLElement;
    this.modal = modal;
    this.cart = cart;
  }

  showCatalog(nodes: HTMLElement[]): void {
    this.gallery.innerHTML = '';
    nodes.forEach(node => this.gallery.appendChild(node));
  }

  showModal(content: HTMLElement): void {
    this.modal.open(content);
  }

  updateCart(items: IProduct[]): void {
    this.cart.update(items);
  }
}
