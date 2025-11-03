import './scss/styles.scss';
import { EventEmitter } from './components/base/Events';
import { Api } from './components/base/Api';
import { ApiServer } from './components/base/models/ApiServer';
import { CatalogModel } from './components/CatalogModel';
import { Header } from './components/view/Header';
import { Gallery } from './components/view/Gallery';
import { Modal } from './components/view/Modal';
import { Success } from './components/view/Success';
import { BasketView } from './components/view/BasketView';
import { OrderForm } from './components/view/forms/OrderForm';
import { ContactsForm } from './components/view/forms/ContactsForm';
import { PreviewCard } from './components/view/cards/PreviewCard';
import { API_URL, CDN_URL } from './utils/constants';
import { ensureElement } from './utils/utils';
import { IBuyer, IProduct, IBasketChangePayload, IOrderRequest } from './types';

const events = new EventEmitter();
const api = new Api(API_URL);
const apiServer = new ApiServer(api);
const model = new CatalogModel(events);

const header = new Header(ensureElement<HTMLElement>('.header'), events);
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'), events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const success = new Success(events);
const basketView = new BasketView(events);
let orderForm: OrderForm | null = null;
let contactsForm: ContactsForm | null = null;
let preview: PreviewCard | null = null;

function registerModelEvents(): void {
  events.on('model:products-changed', ({ products }: { products: IProduct[] }) => {
    gallery.renderProducts(products);
  });

  events.on('model:selected-product-changed', ({ product }: { product: IProduct | null }) => {
    if (!product) {
      return;
    }
    openPreview(product);
  });

  events.on('model:basket-changed', ({ items, total }: IBasketChangePayload) => {
    header.setCounter(items.length);
    basketView.setItems(items);
    basketView.setTotal(total);

    if (preview) {
      const selected = model.getSelectedProduct();
      if (selected) {
        preview.setBasketState(model.isInBasket(selected.id));
      }
    }
  });

  events.on('model:buyer-changed', ({ buyer }: { buyer: Partial<IBuyer> }) => {
    if (orderForm && buyer.payment) {
      orderForm.setPayment(buyer.payment as IBuyer['payment']);
    }
  });
}

function registerUiEvents(): void {
  events.on('card:select', ({ id }: { id: string }) => {
    const product = model.getProductById(id);
    if (!product) {
      console.warn(`Товар с идентификатором ${id} не найден`);
      return;
    }
    model.setSelectedProduct(product);
  });

  events.on('preview:buy', () => {
    const product = model.getSelectedProduct();
    if (!product || product.price === null) {
      return;
    }

    model.addToBasket(product);
    modal.close();
  });

  events.on('preview:remove', () => {
    const product = model.getSelectedProduct();
    if (!product) {
      return;
    }

    model.removeFromBasketById(product.id);
    modal.close();
  });

  events.on('header:cart-open', () => {
    basketView.setItems(model.getBasket());
    basketView.setTotal(model.getBasketTotal());
    modal.open(basketView.render());
  });

  events.on('basket:item-remove', ({ id }: { id: string }) => {
    model.removeFromBasketById(id);
  });

  events.on('basket:order', () => {
    openOrderForm();
  });

  events.on('order:address-change', ({ address }: { address: string }) => {
    model.setBuyer({ address });
  });

  events.on('order:payment-change', ({ payment }: { payment: IBuyer['payment'] }) => {
    model.setBuyer({ payment });
  });

  events.on('order:submit', () => {
    commitOrderStep();
  });

  events.on('contacts:change', ({ field, value }: { field: string; value: string }) => {
    if (field === 'email') {
      model.setBuyer({ email: value });
    }
    if (field === 'phone') {
      model.setBuyer({ phone: value });
    }
  });

  events.on('contacts:submit', () => {
    void submitOrder();
  });

  events.on('success:close', () => {
    modal.close();
  });

  events.on('modal:close', () => {
    orderForm = null;
    contactsForm = null;
    preview = null;
    model.setSelectedProduct(null);
  });
}

async function loadProducts(): Promise<void> {
  try {
    const response = await apiServer.getProducts();
    const products = response.items
      .map(item => mapProduct(item))
      .filter((item): item is IProduct => Boolean(item));
    model.setProducts(products);
  } catch (error) {
    console.error('Ошибка при загрузке продуктов', error);
  }
}

function openPreview(product: IProduct): void {
  preview = new PreviewCard(events);
  preview.setProduct(product, model.isInBasket(product.id));
  modal.open(preview.render());
}

function openOrderForm(): void {
  orderForm = new OrderForm(events);
  const buyer = model.getBuyer();

  if (buyer.address) {
    orderForm.setAddress(buyer.address);
  }

  if (buyer.payment) {
    orderForm.setPayment(buyer.payment);
  } else {
    model.setBuyer({ payment: orderForm.getPayment() });
  }

  modal.open(orderForm.render());
}

function commitOrderStep(): void {
  if (!orderForm) {
    return;
  }

  model.setBuyer({
    address: orderForm.getAddress(),
    payment: orderForm.getPayment(),
  });

  openContactsForm();
}

function openContactsForm(): void {
  contactsForm = new ContactsForm(events);
  const buyer = model.getBuyer();

  if (buyer.email) {
    contactsForm.setEmail(buyer.email);
  }
  if (buyer.phone) {
    contactsForm.setPhone(buyer.phone);
  }

  modal.open(contactsForm.render());
}

async function submitOrder(): Promise<void> {
  if (!contactsForm) {
    return;
  }

  const email = contactsForm.getEmail();
  const phone = contactsForm.getPhone();

  model.setBuyer({ email, phone });

  const items = model.getBasket();
  const total = model.getBasketTotal();

  if (items.length === 0) {
    contactsForm.setError('Корзина пуста. Добавьте товары и повторите попытку.');
    return;
  }

  try {
    const buyer = model.getBuyer();
    const order: IOrderRequest = {
      payment: buyer.payment ?? 'card',
      address: buyer.address ?? '',
      email,
      phone,
      total,
      items: items.map(item => item.id),
    };

    const response = await apiServer.sendOrder(order);
    const charged = response.total ?? total;
    model.clearBasket();
    model.clearBuyer();
    success.setMessage(`Списано ${charged} синапсов`);
    modal.open(success.render());
  } catch (error) {
    const message =
      error instanceof Error ? error.message : typeof error === 'string' ? error : 'Не удалось оформить заказ';
    console.error('Ошибка при оформлении заказа', message);
    contactsForm.setError(message);
  }
}

function mapProduct(raw: unknown): IProduct | null {
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

registerModelEvents();
registerUiEvents();
void loadProducts();