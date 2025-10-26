export type ApiListResponse<Type> = {
    total: number;
    items: Type[];
};

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface ApiProduct {
    id: string;
    title: string;
    description: string;
    price: number | null;
    image: string;
    category: ProductCategory;
}

export interface ApiOrderRequest {
    payment: PaymentMethod;
    email: string;
    phone: string;
    address: string;
    total: number;
    items: string[];
}

export interface ApiOrderResponse {
    id: string;
    total: number;
}

export interface ApiError {
    error: string;
    message?: string;
}

export interface IApi {
    baseUrl: string;
    get<T>(uri: string): Promise<T>;
    post<T>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IApiS {
    getProductList(): Promise<ApiProduct[]>;
    getProduct(id: string): Promise<ApiProduct>;
    orderProducts(order: ApiOrderRequest): Promise<ApiOrderResponse>;
}

export type ProductCategory = 'софт-скил' | 'хард-скил' | 'кнопка' | 'дополнительное' | 'другое';
export type PaymentMethod = 'online' | 'cash';