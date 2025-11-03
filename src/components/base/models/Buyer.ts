import { EventEmitter } from '../Events';
import { IBuyer } from '../../../types';

export class Buyer {
  private data: Partial<IBuyer> = {};

  constructor(
    private readonly events?: EventEmitter,
    private readonly eventName = 'model:buyer-changed'
  ) {}

  setData(data: Partial<IBuyer>): void {
    this.data = { ...this.data, ...data };
    this.emitChange();
  }

  getData(): Partial<IBuyer> {
    return this.data;
  }

  clear(): void {
    this.data = {};
    this.emitChange();
  }

  validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!this.data.payment) errors.payment = 'Не выбран вид оплаты';
    if (!this.data.email) errors.email = 'Укажите email';
    if (!this.data.phone) errors.phone = 'Укажите телефон';
    if (!this.data.address) errors.address = 'Укажите адрес';
    return errors;
  }

  private emitChange(): void {
    this.events?.emit<{ buyer: Partial<IBuyer> }>(this.eventName, { buyer: this.getData() });
  }
}