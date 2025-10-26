export * from './api';
export * from './events';
export * from './product';
export * from './basket';
export * from './order';
export * from './views';
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>;
export interface ValidationRule<T = unknown> {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validate?: (value: T) => boolean | string;
}
export type ValidationRules<T> = Partial<Record<keyof T, ValidationRule>>;
export interface AppState {
    catalog: {
        products: import('./product').IProduct[];
        loading: boolean;
        error?: string;
    };
    basket: import('./basket').IBasket;
    order: import('./order').IOrder;
    modal: {
        isOpen: boolean;
        content?: HTMLElement;
    };
}