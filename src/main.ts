import './scss/styles.scss';
import { EventEmitter } from './components/base/events';
import { Gallery } from './components/view/Gallery';
import { Success } from './components/view/Success';
import { Form } from './components/view/forms/Form';
import { BasketCard } from './components/view/cards/BasketCard';
import { PreviewCard } from './components/view/cards/PreviewCard';
import { Header } from './components/view/Header';
import { cloneTemplate } from './utils/utils';
import { IProduct, TPayment } from './types';
import { selectors, API_URL, CDN_URL } from './utils/constants';
import { CatalogModel } from './components/CatalogModel';

const events = new EventEmitter();
const model = new CatalogModel(events);

const headerEl = document.querySelector('.header') as HTMLElement;
const header = new Header(headerEl, events);

const galleryEl = document.querySelector('.gallery') as HTMLElement;
const gallery = new Gallery(galleryEl, events);

const modalContainer = document.querySelector('#modal-container') as HTMLElement;
const modalContent = modalContainer.querySelector('.modal__content') as HTMLElement;

const modalClose = modalContainer.querySelector<HTMLButtonElement>('.modal__close');
modalClose?.addEventListener('click', () => {
	modalContainer.classList.remove('modal_active');
	modalContent.innerHTML = '';
});

const successModal = new Success(modalContainer, events);

function openModalWith(node: Node) {
	modalContent.innerHTML = '';
	modalContent.appendChild(node);
	modalContainer.classList.add('modal_active');
}

function normalizeId(id: unknown): string {
	if (id && typeof id === 'object' && '$oid' in (id as any)) {
		return (id as any)['$oid'];
	}
	return String(id);
}

events.on('model:products-changed', ({ products }: { products: IProduct[] }) => {
	gallery.renderProducts(products);
});

events.on('model:selected-product-changed', ({ product }: { product: IProduct | null }) => {
	if (!product) return;

	const template = cloneTemplate<HTMLDivElement>(selectors.cardPreview);
	const preview = new PreviewCard(template, events);

	preview.setData({
		title: product.title,
		category: product.category,
		text: product.description || '',
		price: product.price !== null ? `${product.price} синапсов` : '',
		image: product.image || '',
	});

	preview['_button'].addEventListener('click', () => {
		if (product.price !== null) model.addToBasket(product);
		modalContainer.classList.remove('modal_active');
	});

	openModalWith(preview.render());
});

function renderBasket() {
	const basket = model.getBasket();
	header.setCounter(basket.length);

	const basketTemplate = cloneTemplate<HTMLDivElement>(selectors.basket);
	const basketList = basketTemplate.querySelector('.basket__list') as HTMLElement;
	const totalPriceEl = basketTemplate.querySelector('.basket__price') as HTMLElement;

	basketList.innerHTML = '';
	let total = 0;

	basket.forEach((product, index) => {
		const itemTemplate = cloneTemplate<HTMLLIElement>(selectors.cardBasket);
		const basketCard = new BasketCard(itemTemplate, events);
		basketCard.setData(product.title, `${product.price ?? 0} синапсов`);
		basketCard.setIndex(index + 1);

		basketCard['_deleteButton'].addEventListener('click', () => {
			model.removeFromBasket(index);
			renderBasket();
		});

		basketList.appendChild(basketCard.render());
		total += product.price ?? 0;
	});

	totalPriceEl.textContent = `${total} синапсов`;

	const orderBtn = basketTemplate.querySelector<HTMLButtonElement>('.basket__button');
	if (orderBtn) orderBtn.addEventListener('click', openOrderForm);

	openModalWith(basketTemplate);
}

events.on('header:cart-open', renderBasket);
events.on('model:basket-changed', renderBasket);

function openOrderForm() {
	const orderTemplate = document.querySelector<HTMLTemplateElement>(selectors.order);
	if (!orderTemplate) return;

	const fragment = orderTemplate.content.cloneNode(true) as DocumentFragment;
	const form = fragment.querySelector<HTMLFormElement>('form[name="order"]')!;
	new Form(form, events);

	const orderButton = form.querySelector<HTMLButtonElement>('.order__button')!;
	const addressInput = form.querySelector<HTMLInputElement>('input[name="address"]')!;
	const paymentHidden =
		form.querySelector<HTMLInputElement>('input[name="payment"]') ||
		(() => {
			const inp = document.createElement('input');
			inp.type = 'hidden';
			inp.name = 'payment';
			inp.value = 'card';
			form.appendChild(inp);
			return inp;
		})();

	const paymentButtons = form.querySelectorAll<HTMLButtonElement>('.order__buttons button');
	paymentButtons.forEach(btn => {
		btn.addEventListener('click', () => {
			paymentButtons.forEach(b => b.classList.remove('active'));
			btn.classList.add('active');
			paymentHidden.value = btn.getAttribute('name') || 'card';
			orderButton.disabled = addressInput.value.trim() === '';
		});
	});

	orderButton.disabled = true;
	addressInput.addEventListener('input', () => {
		orderButton.disabled = addressInput.value.trim() === '';
	});

	openModalWith(fragment);
}

events.on('card:click', ({ element }: { element: HTMLElement }) => {
	const cardEl = element.closest('.card') as HTMLElement | null;
	const productId = cardEl?.dataset.id;
	if (!productId) return;

	const product = model.getProductById(productId);
	if (product) model.setSelectedProduct(product);
});

events.on('form:submit', async ({ form }: { form: HTMLFormElement }) => {
	const name = form.getAttribute('name');

	if (name === 'order') {
		const fd = new FormData(form);
		model.setBuyer({
			payment: (fd.get('payment') as TPayment) || 'card',
			address: (fd.get('address') as string) || '',
		});

		const contactsTemplate = document.querySelector<HTMLTemplateElement>(selectors.contacts)!;
		const contactsFragment = contactsTemplate.content.cloneNode(true) as DocumentFragment;
		const contactsForm = contactsFragment.querySelector<HTMLFormElement>('form[name="contacts"]')!;
		new Form(contactsForm, events);

		const btn = contactsForm.querySelector<HTMLButtonElement>('[type="submit"]')!;
		const emailInput = contactsForm.querySelector<HTMLInputElement>('input[name="email"]')!;
		const phoneInput = contactsForm.querySelector<HTMLInputElement>('input[name="phone"]')!;

		const validate = () => (btn.disabled = !emailInput.value.trim() || !phoneInput.value.trim());
		emailInput.addEventListener('input', validate);
		phoneInput.addEventListener('input', validate);
		validate();

		openModalWith(contactsFragment);
		return;
	}

	if (name === 'contacts') {
		const fd = new FormData(form);
		const buyer = model.getBuyer();
		const email = (fd.get('email') as string) || '';
		const phone = (fd.get('phone') as string) || '';
		const payment = buyer.payment || 'card';
		const address = buyer.address || '';

		const items = model.getBasket().map(p => ({
			id: normalizeId(p.id),
			price: p.price ?? 0,
		}));
		const total = items.reduce((s, i) => s + (i.price ?? 0), 0);

		const order = { payment, email, phone, address, total, items };
		console.log('Отправка заказа:', order);

		try {
			const res = await fetch(`${API_URL}/order`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(order),
			});
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Ошибка при оформлении заказа: ${res.status} ${text}`);
			}
			const data = await res.json();
			const paid = data?.total ?? total;
			successModal.open(`Списано ${paid} синапсов`);
			model.clearBasket();
			modalContainer.classList.remove('modal_active');
		} catch (err) {
			console.error(err);
		}
	}
});

async function loadProducts() {
	try {
		const res = await fetch(`${API_URL}/product`);
		if (!res.ok) throw new Error('Ошибка при загрузке продуктов');
		const data = await res.json();
		const products: IProduct[] = Array.isArray(data.items) ? data.items : [];

		products.forEach(p => {
			p.id = normalizeId(p.id);
			if (p.image) {
				p.image = `${CDN_URL}/${p.image.replace(/^\/+/, '')}`;
			}
		});

		model.setProducts(products);
	} catch (e) {
		console.error(e);
	}
}
loadProducts();
