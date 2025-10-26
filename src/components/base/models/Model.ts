import { EventEmitter } from '../Events';

export abstract class Model<T> {
  protected data: Partial<T> = {};
  protected events: EventEmitter;

  constructor(events: EventEmitter) {
    this.events = events;
  }

  protected emit(event: string, payload?: object): void {
    this.events.emit(event, payload);
  }
}