import './scss/styles.scss';

import { Folder } from './components/base/models/Folder';
import { Cart } from './components/base/models/Cart';
import { Buyer } from './components/base/models/Buyer';
import { apiProducts } from './utils/data';
import { Api } from './components/base/Api';
import { ApiServer } from './components/base/models/ApiServer';
import {API_URL} from '../src/utils/constants';

const folderModel = new Folder();
folderModel.setItems(apiProducts.items);
console.log('Массив товаров: ', folderModel.getItems());
console.log('Один товар: ', folderModel.getItemById('854cef69-976d-4c2a-a18c-2aa45046c390'));

const cart = new Cart();
cart.addItem(apiProducts.items[0]);
cart.addItem(apiProducts.items[1]);
console.log('Корзина: ', cart.getItems());
console.log('Итого: ', cart.getTotalPrice());

const buyer = new Buyer();
buyer.setData({ email: 'test@test.ru' });
console.log('Данные покупателя: ', buyer.getData());
console.log('Ошибки валидации: ', buyer.validate());

const api = new Api(API_URL);
const apiServer = new ApiServer(api);

apiServer.getProducts()
  .then((products) => {
    folderModel.setItems(products);
    console.log('Массив товаров (с сервера): ', folderModel.getItems());
  })
  .catch((err) => {
    console.error('Ошибка загрузки каталога:', err);
  });