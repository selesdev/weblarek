import { Component } from '../../base/Component';
import { EventEmitter } from '../../base/Events';

export abstract class Form extends Component<HTMLFormElement> {
  protected readonly events: EventEmitter;
  protected readonly submitButton: HTMLButtonElement;
  protected readonly errorField: HTMLElement | null;

constructor(container: HTMLFormElement, events: EventEmitter) {
    super(container);
    this.events = events;
    this.submitButton = this.container.querySelector('[type="submit"]') as HTMLButtonElement;
    this.errorField = this.container.querySelector('.form__errors');

    this.container.addEventListener('submit', (event) => {
      event.preventDefault();
      this.onSubmit();
    });
  }

  protected abstract onSubmit(): void;

	protected setSubmitDisabled(state: boolean):void {
    this.submitButton.disabled = state;
  }


	setError(message: string):void {
    if (this.errorField) {
      this.errorField.textContent = message;
    }
  }}