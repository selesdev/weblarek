import './scss/styles.scss';
import { EventEmitter } from './components/base/Events';
import { Api } from './components/base/Api';
import { ApiServer } from './components/models/ApiServer';
import { Folder } from './components/models/Folder';
import { Cart } from './components/models/Cart';
import { Buyer } from './components/models/Buyer';
import { Header } from './components/view/Header';
import { Gallery } from './components/view/Gallery';
import { Modal } from './components/view/Modal';
import { Success } from './components/view/Success';
import { BasketView } from './components/view/BasketView';
import { OrderForm } from './components/view/forms/OrderForm';
import { ContactsForm } from './components/view/forms/ContactsForm';
import { PreviewCard } from './components/view/cards/PreviewCard';
import { CatalogCard } from './components/view/cards/CatalogCard';
import { BasketCard } from './components/view/cards/BasketCard';
import { API_URL, CDN_URL, selectors } from './utils/constants';
import { ensureElement, cloneTemplate } from './utils/utils';
import { IBuyer, IProduct, IOrderRequest,  TPayment } from './types';

const events = new EventEmitter();
const api = new Api(API_URL);
const apiServer = new ApiServer(api);
const catalog = new Folder(events);
const basket = new Cart(events);
const buyer = new Buyer(events);

const header = new Header(ensureElement<HTMLElement>('.header'), events);
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const successTemplate = ensureElement<HTMLTemplateElement>(selectors.success);
const basketTemplate = ensureElement<HTMLTemplateElement>(selectors.basket);
const orderTemplate = ensureElement<HTMLTemplateElement>(selectors.order);
const contactsTemplate = ensureElement<HTMLTemplateElement>(selectors.contacts);
const previewTemplate = ensureElement<HTMLTemplateElement>(selectors.cardPreview);
const catalogCardTemplate = ensureElement<HTMLTemplateElement>(selectors.cardCatalog);
const basketCardTemplate = ensureElement<HTMLTemplateElement>(selectors.cardBasket);
const success = new Success(cloneTemplate<HTMLElement>(successTemplate), events);
const DEFAULT_PAYMENT: TPayment = 'card';
const basketView = new BasketView(cloneTemplate<HTMLElement>(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate<HTMLFormElement>(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate<HTMLFormElement>(contactsTemplate), events);
const previewCard = new PreviewCard(cloneTemplate<HTMLElement>(previewTemplate), events);
const createCatalogCard = () => new CatalogCard(cloneTemplate<HTMLElement>(catalogCardTemplate), events);
const createBasketCard = () => new BasketCard(cloneTemplate<HTMLElement>(basketCardTemplate), events);

registerModelEvents();
registerViewEvents();

syncBuyerState(buyer.getData());
renderBasket(basket.getItems(), basket.getTotalPrice());
header.render({ counter: basket.getCount() });

void loadProducts();

function registerModelEvents(): void {
  events.on<{ products: IProduct[] }>('model:products-changed', ({ products }) => {
    renderCatalog(products);
  });

events.on<{ product: IProduct | null }>('model:selected-product-changed', ({ product }) => {
    if (product) {
      openPreview(product);
    }
  });

  events.on<{ items: IProduct[]; total: number }>('model:basket-changed', ({ items, total }) => {
    renderBasket(items, total);
  });

    events.on<{ buyer: Partial<IBuyer> }>('model:buyer-changed', ({ buyer: buyerData }) => {
    syncBuyerState(buyerData);
  });
}

  function registerViewEvents(): void {
  events.on<{ id: string }>('card:select', ({ id }) => {
    const product = catalog.getItemById(id);
    if (!product) {
      console.warn(`Товар с идентификатором ${id} не найден`);
      return;
    }

    catalog.setSelectedItem(product);
  });

  events.on('header:cart-open', () => {
    openBasket();
  });

  events.on<{ id: string }>('basket:item-remove', ({ id }) => {
    basket.removeItemById(id);
  });

  events.on('basket:order', () => {
    openOrderForm();
  });

  events.on('order:submit', () => {
    handleOrderSubmit();
  });

  events.on<{ address: string }>('order:address-change', ({ address }) => {
    buyer.setData({ address });
  });

  events.on<{ payment: IBuyer['payment'] }>('order:payment-change', ({ payment }) => {
    buyer.setData({ payment });
  });

  events.on<{ field: keyof Pick<IBuyer, 'email' | 'phone'>; value: string }>('contacts:change', ({ field, value }) => {
    buyer.setData({ [field]: value } as Partial<IBuyer>);
  });

  events.on('contacts:submit', () => {
    void handleContactsSubmit();
  });

  events.on('preview:buy', () => {
    const selected = catalog.getSelectedItem();
    if (!selected) {
      return;
    }
    basket.addItem(selected);
    closeModal();
  });

  events.on('preview:remove', () => {
    const selected = catalog.getSelectedItem();
    if (!selected) {
      return;
    }
    basket.removeItem(selected);
    closeModal();
  });

  events.on('success:close', () => {
    closeModal();
  });

  events.on('modal:close', () => {
    closeModal();
  });
}

async function loadProducts(): Promise<void> {
  try {
    const response = await apiServer.getProducts();
    const products = response.items
      .map(item => mapProduct(item))
      .filter((item): item is IProduct => Boolean(item));
    catalog.setItems(products);
  } catch (error) {
    console.error('Ошибка при загрузке продуктов', error);
  }
}

function renderCatalog(products: IProduct[]): void {
  const cards = products.map(product =>
    createCatalogCard().render({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
    })
  );

  gallery.render({ items: cards });
}

function renderBasket(items: IProduct[], total: number): void {
  const cardElements = items.map((item, index) =>
    createBasketCard().render({
      id: item.id,
      title: item.title,
      price: item.price,
      index: index + 1,
    })
  );

  const hasPricedItems = items.some(item => item.price !== null);
  const totalText = items.length === 0 ? '0 синапсов' : hasPricedItems ? `${total} синапсов` : 'Бесценно';

  basketView.render({ items: cardElements, total: totalText });
  header.render({ counter: basket.getCount() });
  updatePreviewState();
}

  function openPreview(product: IProduct): void {
  const element = previewCard.render({
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    image: product.image,
    category: product.category,
    inBasket: basket.hasItem(product.id),
  });
  modal.open(element);
}

  function openBasket(): void {
  modal.open(basketView.element);
}

  function openOrderForm(): void {
  const buyerData = buyer.getData();
  const { valid, error } = getOrderValidationState();
  const element = orderForm.render({
    address: buyerData.address ?? '',
    payment: buyerData.payment ?? DEFAULT_PAYMENT,
    valid,
    error,
  });
  modal.open(element);
}

function handleOrderSubmit(): void {
  const { valid, error } = getOrderValidationState();
  if (!valid) {
    orderForm.render({ error, valid });
    return;
  }

  openContactsForm();
}

function openContactsForm(): void {
  const buyerData = buyer.getData();
  const { valid, error } = getContactsValidationState();
  const element = contactsForm.render({
    email: buyerData.email ?? '',
    phone: buyerData.phone ?? '',
    valid,
    error,
  });
  modal.open(element);
}

  async function handleContactsSubmit(): Promise<void> {
  const { valid, error } = getContactsValidationState();
  if (!valid) {
    contactsForm.render({ error, valid });
    return;
  }

  await submitOrder();
}

async function submitOrder(): Promise<void> {
  const items = basket.getItems();
  if (items.length === 0) {
    contactsForm.render({
      error: 'Корзина пуста. Добавьте товары и повторите попытку.',
      valid: false,
    });
    return;
  }

  const buyerData = buyer.getData();
  const order: IOrderRequest = {
    payment: buyerData.payment ?? DEFAULT_PAYMENT,
    address: buyerData.address ?? '',
    email: buyerData.email ?? '',
    phone: buyerData.phone ?? '',
    total: basket.getTotalPrice(),
    items: items.map(item => item.id),
  };

  try {
    const response = await apiServer.sendOrder(order);
    const charged = response.total ?? order.total;
    basket.clear();
    buyer.clear();
    catalog.clearSelectedItem();
    const element = success.render({ message: `Списано ${charged} синапсов` });
    modal.open(element);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Не удалось оформить заказ';
    contactsForm.render({ error: message, valid: false });
  }
}

  function updatePreviewState(): void {
  const selected = catalog.getSelectedItem();
  if (!selected) {
    return;
  }

  previewCard.render({ inBasket: basket.hasItem(selected.id) });
}

  function syncBuyerState(buyerData: Partial<IBuyer>): void {
  if (!buyerData.payment) {
    buyer.setData({ payment: DEFAULT_PAYMENT });
    return;
  }

  const payment = buyerData.payment ?? DEFAULT_PAYMENT;
  const { valid: orderValid, error: orderError } = getOrderValidationState();
  orderForm.render({
    address: buyerData.address ?? '',
    payment,
    valid: orderValid,
    error: orderError,
  });

  const { valid: contactsValid, error: contactsError } = getContactsValidationState();
  contactsForm.render({
    email: buyerData.email ?? '',
    phone: buyerData.phone ?? '',
    valid: contactsValid,
    error: contactsError,
  });
}

function closeModal(): void {
  modal.close();
  catalog.clearSelectedItem();
}

function getOrderValidationState(): { valid: boolean; error: string } {
  const errors = buyer.validate(['address', 'payment']);
  const message = errors.address ?? errors.payment ?? '';
  return { valid: Object.keys(errors).length === 0, error: message };
}

function getContactsValidationState(): { valid: boolean; error: string } {
  const errors = buyer.validate(['email', 'phone']);
  const message = errors.email ?? errors.phone ?? '';
  return { valid: Object.keys(errors).length === 0, error: message };
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