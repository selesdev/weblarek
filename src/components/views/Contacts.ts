import { Form } from './Form';
import { IEvents } from '../base/events';
import { IContactsForm } from '../../types';

export class ContactsForm extends Form<IContactsForm> {
    protected _email: HTMLInputElement;
    protected _phone: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._email = container.querySelector('input[name="email"]') as HTMLInputElement;
        this._phone = container.querySelector('input[name="phone"]') as HTMLInputElement;
    }

    set email(value: string) {
        this._email.value = value;
    }

    get email(): string {
        return this._email.value;
    }

    set phone(value: string) {
        this._phone.value = value;
    }

    get phone(): string {
        return this._phone.value;
    }
}