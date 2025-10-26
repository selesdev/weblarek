import { Component } from '../base/Component';
import { IEvents } from '../base/events';

interface IModalData {
    content: HTMLElement | null;
}

export class Modal extends Component<IModalData> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement | null;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._closeButton = container.querySelector('.modal__close') as HTMLButtonElement;
        this._content = container.querySelector('.modal__content') as HTMLElement;

        this._closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.close.bind(this));
        this._content.addEventListener('click', (event) => event.stopPropagation());
    }

    set content(value: HTMLElement | null) {
    if (this._content) {
        if (value) {
            this._content.replaceChildren(value);
        } else {
            this._content.replaceChildren();
        }
    }
}

    open(): void {
        this.container.classList.add('modal_active');
        this.events.emit('modal:open');
    }

    close(): void {
        this.container.classList.remove('modal_active');
        this.content = null;
        this.events.emit('modal:close');
    }

    render(data: IModalData): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
}