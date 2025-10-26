import './scss/styles.scss';
import { EventEmitter } from './components/base/events.ts';
import { ApiServ } from './components/api/APIServer.ts';
import { CatalogModel } from './components/models/Catalog';
import { BasketModel } from './components/models/Basket';
import { OrderModel } from './components/models/Order';
import { Page } from './components/views/Page';
import { Card } from './components/views/Card';
import { Modal } from './components/views/Modal';
import { Basket } from './components/views/Basket';
import { OrderForm } from './components/views/Order.ts';
import { ContactsForm } from './components/views/Contacts.ts';
import { Success } from './components/views/Success_Order.ts';
import { 
    IProduct, 
    IProductView, 
    PaymentMethod, 
    ApiOrderRequest 
} from './types';
import { API_URL, CDN_URL, selectors } from './utils/constants';
import { cloneTemplate, formatPrice } from './utils/utils';
const events = new EventEmitter();
const cardCatalogTemplate = document.querySelector(selectors.cardCatalog) as HTMLTemplateElement;
const cardPreviewTemplate = document.querySelector(selectors.cardPreview) as HTMLTemplateElement;
const cardBasketTemplate = document.querySelector(selectors.cardBasket) as HTMLTemplateElement;
const basketTemplate = document.querySelector(selectors.basket) as HTMLTemplateElement;
const orderTemplate = document.querySelector(selectors.order) as HTMLTemplateElement;
const contactsTemplate = document.querySelector(selectors.contacts) as HTMLTemplateElement;
const successTemplate = document.querySelector(selectors.success) as HTMLTemplateElement;
const api = new ApiServ(CDN_URL, API_URL);
const catalogModel = new CatalogModel(events);
const basketModel = new BasketModel(events);
const orderModel = new OrderModel(events);
const page = new Page(document.body, events);
const modal = new Modal(document.querySelector('#modal-container') as HTMLElement, events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);
const contacts = new ContactsForm(cloneTemplate(contactsTemplate), events);
let isBasketOpen = false;
function renderBasket() {
    const basketItems = basketModel.getItems().map((item, index) => {
        const card = new Card('card', cloneTemplate(cardBasketTemplate), {
            onClick: () => {
                basketModel.remove(item.product.id);
            }
        });

        const cardData: Partial<IProductView> = {
            id: item.product.id,
            title: item.product.title,
            price: formatPrice(item.product.price)
        };
        card.index = index + 1;
        card.render(cardData);

        return card.container;
    });

    basket.render({
        items: basketItems,
        total: basketModel.getTotal(),
        selected: basketModel.getCount() > 0
    });
}
function createCard(product: IProduct, actions?: { onClick: (event: MouseEvent) => void }): Card {
    const cardElement = cloneTemplate(cardCatalogTemplate);
    const card = new Card('card', cardElement, actions);
    return card;
}

api.getProductList()
    .then(catalogModel.setProducts.bind(catalogModel))
    .catch((error) => {
        console.error('Ошибка загрузки каталога:', error);
    });
events.on('catalog:changed', () => {
    const products = catalogModel.products;
    page.catalog = products.map(product => {
        const card = createCard(product, {
            onClick: () => events.emit('card:select', product)
        });
        
        card.render({
            id: product.id,
            title: product.title,
            image: product.image,
            category: product.category,
            price: formatPrice(product.price)
        });

        return card.container;
    });
});

events.on('card:select', (product: IProduct) => {
    const card = new Card('card', cloneTemplate(cardPreviewTemplate), {
        onClick: () => {
            if (product.price === null) {
                return;
            }
            
            if (basketModel.contains(product.id)) {
                basketModel.remove(product.id);
            } else {
                basketModel.add(product);
            }
            modal.close();
        }
    });

    const productView: IProductView = {
        id: product.id,
        title: product.title,
        description: product.description,
        price: formatPrice(product.price),
        image: product.image,
        category: product.category,
        button: {
            text: product.price === null 
                ? 'Недоступно' 
                : basketModel.contains(product.id) ? 'Убрать из корзины' : 'В корзину',
            disabled: product.price === null
        }
    };

    modal.render({
        content: card.render(productView)
    });
});

events.on('basket:changed', () => {
    page.counter = basketModel.getCount();
    if (isBasketOpen) {
        renderBasket();
    }
});

events.on('basket:open', () => {
    isBasketOpen = true;
    renderBasket();
    modal.render({ content: basket.container });
});


events.on('order:open', () => {
    modal.render({
        content: order.render({
            valid: false,
            errors: []
        })
    });
});

events.on('order:payment-change', (data: { payment: PaymentMethod }) => {
    orderModel.setPayment(data.payment);
});

events.on('order:change', (data: { field: keyof typeof orderModel.order, value: string }) => {
    if (data.field === 'address') {
        orderModel.setAddress(data.value);
    }

    order.render({
        valid: orderModel.validateOrder(),
        errors: orderModel.getOrderErrors()
    });
});

events.on('order:submit', () => {
    if (orderModel.validateOrder()) {
        modal.render({
            content: contacts.render({
                valid: false,
                errors: []
            })
        });
    }
});

events.on('contacts:change', (data: { field: keyof typeof orderModel.order, value: string }) => {
    if (data.field === 'email') {
        orderModel.setEmail(data.value);
    } else if (data.field === 'phone') {
        orderModel.setPhone(data.value);
    }

    contacts.render({
        valid: orderModel.validateContacts(),
        errors: orderModel.getContactsErrors()
    });
});

events.on('contacts:submit', () => {
    if (orderModel.validateContacts()) {
        const orderData = orderModel.getOrderData(basketModel.getItems(), basketModel.getTotal());
        const orderRequest: ApiOrderRequest = {
            payment: orderData.payment!,
            email: orderData.email!,
            phone: orderData.phone!,
            address: orderData.address!,
            total: orderData.total,
            items: orderData.items.map(item => item.product.id)
        };

        api.orderProducts(orderRequest)
            .then((result) => {
                const success = new Success(cloneTemplate(successTemplate), {
                    onClick: () => {
                        modal.close();
                        basketModel.clear();
                        orderModel.clear();
                    }
                });

                modal.render({
                    content: success.render({ total: result.total })
                });
            })
            .catch((error) => {
                console.error('Ошибка оформления заказа:', error);
            });
    }
});

events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    isBasketOpen = false;
    page.locked = false;
});
