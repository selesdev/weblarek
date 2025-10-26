export type EventName = string | RegExp;
export type Subscriber = (data?: any) => void;
export type EmitterEvent = {
    eventName: string;
    data: unknown;
};

export interface IEvents {
    on<T extends object>(event: EventName, callback: (data: T) => void): void;
    emit<T extends object>(event: string, data?: T): void;
    trigger<T extends object>(event: string, context?: Partial<T>): (data: T) => void;
    off(eventName: EventName, callback: Subscriber): void;
    onAll(callback: (event: EmitterEvent) => void): void;
    offAll(): void;
}

export enum AppEvent {
    ProductSelected = 'product:selected',
    ProductAddedToBasket = 'product:added-to-basket',
    ProductRemovedFromBasket = 'product:removed-from-basket',
    
    BasketOpened = 'basket:opened',
    BasketChanged = 'basket:changed',
    BasketCleared = 'basket:cleared',
    
    OrderFormOpened = 'order:form-opened',
    OrderFormValidated = 'order:form-validated',
    OrderSubmitted = 'order:submitted',
    OrderCompleted = 'order:completed',
    ModalOpened = 'modal:opened',
    ModalClosed = 'modal:closed',
    FormValidated = 'form:validated',
    FormSubmitted = 'form:submitted',
    FormErrorsChanged = 'form:errors-changed'
}

export interface ProductSelectedPayload {
    productId: string;
}

export interface ProductBasketPayload {
    productId: string;
    product?: import('./product').IProduct;
}

export interface BasketChangedPayload {
    items: import('./basket').IBasketItem[];
    total: number;
}

export interface OrderPayload {
    order: import('./order').IOrder;
}

export interface FormValidationPayload {
    isValid: boolean;
    errors: Record<string, string>;
}

export interface ModalPayload {
    content?: HTMLElement;
}