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
import { IProduct, IBuyer, TPayment } from '../types';
import { CDN_URL } from '../utils/constants';

type PresenterViews = {
  header: Header;
  gallery: Gallery;
  modal: Modal;
  success: Success;
};

export class AppPresenter {
  private readonly basketView: BasketView;
  private orderForm: OrderForm | null = null;
  private contactsForm: ContactsForm | null = null;
  private preview: PreviewCard | null = null;

  constructor(
    private readonly events: EventEmitter,
    private readonly model: CatalogModel,
    private readonly api: ApiServer,
    private readonly views: PresenterViews
  ) {
    this.basketView = new BasketView(this.events);
    this.registerModelEvents();
    this.registerUiEvents();
  }

  async init(): Promise<void> {
    await this.loadProducts();
  }

  private registerModelEvents(): void {
    this.events.on('model:products-changed', ({ products }: { products: IProduct[] }) => {
      this.views.gallery.renderProducts(products);
    });

    this.events.on('model:selected-product-changed', ({ product }: { product: IProduct | null }) => {
      if (!product) {
        return;
      }
      this.openPreview(product);
    });

    this.events.on('model:basket-changed', ({ items, total }: { items: IProduct[]; total: number }) => {
      this.views.header.setCounter(items.length);
      this.basketView.setItems(items);
      this.basketView.setTotal(total);
      if (this.preview) {
        const selected = this.model.getSelectedProduct();
        if (selected) {
          this.preview.setBasketState(this.model.isInBasket(selected.id));
        }
      }
    });

    this.events.on('model:buyer-changed', ({ buyer }: { buyer: Partial<{ payment: TPayment }> }) => {
      if (this.orderForm && buyer.payment) {
        this.orderForm.setPayment(buyer.payment);
      }
    });
  }

  private registerUiEvents(): void {
    this.events.on('card:select', ({ id }: { id: string }) => {
      const product = this.model.getProductById(id) ?? null;
      this.model.setSelectedProduct(product);
    });

    this.events.on('preview:buy', () => {
      const product = this.model.getSelectedProduct();
      if (!product || product.price === null) {
        return;
      }

      this.model.addToBasket(product);
      this.views.modal.close();
    });

    this.events.on('preview:remove', () => {
      const product = this.model.getSelectedProduct();
      if (!product) {
        return;
      }

      this.model.removeFromBasketById(product.id);
      this.views.modal.close();
    });

    this.events.on('header:cart-open', () => {
      this.basketView.setItems(this.model.getBasket());
      this.basketView.setTotal(this.model.getBasketTotal());
      this.views.modal.open(this.basketView.render());
    });

    this.events.on('basket:item-remove', ({ id }: { id: string }) => {
      this.model.removeFromBasketById(id);
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
      this.commitOrderStep();
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
      this.orderForm = null;
      this.contactsForm = null;
      this.preview = null;
    });
  }

  private async loadProducts(): Promise<void> {
    try {
      const response = await this.api.getProducts();
      const products = response
        .map(item => this.mapProduct(item))
        .filter((item): item is IProduct => Boolean(item));
      this.model.setProducts(products);
    } catch (error) {
      console.error('Ошибка при загрузке продуктов', error);
    }
  }

  private openPreview(product: IProduct): void {
    this.preview = new PreviewCard(this.events);
    this.preview.setProduct(product, this.model.isInBasket(product.id));
    this.views.modal.open(this.preview.render());
  }

  private openOrderForm(): void {
    this.orderForm = new OrderForm(this.events);
    const buyer = this.model.getBuyer();

    if (buyer.address) {
      this.orderForm.setAddress(buyer.address);
    }

    if (buyer.payment) {
      this.orderForm.setPayment(buyer.payment);
    } else {
       this.model.setBuyer({ payment: this.orderForm.getPayment() });
    }

    this.views.modal.open(this.orderForm.render());
  }

  private commitOrderStep(): void {
    if (!this.orderForm) {
      return;
    }

    this.model.setBuyer({
      address: this.orderForm.getAddress(),
      payment: this.orderForm.getPayment(),
    });

    this.openContactsForm();
  }

  private openContactsForm(): void {
    this.contactsForm = new ContactsForm(this.events);
    const buyer = this.model.getBuyer();

    if (buyer.email) {
      this.contactsForm.setEmail(buyer.email);
    }
    if (buyer.phone) {
      this.contactsForm.setPhone(buyer.phone);
    }

    this.views.modal.open(this.contactsForm.render());
  }

  private async submitOrder(): Promise<void> {
    if (!this.contactsForm) {
      return;
    }

    const email = this.contactsForm.getEmail();
    const phone = this.contactsForm.getPhone();

    this.model.setBuyer({ email, phone });

    const items = this.model.getBasket();

    if (items.length === 0) {
      this.contactsForm.setError('Корзина пуста. Добавьте товары и повторите попытку.');
      return;
    }
    
    try {
      const buyer = this.model.getBuyer();
      const buyerData: IBuyer = {
        payment: buyer.payment ?? 'card',
        address: buyer.address ?? '',
        email,
        phone,
      };

      const total = items.reduce((sum, product) => sum + (product.price ?? 0), 0);

      await this.api.sendOrder(buyerData, items);
      this.model.clearBasket();
      this.model.clearBuyer();
      this.views.success.setMessage(`Списано ${total} синапсов`);
      this.views.modal.open(this.views.success.render());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось оформить заказ';
      console.error('Ошибка при оформлении заказа', message);
      this.contactsForm.setError(message);
    }
  }

    private mapProduct(raw: unknown): IProduct | null {
      if (!raw || typeof raw !== 'object') {
        return null;
      }

    const source = raw as Record<string, unknown>;
    const id = typeof source.id === 'string' ? source.id.trim() : '';

    if (!id) {
      console.warn('Получен товар без идентификатора', raw);
      return null;
    }

    const image = typeof source.image === 'string' ? source.image.replace(/^\/+/, '') : '';
    return {
      id,
      title: String(source.title ?? ''),
      description: String(source.description ?? ''),
      category: String(source.category ?? ''),
      price: source.price === null || source.price === undefined ? null : Number(source.price),
      image: image ? `${CDN_URL}/${image}` : '',
    };
  }
}