import { Component } from '../../../components/base/Component';
import { EventEmitter } from '../../../components/base/events';

export class Form<T> extends Component<T> {
	protected _form: HTMLFormElement;
	protected _submitButton: HTMLButtonElement;
	protected _events: EventEmitter;

	constructor(form: HTMLFormElement, events: EventEmitter) {
  super(form); 
  this._events = events;
  this._form = form;
  this._submitButton = form.querySelector('[type="submit"]') as HTMLButtonElement;

  this._handleSubmit = this._handleSubmit.bind(this);
  this._form.addEventListener('submit', this._handleSubmit);
}

	protected _handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		this._events.emit('form:submit', { form: this._form });
	}

	render(): HTMLElement {
		return this.container;
	}
}