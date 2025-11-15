import './scss/styles.scss';

import { EventEmitter } from './components/base/Events';
import { ProductModel } from './components/models/ProductModel';
import { CartModel } from './components/models/CartModel';
import { BuyerModel } from './components/models/BuyerModel';
import { AppApi } from './components/AppApi';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';
import { cloneTemplate, ensureElement } from './utils/utils';
import { HeaderView } from './components/views/HeaderView';
import { GalleryView } from './components/views/GalleryView';
import { IOrder, IProduct, PaymentMethod } from './types';
import { ModalView } from './components/views/ModalView';
import { ProductPreviewView } from './components/views/Card/ProductCardPreviewView';
import { BasketView } from './components/views/BasketView';
import { OrderView } from './components/views/OrderView';
import { ContactsView } from './components/views/ContactsView';
import { SuccessView } from './components/views/SuccessView';
import { ProductCardView } from './components/views/Card/ProductCardView';
import { BasketItemView } from './components/views/BasketItemView';


// Создаём экземпляры моделей
const events = new EventEmitter();
const productModel = new ProductModel(events);
const cartModel = new CartModel(events);
const buyerModel = new BuyerModel(events);

// Создаём API
const baseApi = new Api(API_URL);
const api = new AppApi(baseApi);

// Определяем шаблоны
const templateCard = ensureElement('#card-catalog') as HTMLTemplateElement;
const templateCardPreview = ensureElement('#card-preview') as HTMLTemplateElement;
const templateOrder = ensureElement('#order') as HTMLTemplateElement;
const templateContacts = ensureElement('#contacts') as HTMLTemplateElement;
const templateBasketItem = ensureElement('#card-basket') as HTMLTemplateElement;
const templateBasket = ensureElement('#basket') as HTMLTemplateElement;
const templateSuccess = ensureElement('#success') as HTMLTemplateElement;

// Создаём представления
const views = {
	header: new HeaderView(events, ensureElement('.header')),
	gallery: new GalleryView(events, ensureElement(".gallery"), productModel),
	modal: new ModalView(events, ensureElement('#modal-container')),
	preview: new ProductPreviewView(events, cloneTemplate(templateCardPreview)),
	order: new OrderView(events, cloneTemplate(templateOrder)),
	contacts: new ContactsView(events, cloneTemplate(templateContacts)),
	basket: new BasketView(events, cloneTemplate(templateBasket)),
	success: new SuccessView(events, cloneTemplate(templateSuccess)),
	createCard: (): ProductCardView => {
		return new ProductCardView(events, cloneTemplate(templateCard));
	},
	createBasketItem: (): BasketItemView => {
		return new BasketItemView(events, cloneTemplate(templateBasketItem));
	}
}

// Подписываемся на изменение списка товаров
events.on('products:changed', () => {
	const products = productModel.getItems();

	const items = products.map((product) => {
		const cardElement = views.createCard().render(product);

		cardElement.addEventListener('click', () => {
			events.emit('card:select', { product });
		});
		return cardElement
	});
	views.gallery.render({ items });
});

// Подписываемся на выбор товара для открытия превью
events.on('card:select', (data: { product: IProduct }) => {
	const product = data.product;
	productModel.setSelectedProduct(product);
	const inBasket = cartModel.hasItem(product.id);
	views.preview.inBasket = inBasket;

	if (product.price === null) {
		views.preview.setButtonDisabled(true);
		views.preview.setButtonText('Недоступно');
	} else {
		views.preview.setButtonDisabled(false);
	}
	// Открываем модальное окно с превью
	const content = views.preview.render(product);
	views.modal.render({ content });
	views.modal.open();
});

// Подписываемся на клик по кнопке в превью
events.on('product:toggle-cart', () => {
	const product = productModel.getSelectedProduct();
	if (product) {
		if (cartModel.hasItem(product.id)) {
			cartModel.removeItem(product.id);
		} else {
			cartModel.addItem(product);
		}
		views.modal.close();
	}
});

function cartUpdate(): HTMLElement {
	const products = cartModel.getItems();

	const items = products.map((product, index) => {
		const basketItem = views.createBasketItem().render({
			...product,
			index: index + 1
		});
		return basketItem;
	});

	const total = cartModel.getTotal();
	const content = views.basket.render({
		items,
		total,
		isEmpty: items.length === 0
	});
	return content
}

// Подписываемся на открытие корзины
events.on('basket:open', () => {
	const content = cartUpdate();
	views.modal.render({ content });
	views.modal.open();
});

// Подписываемся на удаление товара из корзины
events.on('basket:item-remove', (data: { id: string }) => {
	cartModel.removeItem(data.id);
});

// Подписываемся на оформление заказа
events.on('basket:checkout', () => {
	const data = buyerModel.getData();
	const content = views.order.render(data);

	views.modal.render({ content });
	views.modal.open();
});

// Подписываемся на изменения в корзине
events.on('cart:change', () => {
	views.header.counter = cartModel.getCount();
	const content = cartUpdate();
	views.modal.render({ content });
});

// Обработчики для первого шага
events.on('order:payment-change', (data: { payment: string }) => {
	buyerModel.setData({ payment: data.payment });
});

events.on('order:address-change', (data: { address: string }) => {
	buyerModel.setData({ address: data.address });
});

// Обработчики для второго шага
events.on('contacts:email-change', (data: { email: string }) => {
	buyerModel.setData({ email: data.email });
});

events.on('contacts:phone-change', (data: { phone: string }) => {
	buyerModel.setData({ phone: data.phone });
});

// Обработчик события изменения данных покупателя
events.on('buyer:data-change', () => {
	const data = buyerModel.getData();
	const allErrors = buyerModel.validate();

	// Фильтруем ошибки для формы заказа
	const orderErrors = {
		payment: allErrors.payment,
		address: allErrors.address
	};

	// Фильтруем ошибки для формы контактов
	const contactsErrors = {
		email: allErrors.email,
		phone: allErrors.phone
	};

	// Обновляем форму заказа
	views.order.render({
		...data,
		errors: Object.values(orderErrors).filter(Boolean).join(', '),
		valid: !orderErrors.payment && !orderErrors.address
	});

	// Обновляем форму контактов
	views.contacts.render({
		...data,
		errors: Object.values(contactsErrors).filter(Boolean).join(', '),
		valid: !contactsErrors.email && !contactsErrors.phone
	});
});

events.on('order:submit', () => {
	const data = buyerModel.getData();
	const content = views.contacts.render(data);
	views.modal.render({ content })
});

events.on('contacts:submit', () => {
	const buyerData = buyerModel.getData();
	const paymentMethod = buyerData.payment as PaymentMethod;

	const orderData: IOrder = {
		payment: paymentMethod,
		email: buyerData.email!,
		phone: buyerData.phone!,
		address: buyerData.address!,
		items: cartModel.getItems().map(item => item.id),
		total: cartModel.getTotal()
	};

	api.createOrder(orderData).then((response) => {
		const total = response.total;
		cartModel.clear();
		buyerModel.clear();

		const content = views.success.render({ total });
		views.modal.render({ content });
	}).catch(error => {
		console.error('Ошибка оформления заказа:', error);
		alert('Ошибка отправки заказа. Проверьте интернет соединение')
	});
});

// Обработчик закрытия успешного окна
events.on('success:close', () => {
	views.modal.close();
});

// -------------------------------------------------------

// Загружаем товары и инициализируем приложение
async function initApp() {
	try {
		const products = await api.getProductList();
		productModel.setItems(products);
	} catch (error) {
		console.error('Ошибка загрузки товаров:', error);
		const { apiProducts } = await import('./utils/data');
		productModel.setItems(apiProducts.items);
	}
}

// Запускаем приложение
initApp();