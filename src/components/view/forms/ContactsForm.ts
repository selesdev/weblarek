import { Component } from '../../base/Component';
import { EventEmitter } from '../../base/events';

export class ContactsForm extends Component<HTMLElement> {
  protected _events: EventEmitter;
  protected _form: HTMLFormElement;
  protected _submitButton: HTMLButtonElement;

  constructor(container: HTMLElement, events: EventEmitter) {
    super(container);
    this._events = events;

    this._form = container.querySelector('form') as HTMLFormElement;
    this._submitButton = container.querySelector('[type="submit"]') as HTMLButtonElement;

    this._handleSubmit = this._handleSubmit.bind(this);
    this._form.addEventListener('submit', this._handleSubmit);
  }

  protected _handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    this._events.emit('form:submit', { form: this._form });
  }

  enableSubmit() {
    this._submitButton.disabled = false;
  }

  disableSubmit() {
    this._submitButton.disabled = true;
  }

  render(): HTMLElement {
    return this.container;
  }
}
