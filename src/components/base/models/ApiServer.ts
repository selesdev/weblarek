import { Api } from '../Api';
import { IOrderRequest, IOrderResponse, TProductResponse } from '../../../types';

type OrderPayload = Omit<IOrderRequest, 'items'> & { items: string[] };

export class ApiServer {
  constructor(private readonly api: Api) {}

  getProducts(): Promise<TProductResponse> {
    return this.api.get<TProductResponse>('/product');
  }

  sendOrder(order: IOrderRequest): Promise<IOrderResponse> {
    const payload: OrderPayload = {
      ...order,
      items: order.items.map(item => item.id),
    };

    return this.api.post<IOrderResponse>('/order', payload);
  }
}