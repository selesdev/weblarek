import { Component } from '../../base/Component';
import { EventEmitter } from '../../base/Events';

export class OrderCard extends Component<HTMLElement> {
  protected _events: EventEmitter;
  protected _form: HTMLFormElement;
  protected _submitButton: HTMLButtonElement;
  protected _addressInput: HTMLInputElement;
  protected _paymentButtons: NodeListOf<HTMLButtonElement>;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this._events = events;

    this._form = container.querySelector('form') as HTMLFormElement;
    this._submitButton = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    this._addressInput = container.querySelector('input[name="address"]') as HTMLInputElement;
    this._paymentButtons = container.querySelectorAll('button[name]') as NodeListOf<HTMLButtonElement>;

    this._form.addEventListener('submit', this._handleSubmit.bind(this));
    this._paymentButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        this._paymentButtons.forEach((b) => b.classList.remove('button_active'));
        btn.classList.add('button_active');
        this._checkFormValidity();
      });
    });

    this._addressInput.addEventListener('input', () => this._checkFormValidity());
  }

  protected _handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    const selectedPayment = Array.from(this._paymentButtons).find((btn) =>
      btn.classList.contains('button_active')
    )?.name;

    this._events.emit('order:submit', {
      address: this._addressInput.value,
      payment: selectedPayment,
    });
  }

  protected _checkFormValidity() {
    const isValid = this._addressInput.value.trim() !== '' &&
      Array.from(this._paymentButtons).some((btn) => btn.classList.contains('button_active'));
    this._submitButton.disabled = !isValid;
  }

  render(): HTMLElement {
    return this.container;
  }
}
