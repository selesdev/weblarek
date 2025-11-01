import { Form } from './Form';
import { EventEmitter } from '../../base/Events';
import { cloneTemplate, ensureElement } from '../../../utils/utils';
import { selectors } from '../../../utils/constants';

export class ContactsForm extends Form {
  private readonly emailInput: HTMLInputElement;
  private readonly phoneInput: HTMLInputElement;


  constructor(events: EventEmitter) {
    const template = ensureElement<HTMLTemplateElement>(selectors.contacts);
    super(cloneTemplate<HTMLFormElement>(template), events);

    this.emailInput = this.container.querySelector('input[name="email"]') as HTMLInputElement;
    this.phoneInput = this.container.querySelector('input[name="phone"]') as HTMLInputElement;

    this.emailInput.addEventListener('input', () => {
      this.events.emit('contacts:change', { field: 'email', value: this.emailInput.value });
      this.updateSubmitState();
    });

    this.phoneInput.addEventListener('input', () => {
      this.events.emit('contacts:change', { field: 'phone', value: this.phoneInput.value });
      this.updateSubmitState();
    });

    this.updateSubmitState();
  }

  protected onSubmit(): void {
    this.events.emit('contacts:submit');
  }

  setEmail(email: string) {
    this.emailInput.value = email;
    this.updateSubmitState();
  }

  setPhone(phone: string) {
    this.phoneInput.value = phone;
    this.updateSubmitState();
  }

  getEmail(): string {
    return this.emailInput.value.trim();
  }

  getPhone(): string {
    return this.phoneInput.value.trim();
  }

  private updateSubmitState() {
    const isValid = this.emailInput.value.trim() !== '' && this.phoneInput.value.trim() !== '';
    this.setSubmitDisabled(!isValid);
  }
}
