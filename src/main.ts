import './scss/styles.scss';
import { IProduct } from './types';
import { CartView } from './components/base/models/views/CartView';
import { CardSmallView } from './components/base/models/views/CardSmallView';
import { CardLargeView } from './components/base/models/views/CardLargeView';
import { ModalView } from './components/base/models/views/ModalView';

// --- Мок-данные для каталога ---
const mockProducts: IProduct[] = [
  { id: '1', title: 'Товар 1', description: 'Описание 1', image: 'img1.jpg', category: 'софт-скил', price: 100 },
  { id: '2', title: 'Товар 2', description: 'Описание 2', image: 'img2.jpg', category: 'хард-скил', price: 200 },
  { id: '3', title: 'Товар 3', description: 'Описание 3', image: 'img3.jpg', category: 'другое', price: 300 },
];

// --- Инициализация модалки и корзины ---
const modalView = new ModalView('.modal');
const cartView = new CartView('.cart-list');

let cartItems: IProduct[] = [];

// --- Функция рендера каталога ---
function renderCatalog(products: IProduct[]) {
  const gallery = document.querySelector('.gallery')!;
  gallery.innerHTML = '';

  products.forEach(product => {
    const card = new CardSmallView(product);
    const node = card.render();

    card.setEventListeners(
      (p) => { // добавить в корзину
        cartItems.push(p);
        cartView.update(cartItems);
        updateCartCounter();
      },
      (p) => { // открыть модалку
        const largeCard = new CardLargeView(p);
        modalView.open(largeCard.render());
      }
    );

    gallery.appendChild(node);
  });
}

// --- Обновление счётчика корзины ---
function updateCartCounter() {
  const counter = document.querySelector('.header__basket-counter')!;
  counter.textContent = cartItems.length.toString();
}

// --- Событие удаления из корзины ---
document.addEventListener('cart:remove', (ev: Event) => {
  const item = (ev as CustomEvent<IProduct>).detail;
  cartItems = cartItems.filter(p => p.id !== item.id);
  cartView.update(cartItems);
  updateCartCounter();
});

// --- Кнопка открытия корзины ---
document.querySelector('.header__basket')?.addEventListener('click', () => {
  modalView.open(cartView.getContent());
});

// --- Рендерим каталог с мок-данными ---
document.addEventListener('DOMContentLoaded', () => {
  renderCatalog(mockProducts);
});
