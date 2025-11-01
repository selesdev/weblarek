import { EventEmitter } from './base/Events';
import { CatalogModel } from './CatalogModel';
import { ApiServer } from './base/models/ApiServer';
import { Header } from './view/Header';
import { Gallery } from './view/Gallery';
import { Modal } from './view/Modal';
import { Success } from './view/Success';
import { BasketView } from './view/BasketView';
import { OrderForm } from './view/forms/OrderForm';
import { ContactsForm } from './view/forms/ContactsForm';
import { PreviewCard } from './view/cards/PreviewCard';
import { IProduct, IOrderRequest, IOrderResponse, TPayment, IBuyer, IOrderItemRequest } from '../types';
import { CDN_URL } from '../utils/constants';

interface PresenterViews {
  header: Header;
  gallery: Gallery;
  modal: Modal;
  success: Success;
}

export class AppPresenter {
  private readonly basketView: BasketView;
  private currentOrderForm: OrderForm | null = null;
  private currentContactsForm: ContactsForm | null = null;
  private currentPreview: PreviewCard | null = null;

  constructor(
    private readonly events: EventEmitter,
    private readonly model: CatalogModel,
    private readonly api: ApiServer,
    private readonly views: PresenterViews
  ) {
    this.basketView = new BasketView(this.events);
    this.registerEvents();
  }

  async init() {
    await this.loadProducts();
  }

  private registerEvents() {
    this.events.on<{ id: string }>('card:select', ({ id }) => {
      const product = this.model.getProductById(id);
      this.model.setSelectedProduct(product ?? null);
    });

    this.events.on('model:products-changed', ({ products }: { products: IProduct[] }) => {
      this.views.gallery.renderProducts(products);
    });

    this.events.on('model:buyer-changed', ({ buyer }: { buyer: Partial<IBuyer> }) => {
      if (this.currentOrderForm && buyer.payment && this.currentOrderForm.getPayment() !== buyer.payment) {
        this.currentOrderForm.setPayment(buyer.payment);
      }
    });

    this.events.on('model:selected-product-changed', ({ product }: { product: IProduct | null }) => {
      if (!product) {
        return;
      }
      this.currentPreview = new PreviewCard(this.events);
      this.currentPreview.setProduct(product);
      this.views.modal.open(this.currentPreview.render());
    });

    this.events.on('preview:buy', () => {
      const product = this.model.getSelectedProduct();
      if (product && product.price !== null) {
        this.model.addToBasket(product);
        this.views.modal.close();
      }
    });

    this.events.on('model:basket-changed', ({ items, total }: { items: IProduct[]; total: number }) => {
      this.views.header.setCounter(items.length);
      this.basketView.setItems(items);
      this.basketView.setTotal(total);
    });

    this.events.on('basket:item-remove', ({ id }: { id: string }) => {
      this.model.removeFromBasketById(id);
    });

    this.events.on('header:cart-open', () => {
      this.basketView.setItems(this.model.getBasket());
      this.basketView.setTotal(this.model.getBasketTotal());
      this.views.modal.open(this.basketView.render());
    });

    this.events.on('basket:order', () => {
      this.openOrderForm();
    });

    this.events.on('order:address-change', ({ address }: { address: string }) => {
      this.model.setBuyer({ address });
    });

    this.events.on('order:payment-change', ({ payment }: { payment: TPayment }) => {
      this.model.setBuyer({ payment });
    });

    this.events.on('order:submit', () => {
      if (!this.currentOrderForm) {
        return;
      }
      this.model.setBuyer({
        address: this.currentOrderForm.getAddress(),
        payment: this.currentOrderForm.getPayment(),
      });
      this.openContactsForm();
    });

    this.events.on('contacts:change', ({ field, value }: { field: string; value: string }) => {
      if (field === 'email') {
        this.model.setBuyer({ email: value });
      }
      if (field === 'phone') {
        this.model.setBuyer({ phone: value });
      }
    });

    this.events.on('contacts:submit', () => {
      void this.submitOrder();
    });

    this.events.on('success:close', () => {
      this.views.modal.close();
    });

    this.events.on('modal:close', () => {
      this.currentOrderForm = null;
      this.currentContactsForm = null;
      this.currentPreview = null;
    });
  }

  private async loadProducts() {
    try {
      const response = await this.api.getProducts();
      const items = Array.isArray(response) ? response : response.items;
      const products = items
        .map(this.mapProduct.bind(this))
        .filter((product): product is IProduct => product !== null);
      this.model.setProducts(products);
    } catch (error) {
      console.error('Ошибка при загрузке продуктов', error);
    }
  }

  private openOrderForm() {
    this.currentOrderForm = new OrderForm(this.events);
    const buyer = this.model.getBuyer();

    if (buyer.address) {
      this.currentOrderForm.setAddress(buyer.address);
    }

    if (buyer.payment) {
      this.currentOrderForm.setPayment(buyer.payment);
    } else {
      this.model.setBuyer({ payment: this.currentOrderForm.getPayment() });
    }

    this.views.modal.open(this.currentOrderForm.render());
  }

  private openContactsForm() {
    this.currentContactsForm = new ContactsForm(this.events);
    const buyer = this.model.getBuyer();

    if (buyer.email) {
      this.currentContactsForm.setEmail(buyer.email);
    }
    if (buyer.phone) {
      this.currentContactsForm.setPhone(buyer.phone);
    }

    this.views.modal.open(this.currentContactsForm.render());
  }

  private async submitOrder() {
    if (!this.currentContactsForm) {
      return;
    }

    const buyer = this.model.getBuyer();
    const email = this.currentContactsForm.getEmail();
    const phone = this.currentContactsForm.getPhone();

    this.model.setBuyer({ email, phone });

    const basketItems = this.model.getBasket();
    const invalidIndexes: number[] = [];
    const items: IOrderItemRequest[] = [];

    basketItems.forEach((product, index) => {
      const normalizedId = this.resolveProductId(product);

      if (!normalizedId) {
        console.error('Не удалось определить идентификатор товара', product);
        invalidIndexes.push(index);
        return;
      }

      if (!this.isValidIdString(normalizedId)) {
        console.error('Определён некорректный идентификатор товара', normalizedId, product);
        invalidIndexes.push(index);
        return;
      }

      if (product.id !== normalizedId) {
        product.id = normalizedId;
      }

      items.push({
        id: normalizedId,
        price: product.price ?? 0,
      });
    });

    if (invalidIndexes.length > 0) {
      invalidIndexes
        .sort((a, b) => b - a)
        .forEach(index => this.model.removeFromBasket(index));

      this.currentContactsForm?.setError(
        'Некоторые товары из корзины не удалось идентифицировать и они были удалены. Повторите оформление заказа.'
      );
      return;
    }

    if (items.length === 0) {
      this.currentContactsForm?.setError('Корзина пуста. Добавьте товары, прежде чем оформлять заказ.');
      return;
    }
    const order: IOrderRequest = {
      payment: buyer.payment ?? 'card',
      address: buyer.address ?? '',
      email,
      phone,
      total: items.reduce((sum, item) => sum + item.price, 0),
      items,
    };

    try {
      const result: IOrderResponse = await this.api.sendOrder(order);
      const total = result?.total ?? order.total;
      this.model.clearBasket();
      this.model.clearBuyer();
      this.views.success.setMessage(`Списано ${total} синапсов`);
      this.views.modal.open(this.views.success.render());
    } catch (error) {const message = this.extractErrorMessage(error);
      console.error('Ошибка при оформлении заказа', message);
      this.currentContactsForm?.setError(message);
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (error && typeof error === 'object') {
      const message = (error as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }

      try {
        return JSON.stringify(error);
      } catch {
        // ignore
      }
    }

    const fallback = String(error ?? 'Неизвестная ошибка');
    return fallback === '[object Object]' ? 'Неизвестная ошибка' : fallback;
  }

   private readonly preferredIdKeys = ['$oid', 'id', '_id', 'value', 'uuid', 'key', 'productId', 'itemId', 'product_id'];
  private readonly idKeyPattern = /(?:^|_|-|\.)?(?:id|uuid|guid|key|oid)$/i;
  private readonly invalidIdCharacters = /[\s{}\[\]<>]/;

  private resolveProductId(product: IProduct): string {
    const directId = this.extractId(product.id);
    if (directId) {
      return directId;
    }

    const fallbackId = this.extractId(product as unknown);
    return fallbackId;
  }

  private extractId(value: unknown, seen: Set<unknown> = new Set()): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return this.isValidIdString(trimmed) ? trimmed : '';
    }

    const resolved = this.resolveIdentifier(value, seen);
    if (!this.isPrimitiveIdentifier(resolved)) {
      return '';
    }

    const stringified = String(resolved).trim();
    return this.isValidIdString(stringified) ? stringified : '';
  }

  private isPrimitiveIdentifier(value: unknown): value is string | number | boolean | bigint | symbol {
    const type = typeof value;
    return value !== null && (type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint' || type === 'symbol');
  }

  private isValidIdString(value: string): boolean {
    if (!value) {
      return false;
    }

    if (this.invalidIdCharacters.test(value)) {
      return false;
    }

    return !/\[object [^\]]+\]/i.test(value) && !value.toLowerCase().includes('[object');
  }

  private resolveIdentifier(value: unknown, seen: Set<unknown>): unknown {
    if (value === null || value === undefined) {
      return null;
    }

    const type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean' || type === 'bigint' || type === 'symbol') {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value) || value instanceof Set) {
      for (const item of value as Iterable<unknown>) {
        const resolved = this.resolveIdentifier(item, seen);
        if (resolved !== null && resolved !== undefined) {
          return resolved;
        }
      }
      return null;
    }

    if (value instanceof Map) {
      for (const [key, mapValue] of value.entries()) {
        if (typeof key === 'string' && this.idKeyPattern.test(key)) {
          const resolved = this.resolveIdentifier(mapValue, seen);
          if (resolved !== null && resolved !== undefined) {
            return resolved;
          }
        }
      }

      for (const [, mapValue] of value.entries()) {
        if (mapValue && typeof mapValue === 'object') {
          const resolved = this.resolveIdentifier(mapValue, seen);
          if (resolved !== null && resolved !== undefined) {
            return resolved;
          }
        }
      }

      return null;
    }

    if (ArrayBuffer.isView(value)) {
      return this.resolveIdentifier(Array.from(value as unknown as ArrayLike<unknown>), seen);
    }

    if (typeof value === 'object') {
      if (seen.has(value)) {
        return null;
      }
      seen.add(value);

      try {
        const record = value as Record<string, unknown>;
        const toPrimitive = (record as { [Symbol.toPrimitive]?: (hint: string) => unknown })[Symbol.toPrimitive];
        if (typeof toPrimitive === 'function') {
          const primitive = toPrimitive.call(record, 'string');
          const resolved = this.resolveIdentifier(primitive, seen);
          if (resolved !== null && resolved !== undefined) {
            return resolved;
          }
        }

        if (typeof (record as { toHexString?: () => unknown }).toHexString === 'function') {
          const hex = (record as { toHexString: () => unknown }).toHexString();
          const resolved = this.resolveIdentifier(hex, seen);
          if (resolved !== null && resolved !== undefined) {
            return resolved;
          }
        }

        const valueOf = typeof record.valueOf === 'function' ? record.valueOf() : undefined;
        if (valueOf !== undefined && valueOf !== record) {
          const resolved = this.resolveIdentifier(valueOf, seen);
          if (resolved !== null && resolved !== undefined) {
            return resolved;
          }
        }

        const entries = Object.entries(record);
        for (const preferred of this.preferredIdKeys) {
          const entry = entries.find(([key]) => key.toLowerCase() === preferred.toLowerCase());
          if (entry) {
            const resolved = this.resolveIdentifier(entry[1], seen);
            if (resolved !== null && resolved !== undefined) {
              return resolved;
            }
          }
        }

        for (const [key, item] of entries) {
          if (typeof item === 'function') {
            continue;
          }

          if (this.idKeyPattern.test(key)) {
            const resolved = this.resolveIdentifier(item, seen);
            if (resolved !== null && resolved !== undefined) {
              return resolved;
            }
          }
        }

        for (const [, item] of entries) {
          if (item && typeof item === 'object') {
            const resolved = this.resolveIdentifier(item, seen);
            if (resolved !== null && resolved !== undefined) {
              return resolved;
            }
          }
        }
      } finally {
        seen.delete(value);
      }
    }

    return null;
  }

  private mapProduct(raw: any): IProduct | null {
    const candidateSources: unknown[] = [raw?._id?.$oid, raw?.id, raw?._id, raw?.productId, raw?.itemId, raw];

    let id = '';
    for (const candidate of candidateSources) {
      id = this.extractId(candidate);
      if (id) {
        break;
      }
    }

    if (!id) {
      console.warn('Получен товар без корректного идентификатора', raw);
      return null;
    }

    const imagePath = typeof raw.image === 'string' ? raw.image.replace(/^\/+/, '') : '';
    return {
      id,
      title: String(raw.title ?? ''),
      description: String(raw.description ?? ''),
      category: String(raw.category ?? ''),
      price: raw.price !== undefined && raw.price !== null ? Number(raw.price) : null,
      image: imagePath ? `${CDN_URL}/${imagePath}` : '',
    };
  }
}