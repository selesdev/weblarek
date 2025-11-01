import { Form } from './Form';
import { EventEmitter } from '../../base/Events';
import { cloneTemplate, ensureElement } from '../../../utils/utils';
import { selectors } from '../../../utils/constants';
import { TPayment } from '../../../types';

export class OrderForm extends Form {
  private readonly addressInput: HTMLInputElement;
  private readonly paymentButtons: HTMLButtonElement[];
  private readonly paymentField: HTMLInputElement;
  private currentPayment: TPayment;

  constructor(events: EventEmitter) {
    const template = ensureElement<HTMLTemplateElement>(selectors.order);
    super(cloneTemplate<HTMLFormElement>(template), events);

    this.addressInput = this.container.querySelector('input[name="address"]') as HTMLInputElement;
    this.paymentButtons = Array.from(this.container.querySelectorAll('.order__buttons button'));
    this.paymentField = this.container.querySelector('input[name="payment"]') as HTMLInputElement;
    this.currentPayment = (this.paymentField.value as TPayment) || 'card';

    this.paymentButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.setPayment(button.name as TPayment);
        this.events.emit('order:payment-change', { payment: this.currentPayment });
      });
    });

    this.addressInput.addEventListener('input', () => {
      this.events.emit('order:address-change', { address: this.addressInput.value });
      this.updateSubmitState();
    });

    this.updatePaymentButtons();
    this.updateSubmitState();
  }

  protected onSubmit(): void {
    this.events.emit('order:submit');
  }

  setAddress(address: string):void {
    this.addressInput.value = address;
    this.updateSubmitState();
  }

  setPayment(payment: TPayment):void {
    this.currentPayment = payment;
    this.paymentField.value = payment;
    this.updatePaymentButtons();
    this.updateSubmitState();
  }

  getPayment(): TPayment {
    return this.currentPayment;
  }

  getAddress(): string {
    return this.addressInput.value.trim();
  }

  private updatePaymentButtons():void {
    this.paymentButtons.forEach(button => {
      const isActive = button.name === this.currentPayment;
      button.classList.toggle('button_active', isActive);
      button.classList.toggle('button_alt-active', isActive);
    });
  }

   private updateSubmitState():void {
    const isValid = this.addressInput.value.trim().length > 0;
    this.setSubmitDisabled(!isValid);
  }
}
