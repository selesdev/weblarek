import { Api } from '../Api';
import { IOrderRequest, IOrderResponse, TProductResponse } from '../../../types';

export class ApiServer {
  constructor(private readonly api: Api) {}

  async getProducts(): Promise<TProductResponse> {
    return this.api.get<TProductResponse>('/product');
  }

  async sendOrder(order: IOrderRequest): Promise<IOrderResponse> {
    return this.api.post<IOrderResponse>('/order', order);
  }
}