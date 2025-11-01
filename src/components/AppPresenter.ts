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
import { IProduct, IOrderRequest, IOrderResponse, TPayment } from '../types';
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
      const products = items.map(this.mapProduct.bind(this));
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

    const items = this.model.getBasket().map(product => ({
      id: this.normalizeId(product.id),
      price: product.price ?? 0,
    }));

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
    } catch (error) {
      console.error('Ошибка при оформлении заказа', error);
    }
  }

  private normalizeId(id: unknown): string {
    if (id && typeof id === 'object' && '$oid' in (id as Record<string, unknown>)) {
      return String((id as Record<string, unknown>)['$oid']);
    }
    return String(id);
  }

  private mapProduct(raw: any): IProduct {
    const id = this.normalizeId(raw.id ?? raw._id ?? raw._id?.$oid ?? raw);
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