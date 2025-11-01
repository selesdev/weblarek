import { Api } from '../Api';
import { IOrderRequest, IOrderResponse, TProductResponse } from '../../../types';

type OrderPayload = Omit<IOrderRequest, 'items'> & {
  items: string[];
};

export class ApiServer {
  constructor(private readonly api: Api) {}

  async getProducts(): Promise<TProductResponse> {
    return this.api.get<TProductResponse>('/product');
  }

  async sendOrder(order: IOrderRequest): Promise<IOrderResponse> {
     const payload: OrderPayload = {
      ...order,
      items: order.items.map(item => item.id),
    };

    return this.api.post<IOrderResponse>('/order', payload);
  }
}