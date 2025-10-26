import { Model } from '../base/Models';
import { IEvents } from '../base/events';
import { 
    IOrder, 
    IOrderModel, 
    IOrderData,
    IBasketItem, 
    PaymentMethod 
} from '../../types';

export class OrderModel extends Model<IOrderData> implements IOrderModel {
    order: IOrderData = {};

    constructor(events: IEvents) {
        super({}, events);
    }

    setPayment(payment: PaymentMethod): void {
        this.order.payment = payment;
        this.emitChanges('order:changed', this.order);
    }

    setEmail(email: string): void {
        this.order.email = email;
        this.emitChanges('order:changed', this.order);
    }

    setPhone(phone: string): void {
        this.order.phone = phone;
        this.emitChanges('order:changed', this.order);
    }

    setAddress(address: string): void {
        this.order.address = address;
        this.emitChanges('order:changed', this.order);
    }

    validateOrder(): boolean {
        return !!(this.order.payment && this.order.address?.trim());
    }

    validateContacts(): boolean {
        return !!(this.order.email?.trim() && this.order.phone?.trim());
    }

    clear(): void {
        this.order = {};
        this.emitChanges('order:changed', this.order);
    }

    getOrderData(items: IBasketItem[], total: number): IOrder {
        return { 
            ...this.order,
            items,
            total
        };
    }

    getOrderErrors(): string[] {
        const errors: string[] = [];
        
        if (!this.order.payment) {
            errors.push('Необходимо выбрать способ оплаты');
        }
        
        if (!this.order.address?.trim()) {
            errors.push('Необходимо указать адрес доставки');
        }
        
        return errors;
    }

    getContactsErrors(): string[] {
        const errors: string[] = [];
        
        if (!this.order.email?.trim()) {
            errors.push('Необходимо указать email');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.order.email)) {
            errors.push('Некорректный формат email');
        }
        
        if (!this.order.phone?.trim()) {
            errors.push('Необходимо указать телефон');
        }
        
        return errors;
    }

    getErrors(): string[] {
        return [...this.getOrderErrors(), ...this.getContactsErrors()];
    }
}