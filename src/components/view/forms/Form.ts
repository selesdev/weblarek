import { Component } from '../../base/Component';
import { IEvents } from '../../base/Events';

export abstract class Form<T> extends Component<T> {
  protected readonly events: IEvents;
  protected readonly form: HTMLFormElement;
  private readonly submitButton: HTMLButtonElement;
  private readonly errorField: HTMLElement | null;

protected constructor(container: HTMLFormElement, events: IEvents) {
    super(container);
    this.events = events;
    this.form = container;
    this.submitButton = this.form.querySelector('[type="submit"]') as HTMLButtonElement;
    this.errorField = this.form.querySelector('.form__errors');

    this.form.addEventListener('submit', event => {
      event.preventDefault();
      this.onSubmit();
    });
  }

  protected abstract onSubmit(): void;

	set valid(state: boolean) {
    this.submitButton.disabled = !state;
  }


	set error(message: string) {
    if (this.errorField) {
      this.errorField.textContent = message;
    }
  }
}