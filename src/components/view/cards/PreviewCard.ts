import { Component } from '../../base/Component';
import { EventEmitter } from '../../base/events';
import { categoryMap } from '../../../utils/constants';

interface IPreviewData {
  title: string;
  category: string;
  text: string;
  price: string;
  image: string;
}

export class PreviewCard extends Component<HTMLElement> {
  protected _events: EventEmitter;
  protected _title: HTMLElement;
  protected _category: HTMLElement;
  protected _text: HTMLElement;
  protected _price: HTMLElement;
  protected _image: HTMLImageElement;
  protected _button: HTMLButtonElement;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this._events = events;

    this._title = container.querySelector('.card__title') as HTMLElement;
    this._category = container.querySelector('.card__category') as HTMLElement;
    this._text = container.querySelector('.card__text') as HTMLElement;
    this._price = container.querySelector('.card__price') as HTMLElement;
    this._image = container.querySelector('.card__image') as HTMLImageElement;
    this._button = container.querySelector('.card__button') as HTMLButtonElement;

    this._button.addEventListener('click', () => {
      this._events.emit('preview:add-to-basket', {
        title: this._title.textContent,
        price: this._price.textContent,
      });
    });
  }

  setData(data: IPreviewData) {
    this._title.textContent = data.title;
    this._category.textContent = data.category;
    this._category.className = `card__category ${categoryMap[data.category] || 'card__category_other'}`;
    this._text.textContent = data.text;
    this._price.textContent = data.price;
    this._image.src = data.image;
    this._image.alt = data.title;
  }

  render(): HTMLElement {
    return this.container;
  }
}
