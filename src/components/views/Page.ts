import { Component } from '../base/Component';
import { IEvents } from '../base/events';

interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}

export class Page extends Component<IPage> {
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _basket: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._counter = container.querySelector('.header__basket-counter') as HTMLElement;
        this._catalog = container.querySelector('.gallery') as HTMLElement;
        this._wrapper = container.querySelector('.page__wrapper') as HTMLElement;
        this._basket = container.querySelector('.header__basket') as HTMLButtonElement;

        this._basket.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set counter(value: number) {
        this.setText(this._counter, String(value));
    }

    set catalog(items: HTMLElement[]) {
        this._catalog.replaceChildren(...items);
    }

    set locked(value: boolean) {
        this.toggleClass(this._wrapper, 'page__wrapper_locked', value);
    }
}