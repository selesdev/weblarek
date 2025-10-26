import { Form } from './Form';
import { IEvents } from '../base/events';
import { IOrderForm, PaymentMethod } from '../../types';

export class OrderForm extends Form<IOrderForm> {
    protected _payment: HTMLButtonElement[];
    protected _address: HTMLInputElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._payment = Array.from(container.querySelectorAll('.order__buttons .button')) as HTMLButtonElement[];
        this._address = container.querySelector('input[name="address"]') as HTMLInputElement;

        this._payment.forEach((button) => {
            button.addEventListener('click', () => {
                const payment = button.name as PaymentMethod;
                this.setPaymentMethod(payment);
                events.emit('order:payment-change', { payment });
            });
        });
    }

    protected setPaymentMethod(method: PaymentMethod) {
        this._payment.forEach((button) => {
            this.toggleClass(button, 'button_alt-active', button.name === method);
        });
    }

    set payment(value: PaymentMethod) {
        this.setPaymentMethod(value);
    }

    set address(value: string) {
        this._address.value = value;
    }

    get address(): string {
        return this._address.value;
    }
}