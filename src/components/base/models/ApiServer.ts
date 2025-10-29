import { Api } from "../Api"; 
import { IProduct } from "../../../types"; 
import { IBuyer } from "../../../types"; 
import { TProduct, TOrder } from "../../../types"; 
 
 
export class ApiServer { 
  api:Api; 
 
  constructor(api: Api) { 
    this.api = api; 
} 
  async getProducts(): Promise<IProduct[]> { 
    const response = await this.api.get<TProduct>('/product/'); 
    return response.items; 
  } 
 
  // Отправка заказа на сервер 
  sendOrder(buyerData: IBuyer, items: IProduct[]): void { 
    const orderData: TOrder = { 
      buyer: buyerData, 
      items: items 
    }; 
    this.api.post('/order/', orderData); 
  } 
} 