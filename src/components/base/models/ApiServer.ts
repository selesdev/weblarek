import { Api } from '../Api';
import { IProductListResponse, IOrderRequest, IOrderResponse } from '../../../types';

 
export class ApiServer {
  constructor(private readonly api: Api) {}

  async getProducts(): Promise<IProductListResponse> {
    return this.api.get<IProductListResponse>('/product/');
  }
 
  // Отправка заказа на сервер
  async sendOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order/', order);
  }
}