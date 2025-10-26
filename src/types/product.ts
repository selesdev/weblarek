import { ApiProduct, ProductCategory } from './api';
export interface IProduct {
    id: string;
    title: string;
    description: string;
    price: number | null;
    image: string;
    category: ProductCategory;
}
export interface IProductView {
    id: string;
    title: string;
    description?: string;
    price: string;
    image: string;
    category: string;
    button?: {
        text: string;
        disabled: boolean;
    };
}
export interface ICatalog {
    items: IProduct[];
    total: number;
    loading: boolean;
}
export interface ICatalogModel {
    products: IProduct[];
    getProducts(): Promise<IProduct[]>;
    getProduct(id: string): IProduct | undefined;
    setProducts(products: ApiProduct[]): void;
}
export interface ICatalogView {
    render(catalog: ICatalog): HTMLElement;
}
export interface ICardView {
    render(product: IProductView): HTMLElement;
    setDisabled(disabled: boolean): void;
}
export type CardType = 'gallery' | 'preview' | 'basket';
export interface IBasketProductData extends IProductView {
    index: number;
}