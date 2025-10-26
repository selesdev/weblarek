import { IBuyer } from "../../../types";
import { Model } from "./Model";
import { EventEmitter } from '../Events';

export class Buyer extends Model<IBuyer> {
  constructor(events: EventEmitter) {
    super(events);
  }

  setData(data: Partial<IBuyer>): void {
    this.data = { ...this.data, ...data };
    this.emit('buyer:update', this.data as IBuyer);
  }

  getData(): Partial<IBuyer> {
    return this.data;
  }

  clear(): void {
    this.data = {};
    this.emit('buyer:clear');
  }

  validate(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!this.data.payment) errors.payment = 'Не выбран вид оплаты';
    if (!this.data.email) errors.email = 'Укажите email';
    if (!this.data.phone) errors.phone = 'Укажите телефон';
    if (!this.data.address) errors.address = 'Укажите адрес';

    // можно эмитить результат валидации, если нужно:
    this.emit('buyer:validate', Object.keys(errors).length ? errors : {});
    return errors;
  }
}