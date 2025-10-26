import { Api, ApiListResponse } from './Api';
import { 
    IApiS, 
    ApiProduct, 
    ApiOrderRequest, 
    ApiOrderResponse 
} from '../../types';

export class ApiServ extends Api implements IApiS{
    readonly cdn: string;

    constructor(cdn: string, baseUrl: string, options?: RequestInit) {
        super(baseUrl, options);
        this.cdn = cdn;
    }

    getProduct(id: string): Promise<ApiProduct> {
        return this.get<ApiProduct>(`/product/${id}`).then((item) => {
            const result: ApiProduct = {
                ...item,
                image: this.cdn + item.image
            };
            return result;
        });
    }

    getProductList(): Promise<ApiProduct[]> {
        return this.get<ApiListResponse<ApiProduct>>('/product').then((data) => {
            const result: ApiProduct[] = data.items.map((item) => ({
                ...item,
                image: this.cdn + item.image
            }));
            return result;
        });
    }

    orderProducts(order: ApiOrderRequest): Promise<ApiOrderResponse> {
        return this.post<ApiOrderResponse>('/order', order).then((data) => {
            const result: ApiOrderResponse = {
                ...data
            };
            return result;
        });
    }
}