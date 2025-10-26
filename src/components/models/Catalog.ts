import { Model } from '../base/Models';
import { IEvents } from '../base/events';
import { 
    IProduct, 
    ICatalogModel, 
    ApiProduct 
} from '../../types';

export class CatalogModel extends Model<IProduct[]> implements ICatalogModel {
    products: IProduct[] = [];

    constructor(events: IEvents) {
        super([], events);
    }

    setProducts(products: ApiProduct[]): void {
        this.products = products.map(product => ({
            id: product.id,
            title: product.title,
            description: product.description,
            price: product.price,
            image: product.image,
            category: product.category
        }));
        this.emitChanges('catalog:changed', { products: this.products });
    }

    getProducts(): Promise<IProduct[]> {
        return Promise.resolve(this.products);
    }

    getProduct(id: string): IProduct | undefined {
        return this.products.find(product => product.id === id);
    }

    getTotal(): number {
        return this.products.length;
    }
}