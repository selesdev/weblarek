import { IProduct } from "../../../../types";

export abstract class CardView {
  protected item: IProduct;
  protected element: HTMLElement;
  protected button: HTMLButtonElement;

  constructor(item: IProduct) {
    this.item = item;
    this.element = document.createElement('div');
    this.button = document.createElement('button');
  }

  abstract render(): HTMLElement;

  // универсальный обработчик кнопки (покупка/удаление)
  protected onButtonClick(): void {}
}
