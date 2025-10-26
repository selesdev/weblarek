import { PaymentMethod } from './api';
import { IBasketItem } from './basket';

export interface IOrder {
    payment?: PaymentMethod;
    email?: string;
    phone?: string;
    address?: string;
    items: IBasketItem[];
    total: number;
}
export interface IOrderData {
    payment?: PaymentMethod;
    email?: string;
    phone?: string;
    address?: string;
}
export interface IOrderModel {
    order: IOrderData;
    setPayment(payment: PaymentMethod): void;
    setEmail(email: string): void;
    setPhone(phone: string): void;
    setAddress(address: string): void;
    validateOrder(): boolean;
    validateContacts(): boolean;
    clear(): void;
    getOrderData(items: IBasketItem[], total: number): IOrder;
    getOrderErrors(): string[]
    getContactsErrors(): string[];
    getErrors(): string[];   
}
export interface IOrderForm {
    payment: PaymentMethod | null;
    address: string;
}
export interface IContactsForm {
    email: string;
    phone: string;
}
export interface IOrderResult {
    id: string;
    total: number;
}
export interface ISuccessView {
    render(result: IOrderResult): HTMLElement;
}
export interface OrderChangeEvent {
    order: IOrder;
    isValid: boolean;
    errors: string[];
}

export interface OrderSubmitEvent {
    order: IOrder;
}

export interface OrderSuccessEvent {
    result: IOrderResult;
}
export type OrderErrors = Partial<Record<keyof IOrder, string>>;
export type ContactsErrors = Partial<Record<keyof IContactsForm, string>>;