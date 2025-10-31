export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE'; 
export type TPayment = 'cash' | 'card'; 
export type TOrderItem = Pick<IProduct, 'id' | 'title' | 'price'>;
 
export interface IApi { 
    get<T extends object>(uri: string): Promise<T>; 
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>; 
} 
 
export interface IProduct { 
  id: string; 
  description: string; 
  image: string; 
  title: string; 
  category: string; 
  price: number | null; 
} 
 
export interface IBuyer { 
  payment: TPayment; 
  email: string; 
  phone: string; 
  address: string; 
} 
 
export type TProduct = { 
    items: IProduct[]; 
} 
 
export type TOrder = { 
     buyer: IBuyer;
  items: TOrderItem[];
} 
 