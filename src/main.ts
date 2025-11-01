import './scss/styles.scss';
import { EventEmitter } from './components/base/Events';
import { Api } from './components/base/Api';
import { ApiServer } from './components/base/models/ApiServer';
import { CatalogModel } from './components/CatalogModel';
import { Header } from './components/view/Header';
import { Gallery } from './components/view/Gallery';
import { Modal } from './components/view/Modal';
import { Success } from './components/view/Success';
import { AppPresenter } from './components/AppPresenter';
import { API_URL } from './utils/constants';
import { ensureElement } from './utils/utils';

const events = new EventEmitter();
const api = new Api(API_URL);
const apiServer = new ApiServer(api);
const model = new CatalogModel(events);

const header = new Header(ensureElement<HTMLElement>('.header'), events);
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'), events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const success = new Success(events);

const presenter = new AppPresenter(events, model, apiServer, {
  header,
  gallery,
  modal,
  success,
});
void presenter.init();