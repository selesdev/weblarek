import { Form } from './Form';
import { IEvents } from '../../base/Events';
import { TPayment } from '../../../types';

interface OrderFormState {
  address: string;
  payment: TPayment;
  valid: boolean;
  error: string;
}

export class OrderForm extends Form<OrderFormState> {
  private readonly addressInput: HTMLInputElement;
  private readonly paymentButtons: HTMLButtonElement[];
  private readonly paymentField: HTMLInputElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
    this.addressInput = this.form.querySelector('input[name="address"]') as HTMLInputElement;
    this.paymentButtons = Array.from(this.form.querySelectorAll('.order__buttons button'));
    this.paymentField = this.form.querySelector('input[name="payment"]') as HTMLInputElement;
    this.addressInput.addEventListener('input', () => {
      this.events.emit('order:address-change', { address: this.addressInput.value });
    });

    this.paymentButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.events.emit('order:payment-change', { payment: button.name as TPayment });
      });
    });
  }

  protected onSubmit(): void {
    this.events.emit('order:submit');
  }

  set address(value: string) {
    this.addressInput.value = value;
  }

  set payment(value: TPayment) {
    this.paymentField.value = value;
    this.paymentButtons.forEach(button => {
      this.toggleModifier(button, 'button_alt-active', button.name === value);
    });
  }
}
