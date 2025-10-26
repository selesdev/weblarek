import { IProduct } from './product';

export interface IBasketItem {
    product: IProduct;
    quantity: number;
}

export interface IBasket {
    items: IBasketItem[];
    total: number;
    count: number;
}

export interface IBasketModel {
    items: Map<string, IBasketItem>;
    add(product: IProduct): void;
    remove(productId: string): void;
    clear(): void;
    getTotal(): number;
    getCount(): number;
    getItems(): IBasketItem[];
    contains(productId: string): boolean;
}

export interface IBasketView {
    render(basket: IBasket): HTMLElement;
    updateCounter(count: number): void;
}

export interface IBasketItemView {
    render(item: IBasketItem, index: number): HTMLElement;
}

export interface BasketAddEvent {
    product: IProduct;
}

export interface BasketRemoveEvent {
    productId: string;
}

export interface BasketChangeEvent {
    items: IBasketItem[];
    total: number;
    count: number;
}