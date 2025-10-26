import { Component } from '../base/Component';
import { IEvents } from '../base/events';

interface IBasketView {
    items: HTMLElement[];
    total: number;
    selected: boolean;
}

export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._list = container.querySelector('.basket__list') as HTMLElement;
        this._total = container.querySelector('.basket__price') as HTMLElement;
        this._button = container.querySelector('.basket__button') as HTMLButtonElement;

        if (this._button) {
            this._button.addEventListener('click', () => {
                events.emit('order:open');
            });
        }

        this.items = [];
    }

    set items(items: HTMLElement[]) {
        if (items.length) {
            this._list.replaceChildren(...items);
        } else {
            this._list.replaceChildren(this.createElement('p', {
                textContent: 'Корзина пуста'
            }));
        }
    }

    set selected(items: boolean) {
        this.setElementDisabled(this._button, !items);
    }

    set total(total: number) {
        this.setText(this._total, `${total} синапсов`);
    }

    protected createElement(tagName: string, props?: Partial<HTMLElement>): HTMLElement {
        const element = document.createElement(tagName);
        if (props) {
            Object.assign(element, props);
        }
        return element;
    }
}