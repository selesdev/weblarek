import { Form } from './Form';
import { IEvents } from '../../base/Events';

interface ContactsFormState {
  email: string;
  phone: string;
  valid: boolean;
  error: string;
}

export class ContactsForm extends Form<ContactsFormState> {
  private readonly emailInput: HTMLInputElement;
  private readonly phoneInput: HTMLInputElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);
    this.emailInput = this.form.querySelector('input[name="email"]') as HTMLInputElement;
    this.phoneInput = this.form.querySelector('input[name="phone"]') as HTMLInputElement;

    this.emailInput.addEventListener('input', () => {
      this.events.emit('contacts:change', { field: 'email', value: this.emailInput.value });
    });

    this.phoneInput.addEventListener('input', () => {
      this.events.emit('contacts:change', { field: 'phone', value: this.phoneInput.value });
    });
  }
  protected onSubmit(): void {
    this.events.emit('contacts:submit');
  }

    set email(value: string) {
    this.emailInput.value = value;
    }

  set phone(value: string) {
    this.phoneInput.value = value;
  }
}
