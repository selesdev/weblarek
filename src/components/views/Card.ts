import { Component } from '../base/Component';
import { IProductView } from '../../types';

const CategoryClass: Record<string, string> = {
    'софт-скил': 'card__category_soft',
    'хард-скил': 'card__category_hard',
    'дополнительное': 'card__category_additional',
    'кнопка': 'card__category_button',
    'другое': 'card__category_other'
};

interface ICardActions {
    onClick: (event: MouseEvent) => void;
}

export class Card extends Component<IProductView> {
    protected _title: HTMLElement;
    protected _image?: HTMLImageElement;
    protected _description?: HTMLElement;
    protected _button?: HTMLButtonElement;
    protected _category?: HTMLElement;
    protected _price: HTMLElement;
    protected _index?: HTMLElement;

    constructor(
        protected blockName: string, 
        container: HTMLElement, 
        actions?: ICardActions
    ) {
        super(container);

        this._title = container.querySelector(`.${blockName}__title`)!;
        this._image = container.querySelector(`.${blockName}__image`)!;
        this._button = container.querySelector(`.${blockName}__button`)!;
        this._description = container.querySelector(`.${blockName}__text`)!;
        this._category = container.querySelector(`.${blockName}__category`)!;
        this._price = container.querySelector(`.${blockName}__price`)!;
        this._index = container.querySelector('.basket__item-index')!;

        if (actions?.onClick) {
            if (this._button) {
                this._button.addEventListener('click', actions.onClick);
            } else {
                container.addEventListener('click', actions.onClick);
            }
        }
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || '';
    }

    set title(value: string) {
        this.setText(this._title, value);
    }

    get title(): string {
        return this._title.textContent || '';
    }

    set image(value: string) {
         if (this._image) {this.setImage(this._image, value, this.title);}
    }

    set description(value: string) {
        if (this._description) {
        this.setText(this._description, value);}
    }

    set category(value: string) {
        if (this._category) {this.setText(this._category, value);
        this._category?.classList.add(CategoryClass[value] || 'card__category_other');}
    }

    set price(value: string) {
        this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
        if (this._button && !value) {
            this.setElementDisabled(this._button, true);
        }
    }

    set index(value: number) {
         if (this._index) { this.setText(this._index, value.toString());}
    }

    set button(data: { text: string; disabled: boolean }) {
        if (this._button) {
            this._button.textContent = data.text;
            this.setElementDisabled(this._button, data.disabled);
        }
    }
}