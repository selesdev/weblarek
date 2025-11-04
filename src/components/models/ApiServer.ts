import { Api } from '../base/Api';
import { IProductListResponse, IOrderRequest, IOrderResponse } from '../../types';

 
export class ApiServer {
  constructor(private readonly api: Api) {}

  getProducts(): Promise<IProductListResponse> {
    return this.api.get<IProductListResponse>('/product/');
  }
 
  // Отправка заказа на сервер
  sendOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order/', order);
  }
}