import { IEvents } from '../base/Events';
import { IBuyer } from '../../types';

export class Buyer {
  private data: Partial<IBuyer> = {};

  constructor(
    private readonly events?: IEvents,
    private readonly eventName = 'model:buyer-changed'
  ) {}

  setData(data: Partial<IBuyer>): void {
    this.data = { ...this.data, ...data };
    this.emitChange();
  }

  getData(): Partial<IBuyer> {
    return { ...this.data };
  }

  clear(): void {
    if (Object.keys(this.data).length === 0) {
      return;
    }

    this.data = {};
    this.emitChange();
  }

  validate(fields?: (keyof IBuyer)[]): Partial<Record<keyof IBuyer, string>> {
    const required = fields ?? (['payment', 'email', 'phone', 'address'] as (keyof IBuyer)[]);
    const errors: Partial<Record<keyof IBuyer, string>> = {};

    required.forEach(field => {
      const value = this.data[field];
      if (!value) {
        switch (field) {
          case 'payment':
            errors.payment = 'Не выбран вид оплаты';
            break;
          case 'email':
            errors.email = 'Укажите email';
            break;
          case 'phone':
            errors.phone = 'Укажите телефон';
            break;
          case 'address':
            errors.address = 'Укажите адрес';
            break;
          default:
            break;
        }
      }
    });

    return errors;
  }

  private emitChange(): void {
    this.events?.emit(this.eventName, { buyer: this.getData() });
  }
}